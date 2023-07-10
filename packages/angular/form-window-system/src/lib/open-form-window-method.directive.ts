import {
  Directive,
  EventEmitter,
  HostListener,
  Inject,
  Injector,
  INJECTOR,
  Input,
  OnDestroy,
  Optional,
  Output,
  StaticProvider,
} from '@angular/core';
import {coerceBoolean} from '@rxap/utilities';
import {WindowRef} from '@rxap/window-system';
import {FormDefinition} from '@rxap/forms';
import {CounterSubject} from '@rxap/rxjs';
import {Method} from '@rxap/pattern';

@Directive({
  selector: '[rxapOpenFormWindowMethod]',
  standalone: true,
})
export class OpenFormWindowMethodDirective<
  FormData extends Record<string, any> = Record<string, any>,
  Initial extends Partial<Record<string, any>> = Partial<Record<string, any>>>
  implements OnDestroy {

  @Input('rxapOpenFormWindowMethod')
  public method!: Method<WindowRef<FormDefinition, FormData>, Initial>;

  @Input()
  public initial?: Initial;

  // eslint-disable-next-line @angular-eslint/no-output-rename
  @Output('failure')
  public failure$ = new EventEmitter<Error>();

  // eslint-disable-next-line @angular-eslint/no-output-rename
  @Output('completed')
  public completed$ = new EventEmitter();

  // eslint-disable-next-line @angular-eslint/no-output-rename
  @Output('submitted')
  public submitted$ = new EventEmitter<FormData>();
  /**
   * true - a remote method call is in progress
   */
  public executing$ = new CounterSubject(0);
  @Input()
  public providers?: StaticProvider[];
  /**
   * Set of all active window ref instances.
   *
   * Used to distory all windows of the directive is
   * destroyed
   * @protected
   */
  protected _windowRefInstance = new Set<WindowRef<FormDefinition, FormData>>();

  constructor(
    @Optional()
    @Inject(INJECTOR)
    private readonly injector: Injector | null = null,
  ) {
  }

  private _hasConfirmDirective = false;

  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('rxapConfirm')
  public set hasConfirmDirective(value: any) {
    this._hasConfirmDirective = coerceBoolean(value);
  }

  public ngOnDestroy() {
    this._windowRefInstance.forEach(windowRef => windowRef.complete());
  }

  @HostListener('confirmed')
  public onConfirmed() {
    this.execute();
  }

  @HostListener('click')
  public onClick() {
    if (!this._hasConfirmDirective) {
      this.execute();
    } else {
      console.debug('skip remote method call. Wait for confirmation.');
    }
  }

  public execute(): void {
    this.executing$.increase();

    const windowRef = this.method.call(this.initial, {
      providers: this.providers,
      injector: this.injector,
    }) as WindowRef<FormDefinition, FormData>;

    windowRef.subscribe(
      (value) => this.submitted(value),
      (error) => this.failure(error),
      () => {
        this.completed();
        this.executing$.decrease();
        this._windowRefInstance.delete(windowRef);
      },
    );
  }

  protected submitted(value: FormData) {
    this.submitted$.emit(value);
  }

  protected failure(error: Error): void {
    this.failure$.emit(error);
  }

  protected completed(): void {
    this.completed$.emit();
  }

}


