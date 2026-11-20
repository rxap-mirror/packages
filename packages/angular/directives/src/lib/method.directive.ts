import { Directive, isDevMode, OnInit, input, output, linkedSignal } from '@angular/core';
import { coerceBoolean } from '@rxap/utilities';
import { ToggleSubject } from '@rxap/rxjs';
import { Method } from '@rxap/pattern';

@Directive({
  selector: '[rxapMethod]',
  exportAs: 'rxapMethod',
  standalone: true,
  host: {
    '(confirmed)': 'onConfirmed()',
    '(click)': 'onClick()',
  },
})
export class MethodDirective<ReturnType = any, Parameters = any> implements OnInit {

  public readonly method = input.required<Method<ReturnType, Parameters>>({ alias: "rxapMethod" });
  public readonly parameters = input<Parameters>();
  protected readonly currentParameters = linkedSignal(() => this.parameters());
  public readonly immediately = input(false);
  public readonly executed$ = output({ alias: 'executed' });
  public readonly failure$ = output<Error>({ alias: 'failure' });
  public readonly successful$ = output<ReturnType>({ alias: 'successful' });
  /**
   * true - a remote method call is in progress
   */
  public executing$ = new ToggleSubject();

  public readonly hasConfirmDirective = input(false, { alias: 'rxapConfirm', transform: coerceBoolean });

  public ngOnInit() {
    if (this.immediately()) {
      this.execute();
    }
  }

  public onConfirmed() {
    return this.execute();
  }

  public onClick() {
    if (!this.hasConfirmDirective()) {
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
      const result = await this.method().call(this.currentParameters());
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
    this.currentParameters.set({ ...(this.currentParameters() ?? {}), ...parameters } as any);
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


