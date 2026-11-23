import { ChangeDetectorRef, computed, Directive, forwardRef, inject, input, isDevMode, OnChanges, OnDestroy, OnInit, output, PendingTasks, SimpleChanges } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  ControlContainer,
  FormGroupDirective,
} from '@angular/forms';
import { ToggleSubject } from '@rxap/rxjs';
import { LoadingIndicatorService } from '@rxap/services';
import {
  clone,
  isObject,
  isPromise,
} from '@rxap/utilities';
import {
  BehaviorSubject,
  Subscription,
} from 'rxjs';
import {
  debounceTime,
  filter,
  tap,
} from 'rxjs/operators';
import { RxapFormBuilder } from '../form-builder';
import { RxapFormGroup } from '../form-group';
import { FormDefinition } from '../model';
import {
  RXAP_FORM_CONTEXT,
  RXAP_FORM_INITIAL_STATE,
} from '../tokens';
import {
  FormLoadFailedMethod,
  FormLoadMethod,
  FormLoadSuccessfulMethod,
  FormSubmitFailedMethod,
  FormSubmitMethod,
  FormSubmitSuccessfulMethod,
} from './models';
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
import { Showcase } from '@ng-prism/core';

const PRISM_FORM_FIELDS = '<label>Name <input formControlName="name" /></label><label>Email <input formControlName="email" type="email" /></label>';
const PRISM_FORM_STYLE = 'display: flex; flex-direction: column; gap: 8px; min-width: 280px';

