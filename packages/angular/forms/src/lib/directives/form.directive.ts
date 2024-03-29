import {
  ChangeDetectorRef,
  Directive,
  EventEmitter,
  forwardRef,
  HostBinding,
  Inject,
  Input,
  isDevMode,
  OnChanges,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  SimpleChanges,
  SkipSelf,
} from '@angular/core';
import {
  ControlContainer,
  FormGroupDirective,
} from '@angular/forms';
import {
  RXAP_FORM_DEFINITION,
  RXAP_FORM_DEFINITION_BUILDER,
  RXAP_FORM_LOAD_FAILED_METHOD,
  RXAP_FORM_LOAD_METHOD,
  RXAP_FORM_LOAD_SUCCESSFUL_METHOD,
  RXAP_FORM_SUBMIT_FAILED_METHOD,
  RXAP_FORM_SUBMIT_METHOD,
  RXAP_FORM_SUBMIT_SUCCESSFUL_METHOD,
} from './tokens';
import { RxapFormGroup } from '../form-group';
import {
  clone,
  isObject,
  isPromise,
  Required,
} from '@rxap/utilities';
import { FormDefinition } from '../model';
import {
  FormLoadFailedMethod,
  FormLoadMethod,
  FormLoadSuccessfulMethod,
  FormSubmitFailedMethod,
  FormSubmitMethod,
  FormSubmitSuccessfulMethod,
} from './models';
import {
  BehaviorSubject,
  Subscription,
} from 'rxjs';
import { RxapFormBuilder } from '../form-builder';
import { LoadingIndicatorService } from '@rxap/services';
import {
  debounceTime,
  filter,
  tap,
} from 'rxjs/operators';
import { ToggleSubject } from '@rxap/rxjs';

