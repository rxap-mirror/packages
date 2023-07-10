import {
  Directive,
  EventEmitter,
  HostListener,
  Input,
  isDevMode,
  OnInit,
  Output,
} from '@angular/core';
import { coerceBoolean } from '@rxap/utilities';
import { ToggleSubject } from '@rxap/rxjs';
import { Method } from '@rxap/pattern';

@Directive({
  selector: '[rxapMethod]',
  exportAs: 'rxapMethod',
  standalone: true,
})
export class MethodDirective<ReturnType = any, Parameters = any> implements OnInit {

  @Input('rxapMethod')
  public method!: Method<ReturnType, Parameters>;
  @Input()
  public parameters?: Parameters;
  @Input()
  public immediately = false;
  @Output('executed')
  public executed$ = new EventEmitter();
  @Output('failure')
  public failure$ = new EventEmitter<Error>();
  @Output('successful')
  public successful$ = new EventEmitter<ReturnType>();
  /**
   * true - a remote method call is in progress
   */
  public executing$ = new ToggleSubject();

  private _hasConfirmDirective = false;

  @Input('rxapConfirm')
  public set hasConfirmDirective(value: any) {
    this._hasConfirmDirective = coerceBoolean(value);
  }

  public ngOnInit() {
    if (this.immediately) {
      this.execute();
    }
  }

  @HostListener('confirmed')
  public onConfirmed() {
    return this.execute();
  }

  @HostListener('click')
  public onClick() {
    if (!this._hasConfirmDirective) {
      return this.execute();
    } else {
      if (isDevMode()) {
        console.debug('Skip method call. Wait for confirmation.');
      }
    }
    return Promise.resolve();
  }

  public async execute(): Promise<void> {
    this.executing$.enable();
    try {
      const result = await this.method.call(this.parameters);
      this.executed(result);
      this.successful(result);
    } catch (error: any) {
      if (isDevMode()) {
        console.error(`Method directive execution failed:`, error.message);
      }
      this.failure(error);
    } finally {
      this.executing$.disable();
    }
  }

  public setParameter<Key extends keyof Parameters>(parameterKey: Key, value: Parameters[Key]): void {
    this.updateParameters({ [parameterKey]: value } as any);
  }

  public updateParameters(parameters: Partial<Parameters>): void {
    this.parameters = { ...(this.parameters ?? {}), ...parameters } as any;
  }

  protected executed(result: any) {
    this.executed$.emit(result);
  }

  protected failure(error: Error) {
    this.failure$.emit(error);
  }

  protected successful(result: ReturnType) {
    this.successful$.emit(result);
  }

}