@Showcase<FormDirective>({
  title: 'Form',
  category: 'Forms',
  description: 'Binds a form definition (`RXAP_FORM_DEFINITION`, `RXAP_FORM_DEFINITION_BUILDER` or the `rxapForm` input) to a form element and manages loading, submitting and the submit result. Submit the form with the name `fail` to see the failing submit.',
  status: 'stable',
  imports: [ { name: 'ReactiveFormsModule', from: '@angular/forms' } ],
  variants: [
    {
      name: 'Default',
      template: `<div style="${ PRISM_FORM_STYLE }">${ PRISM_FORM_FIELDS }<div><button type="submit">Submit</button></div></div>`,
    },
    {
      name: 'With initial value',
      description: 'The `initial` input patches the form after it is created.',
      inputs: { initial: { name: 'Grace Hopper', email: 'grace@example.com' } },
      template: `<div style="${ PRISM_FORM_STYLE }">${ PRISM_FORM_FIELDS }<div><button type="submit">Submit</button></div></div>`,
    },
    {
      name: 'Submit feedback',
      description: 'The structural directives render depending on the state of the form submit.',
      template: `<div style="${ PRISM_FORM_STYLE }">${ PRISM_FORM_FIELDS }<div><button type="submit">Submit</button></div><p *rxapFormSubmitting>Submitting...</p><p *rxapFormSubmitSuccessful="let result">Saved the form of {{ result.name }}</p><p *rxapFormSubmitFailed="let error">Failed: {{ error.message }}</p><p *rxapFormSubmitInvalid>The form is invalid</p></div>`,
    },
  ],
})
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

  host: {
    '(reset)': 'onReset()',
    '[class.rxap-submitting]': 'submitting()',
    '[class.rxap-submit-error]': '!!submitError()',
    '[class.rxap-loading]': 'loading()',
    '[class.rxap-loaded]': 'loaded()',
    '[class.rxap-loading-error]': '!!loadingError()',
  },
  // eslint-disable-next-line @angular-eslint/no-outputs-metadata-property
  outputs: [ 'ngSubmit' ],
  exportAs: 'rxapForm',
  standalone: true,
})
export class FormDirective<T = any>
  extends FormGroupDirective
  implements OnInit, OnChanges, OnDestroy {
  /**
   * @deprecated the directive does not rely on manual change detection anymore
   */
  readonly cdr = inject<ChangeDetectorRef>(ChangeDetectorRef);
  protected readonly formDefinitionBuilder = inject<RxapFormBuilder | null>(RXAP_FORM_DEFINITION_BUILDER, { skipSelf: true, optional: true }) ?? null;
  private readonly pendingTasks = inject(PendingTasks);
  protected readonly loadingIndicatorService = inject<LoadingIndicatorService | null>(LoadingIndicatorService, { optional: true }) ?? null;

  // skip self, bc the tokens are set to null in the providers of this directive
  private readonly injectedSubmitMethod = inject<FormSubmitMethod<any> | null>(RXAP_FORM_SUBMIT_METHOD, { skipSelf: true, optional: true }) ?? null;
  private readonly injectedLoadMethod = inject<FormLoadMethod | null>(RXAP_FORM_LOAD_METHOD, { skipSelf: true, optional: true }) ?? null;
  private readonly injectedLoadFailedMethod = inject<FormLoadFailedMethod | null>(RXAP_FORM_LOAD_FAILED_METHOD, { skipSelf: true, optional: true }) ?? null;
  private readonly injectedLoadSuccessfulMethod = inject<FormLoadSuccessfulMethod | null>(RXAP_FORM_LOAD_SUCCESSFUL_METHOD, { skipSelf: true, optional: true }) ?? null;
  private readonly injectedSubmitFailedMethod = inject<FormSubmitFailedMethod | null>(RXAP_FORM_SUBMIT_FAILED_METHOD, { skipSelf: true, optional: true }) ?? null;
  private readonly injectedSubmitSuccessfulMethod = inject<FormSubmitSuccessfulMethod | null>(RXAP_FORM_SUBMIT_SUCCESSFUL_METHOD, { skipSelf: true, optional: true }) ?? null;
  private readonly injectedFormDefinition = inject<FormDefinition | null>(RXAP_FORM_DEFINITION, { optional: true }) ?? null;
  private readonly injectedContext = inject(RXAP_FORM_CONTEXT, { optional: true }) ?? null;
  private readonly injectedInitial = inject<T | null>(RXAP_FORM_INITIAL_STATE, { optional: true }) ?? null;

  public override form!: RxapFormGroup<T>;

  public readonly initial = input<T | null>(null);

  public readonly context = input<unknown | null>(null);

  /**
   * The initial value: the input value or, as fallback, the value provided by the RXAP_FORM_INITIAL_STATE token
   */
  protected readonly currentInitial = computed<T | null>(() => {
    const initial = this.initial();
    if (initial) {
      return initial;
    }
    const injected = this.injectedInitial;
    return injected && typeof injected === 'object' && !Array.isArray(injected) ? injected : null;
  });

  /**
   * The context: the input value or, as fallback, the value provided by the RXAP_FORM_CONTEXT token
   */
  protected readonly currentContext = computed<unknown | null>(() => this.context() ?? this.injectedContext);

  /**
   * Emits when the submit method is executed without errors. The result of the
   * submit method is passed as event object.
   *
   * If no submit method is defined then emit after the submit button
   * is clicked.
   */
  public readonly rxapSubmit = output<any>();

  public readonly invalidSubmit = output<Record<string, any>>();

  public readonly submitSuccessful$ = output<any>({ alias: 'submitSuccessful' });

  public readonly submitting$ = new ToggleSubject();
  public readonly submitError$ = new BehaviorSubject<Error | null>(null);
  public readonly loading$ = new ToggleSubject();
  public readonly loaded$ = new ToggleSubject();
  public readonly loadingError$ = new BehaviorSubject<Error | null>(null);

  public readonly submitting = toSignal(this.submitting$, { initialValue: false });
  public readonly submitError = toSignal(this.submitError$, { initialValue: null });
  public readonly loading = toSignal(this.loading$, { initialValue: false });
  public readonly loaded = toSignal(this.loaded$, { initialValue: false });
  public readonly loadingError = toSignal(this.loadingError$, { initialValue: null });

  /**
   * The form definition instance. Overrides the form definition provided by the
   * RXAP_FORM_DEFINITION token or the RXAP_FORM_DEFINITION_BUILDER
   */
  public readonly useFormDefinition = input<FormDefinition<T> | ''>('', { alias: 'rxapForm' });

  public get formDefinition(): FormDefinition<T> {
    return this._formDefinition;
  }

  protected _formDefinition!: FormDefinition<T>;

  public readonly submitMethod = input<FormSubmitMethod<any> | null>(null);

  public readonly loadMethod = input<FormLoadMethod | null>(null);

  public readonly loadFailedMethod = input<FormLoadFailedMethod | null>(null);

  public readonly loadSuccessfulMethod = input<FormLoadSuccessfulMethod | null>(null);

  public readonly submitFailedMethod = input<FormSubmitFailedMethod | null>(null);

  public readonly submitSuccessfulMethod = input<FormSubmitSuccessfulMethod | null>(null);

  // the input value has precedence over the value provided by the injection token
  protected readonly currentSubmitMethod = computed(() => this.submitMethod() ?? this.injectedSubmitMethod);
  protected readonly currentLoadMethod = computed(() => this.loadMethod() ?? this.injectedLoadMethod);
  protected readonly currentLoadFailedMethod = computed(() => this.loadFailedMethod() ?? this.injectedLoadFailedMethod);
  protected readonly currentLoadSuccessfulMethod = computed(() => this.loadSuccessfulMethod() ?? this.injectedLoadSuccessfulMethod);
  protected readonly currentSubmitFailedMethod = computed(() => this.submitFailedMethod() ?? this.injectedSubmitFailedMethod);
  protected readonly currentSubmitSuccessfulMethod = computed(() => this.submitSuccessfulMethod() ?? this.injectedSubmitSuccessfulMethod);

  private _autoSubmitSubscription = new Subscription();

  constructor() {
    super([], []);
    let formDefinition = this.injectedFormDefinition;
    if (!formDefinition && this.formDefinitionBuilder) {
      formDefinition = this.formDefinitionBuilder.build<FormDefinition>();
    }
    if (formDefinition) {
      this._formDefinition = formDefinition as FormDefinition<T>;
      this.form = formDefinition.rxapFormGroup as RxapFormGroup<T>;
    }
    this.loadingIndicatorService?.attachLoading(this.loading$);
    this.loadingIndicatorService?.attachLoading(this.submitting$);
  }

  /**
   * Applies the form definition passed with the rxapForm input
   */
  private applyFormDefinitionInput() {
    const value = this.useFormDefinition();
    if (value) {
      this._formDefinition = value as any;
      this.form = value.rxapFormGroup;
    }
  }

  public override ngOnChanges(changes: SimpleChanges) {
    // the form must be set before the FormGroupDirective validates its presence
    this.applyFormDefinitionInput();
    super.ngOnChanges(changes);

    const formChange = changes['form'];

    if (formChange && !formChange.firstChange) {
      this.loadInitialState(formChange.currentValue);
    }
  }

  public ngOnInit() {
    this.applyFormDefinitionInput();
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
    const initial = this.currentInitial();
    if (initial) {
      if (isDevMode()) {
        console.log('use the value from input initial');
      }
      form.patchValue(initial, { setInitialValue: true });
    } else {
      const loadMethod = this.currentLoadMethod();
      if (loadMethod) {
        this.loading$.enable();

        try {
          const resultOrPromise = loadMethod.call({ context: this.currentContext(), initial: this.currentInitial() });
          if (isPromise(resultOrPromise)) {
            // zoneless: register the pending load, so that ApplicationRef.whenStable() waits for it
            const done = this.pendingTasks.add();
            resultOrPromise
              .then((value) => {
                form.patchValue(value, { setInitialValue: true });
                this.loaded$.enable();
                this.loadSuccessful(value);
              })
              .catch((error) => {
                this.loadingError$.next(error);
                this.loadFailed(error);
              })
              .finally(() => {
                this.loading$.disable();
                done();
              });
          } else if (isObject(resultOrPromise)) {
            form.patchValue(resultOrPromise, { setInitialValue: true });
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
    const loadSuccessfulMethod = this.currentLoadSuccessfulMethod();
    if (loadSuccessfulMethod) {
      loadSuccessfulMethod.call(value);
    } else if (isDevMode()) {
      console.warn(
        'The load successful is not defined for: ' + this.form.controlId,
      );
    }
  }

  protected loadFailed(error: Error) {
    console.debug('Load Error:', error);
    console.error('Load Error:', error.message);
    const loadFailedMethod = this.currentLoadFailedMethod();
    if (loadFailedMethod) {
      loadFailedMethod?.call(error);
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

    value = value ?? clone(this.form.value);

    return value;
  }

  protected submit() {
    const value = this.getSubmitValue();
    const submitMethod = this.currentSubmitMethod();
    if (submitMethod) {
      Reflect.set(this, 'submitted', false);
      this.submitting$.enable();
      this.submitError$.next(null);
      try {
        const resultOrPromise = submitMethod.call(value, this.currentContext(), this.currentInitial());
        if (isPromise(resultOrPromise)) {
          // zoneless: register the pending submit, so that ApplicationRef.whenStable() waits for it
          const done = this.pendingTasks.add();
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
              done();
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
    const submitFailedMethod = this.currentSubmitFailedMethod();
    if (submitFailedMethod) {
      submitFailedMethod.call(error);
    } else if (isDevMode()) {
      console.warn(
        'The form submit failed method is not defined for: ' +
        this.form.controlId,
      );
    }
  }

  protected submitSuccessful(value: any) {
    this.submitSuccessful$.emit(value);
    const submitSuccessfulMethod = this.currentSubmitSuccessfulMethod();
    if (submitSuccessfulMethod) {
      submitSuccessfulMethod.call(value);
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