@Directive({
  selector: 'form[rxapForm]:not([formGroup]):not([ngForm]),rxap-form,form[rxapForm]',
  providers: [
    {
      provide: ControlContainer,
      // ignore coverage
      useExisting: forwardRef(() => FormDirective),
    },
    // region form provider clear
    // form provider that are directly associated with the current form
    // are cleared to prevent that inner forms can access this providers
    // Example: The parent form has a submit method provider and the inner should
    // not have a submit method provider. If the parent submit method provider is
    // not cleared then the inner form uses the parent submit method provider on
    // submit
    {
      provide: RXAP_FORM_SUBMIT_METHOD,
      useValue: null,
    },
    {
      provide: RXAP_FORM_LOAD_METHOD,
      useValue: null,
    },
    {
      provide: RXAP_FORM_LOAD_FAILED_METHOD,
      useValue: null,
    },
    {
      provide: RXAP_FORM_LOAD_SUCCESSFUL_METHOD,
      useValue: null,
    },
    {
      provide: RXAP_FORM_SUBMIT_FAILED_METHOD,
      useValue: null,
    },
    {
      provide: RXAP_FORM_SUBMIT_SUCCESSFUL_METHOD,
      useValue: null,
    },
    {
      provide: RXAP_FORM_DEFINITION_BUILDER,
      useValue: null,
    },
    // endregion
  ],
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: { '(reset)': 'onReset()' },
  // eslint-disable-next-line @angular-eslint/no-outputs-metadata-property
  outputs: [ 'ngSubmit' ],
  exportAs: 'rxapForm',
  standalone: true,
})
export class FormDirective<T = any>
  extends FormGroupDirective
  implements OnInit, OnChanges, OnDestroy {
  public override form!: RxapFormGroup<T>;

  @Input()
  public initial?: T;

  /**
   * Emits when the submit method is executed without errors. The result of the
   * submit method is passed as event object.
   *
   * If no submit method is defined then emit after the submit button
   * is clicked.
   */
  @Output()
  public rxapSubmit = new EventEmitter();

  @Output()
  public invalidSubmit = new EventEmitter<Record<string, any>>();

  // eslint-disable-next-line @angular-eslint/no-output-rename
  @Output('submitSuccessful')
  public submitSuccessful$ = new EventEmitter();

  @HostBinding('class.rxap-submitting')
  public get submitting(): boolean {
    return this.submitting$.value;
  }

  @HostBinding('class.rxap-submit-error')
  public get submitError(): Error | null {
    return this.submitError$.value;
  }

  @HostBinding('class.rxap-loading')
  public get loading(): boolean {
    return this.loading$.value;
  }

  @HostBinding('class.rxap-loaded')
  public get loaded(): boolean {
    return this.loaded$.value;
  }

  @HostBinding('class.rxap-loading-error')
  public get loadingError(): Error | null {
    return this.loadingError$.value;
  }

  @Input('rxapForm')
  public set useFormDefinition(value: FormDefinition<T> | '') {
    if (value) {
      this._formDefinition = value as any;
      this.form = value.rxapFormGroup;
    }
  }

  public get formDefinition(): FormDefinition<T> {
    return this._formDefinition;
  }

  public readonly submitting$ = new ToggleSubject();
  public readonly submitError$ = new BehaviorSubject<Error | null>(null);
  public readonly loading$ = new ToggleSubject();
  public readonly loaded$ = new ToggleSubject();
  public readonly loadingError$ = new BehaviorSubject<Error | null>(null);

  protected _formDefinition!: FormDefinition<T>;

  @Input()
  public submitMethod: FormSubmitMethod<any> | null = null;

  private _autoSubmitSubscription = new Subscription();

  constructor(
    @Inject(ChangeDetectorRef) public readonly cdr: ChangeDetectorRef,
    @Optional()
    @Inject(RXAP_FORM_DEFINITION)
      formDefinition: FormDefinition | null = null,
    // skip self, bc the token is set to null
    @SkipSelf()
    @Optional()
    @Inject(RXAP_FORM_SUBMIT_METHOD)
      submitMethod: FormSubmitMethod<any> | null = null,
    // skip self, bc the token is set to null
    @SkipSelf()
    @Optional()
    @Inject(RXAP_FORM_LOAD_METHOD)
    protected readonly loadMethod: FormLoadMethod | null = null,
    // skip self, bc the token is set to null
    @SkipSelf()
    @Optional()
    @Inject(RXAP_FORM_LOAD_FAILED_METHOD)
    protected readonly loadFailedMethod: FormLoadFailedMethod | null = null,
    // skip self, bc the token is set to null
    @SkipSelf()
    @Optional()
    @Inject(RXAP_FORM_LOAD_SUCCESSFUL_METHOD)
    protected readonly loadSuccessfulMethod: FormLoadSuccessfulMethod | null = null,
    // skip self, bc the token is set to null
    @SkipSelf()
    @Optional()
    @Inject(RXAP_FORM_SUBMIT_FAILED_METHOD)
    protected readonly submitFailedMethod: FormSubmitFailedMethod | null = null,
    // skip self, bc the token is set to null
    @SkipSelf()
    @Optional()
    @Inject(RXAP_FORM_SUBMIT_SUCCESSFUL_METHOD)
    protected readonly submitSuccessfulMethod: FormSubmitSuccessfulMethod | null = null,
    // skip self, bc the token is set to null
    @SkipSelf()
    @Optional()
    @Inject(RXAP_FORM_DEFINITION_BUILDER)
    protected readonly formDefinitionBuilder: RxapFormBuilder | null = null,
    @Optional()
    @Inject(LoadingIndicatorService)
    protected readonly loadingIndicatorService: LoadingIndicatorService | null = null,
  ) {
    super([], []);
    if (submitMethod) {
      this.submitMethod = submitMethod;
    }
    if (!formDefinition && formDefinitionBuilder) {
      formDefinition = formDefinitionBuilder.build<FormDefinition>();
    }
    if (formDefinition) {
      this._formDefinition = formDefinition;
      this.form = formDefinition.rxapFormGroup;
    }
    this.loadingIndicatorService?.attachLoading(this.loading$);
    this.loadingIndicatorService?.attachLoading(this.submitting$);
  }

  public override ngOnChanges(changes: SimpleChanges) {
    super.ngOnChanges(changes);

    const formChange = changes['form'];

    if (formChange && !formChange.firstChange) {
      this.loadInitialState(formChange.currentValue);
    }
  }

  public ngOnInit() {
    if (!this._formDefinition) {
      // TODO : replace with rxap error
      throw new Error('The form definition instance is not defined');
    }
    if (!this.form) {
      // TODO : replace with rxap error
      throw new Error('The form instance is not defined');
    }
    this.loadInitialState(this.form);

    function HasNgOnInitMethod(obj: any): obj is OnInit {
      return obj && typeof obj.ngOnInit === 'function';
    }

    if (HasNgOnInitMethod(this._formDefinition)) {
      this._formDefinition.ngOnInit();
    }

    if (this._formDefinition.rxapMetadata.autoSubmit) {
      const debounce =
        typeof this._formDefinition.rxapMetadata.autoSubmit === 'number'
          ? this._formDefinition.rxapMetadata.autoSubmit
          : 5000;
      this._autoSubmitSubscription = this
        .form
        .valueChanges
        .pipe(
          debounceTime(debounce),
          filter(() => this.form.valid),
          tap((value) => {
              if (isDevMode()) {
                console.debug(
                  `Auto submit form '${ this._formDefinition.rxapMetadata.id }'`,
                  value,
                );
              }
            },
          ),
          tap(() => this.submit()),
        )
        .subscribe();
    }
  }

  public override onSubmit($event: Event): boolean {
    $event.preventDefault();
    super.onSubmit($event);
    if (this.form.valid) {
      this.submit();
    } else {

      // eslint-disable-next-line no-inner-declarations
      function reduceErrors(control: any, errors: Record<string, any> = {}): Record<string, any> {

        if (control.invalid) {
          if (control.controls) {
            if (Array.isArray(control.controls)) {
              const errorList = [];
              for (const item of control.controls) {
                errorList.push(reduceErrors(item));
              }
              errors[control.controlId] = errorList;
            } else {
              const innerErrors = {};
              for (const child of Object.values(control.controls)) {
                reduceErrors(child, innerErrors);
              }
              errors[control.controlId] = innerErrors;
            }
          } else {
            if (control.errors) {
              errors[control.controlId] = control.errors;
            }
          }
        }

        return errors;
      }

      if (isDevMode()) {
        console.log(
          'Form submit is not valid for: ' + this.form.controlId,
          this.form.errors,
        );

        // eslint-disable-next-line no-inner-declarations
        function printErrorControls(control: any) {
          if (!control.valid) {
            console.group(control.controlId);
            if (control.controls) {
              if (Array.isArray(control.controls)) {
                for (let i = 0; i < control.controls.length; i++) {
                  const child = control.controls[i];
                  if (!child.valid) {
                    console.group(`index: ${ i }`);
                    printErrorControls(child);
                    console.groupEnd();
                  }
                }
              } else {
                for (const child of Object.values(control.controls)) {
                  printErrorControls(child);
                }
              }
            } else {
              if (control.errors) {
                for (const [ key, value ] of Object.entries(control.errors)) {
                  console.group(key);
                  console.log(value);
                  console.groupEnd();
                }
              }
              console.log('value: ', control.value);
            }
            console.groupEnd();
          }
        }

        printErrorControls(this.form);
      }
      this.invalidSubmit.emit(reduceErrors(this.form));
    }

    return false;
  }

  protected loadInitialState(form: RxapFormGroup): void {
    if (this.initial) {
      if (isDevMode()) {
        console.log('use the value from input initial');
      }
      form.patchValue(this.initial);
    } else {
      if (this.loadMethod) {
        this.loading$.enable();

        try {
          const resultOrPromise = this.loadMethod.call();
          if (isPromise(resultOrPromise)) {
            resultOrPromise
              .then((value) => {
                form.patchValue(value);
                this.loaded$.enable();
                this.loadSuccessful(value);
              })
              .catch((error) => {
                this.loadingError$.next(error);
                this.loadFailed(error);
              })
              .finally(() => {
                this.loading$.disable();
                this.cdr.detectChanges();
              });
          } else if (isObject(resultOrPromise)) {
            form.patchValue(resultOrPromise);
            this.loaded$.enable();
            this.loadSuccessful(resultOrPromise);
            this.loading$.disable();
          }
        } catch (error: any) {
          this.loaded$.disable();
          this.loadingError$.next(error);
          this.loadFailed(error);
          this.loading$.disable();
        }
      } else {
        if (isDevMode()) {
          console.warn(
            'The form loading method is not defined for: ' + this.form.controlId,
          );
        }
        this.loaded$.enable();
      }
    }
  }

  protected loadSuccessful(value: any) {
    if (this.loadSuccessfulMethod) {
      this.loadSuccessfulMethod.call(value);
    } else if (isDevMode()) {
      console.warn(
        'The load successful is not defined for: ' + this.form.controlId,
      );
    }
  }

  protected loadFailed(error: Error) {
    console.debug('Load Error:', error);
    console.error('Load Error:', error.message);
    if (this.loadFailedMethod) {
      this.loadFailedMethod?.call(error);
    } else if (isDevMode()) {
      console.warn('The form loading failed for: ' + this.form.controlId);
    }
  }

  protected getSubmitValue(): T {
    let value: T = undefined as any;

    if (typeof this._formDefinition['getSubmitValue'] === 'function') {
      value = this._formDefinition.getSubmitValue();
    } else if (typeof this._formDefinition['toJSON'] === 'function') {
      value = this._formDefinition.toJSON();
    }

    value = value ?? this.form.value;

    return clone(value);
  }

  protected submit() {
    const value = this.getSubmitValue();
    if (this.submitMethod) {
      Reflect.set(this, 'submitted', false);
      this.submitting$.enable();
      this.submitError$.next(null);
      try {
        const resultOrPromise = this.submitMethod.call(value);
        if (isPromise(resultOrPromise)) {
          resultOrPromise
            .then((result) => {
              Reflect.set(this, 'submitted', true);
              this.rxapSubmit.emit(result);
              this.submitSuccessful(result);
            })
            .catch((error) => {
              this.submitError$.next(error);
              this.submitFailed(error);
            })
            .finally(() => {
              this.submitting$.disable();
              this.cdr.detectChanges();
            });
        } else {
          Reflect.set(this, 'submitted', true);
          this.rxapSubmit.emit(resultOrPromise);
          this.submitSuccessful(resultOrPromise);
          this.submitting$.disable();
        }
      } catch (error: any) {
        this.submitting$.disable();
        this.submitError$.next(error);
        this.submitFailed(error);
      }
    } else {
      if (isDevMode()) {
        console.warn(
          'The form submit method is not defined for: ' + this.form.controlId,
        );
      }

      this.rxapSubmit.emit(value);
      this.submitSuccessful(value);
    }
  }

  protected submitFailed(error: Error) {
    console.debug('Submit Error:', error);
    console.error('Submit Error:', error.message);
    if (this.submitFailedMethod) {
      this.submitFailedMethod.call(error);
    } else if (isDevMode()) {
      console.warn(
        'The form submit failed method is not defined for: ' +
        this.form.controlId,
      );
    }
  }

  protected submitSuccessful(value: any) {
    this.submitSuccessful$.next(value);
    if (this.submitSuccessfulMethod) {
      this.submitSuccessfulMethod.call(value);
    } else if (isDevMode()) {
      console.warn(
        'The form submit successful method is not defined for: ' +
        this.form.controlId,
      );
    }
  }

  public override ngOnDestroy() {
    super.ngOnDestroy();
    this._autoSubmitSubscription?.unsubscribe();

    function HasNgOnDestroyMethod(obj: any): obj is OnDestroy {
      return obj && typeof obj.ngOnDestroy === 'function';
    }

    if (HasNgOnDestroyMethod(this._formDefinition)) {
      this._formDefinition.ngOnDestroy();
    }

  }
}
