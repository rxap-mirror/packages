import {
  Directive,
  Inject,
  Optional,
  forwardRef,
  OnInit,
  EventEmitter,
  Output,
  HostListener,
  HostBinding,
  ChangeDetectorRef,
  Input,
  OnChanges,
  SimpleChanges,
  isDevMode,
  SkipSelf,
  NgZone
} from '@angular/core';
import {
  ControlContainer,
  FormGroupDirective
} from '@angular/forms';
import {
  RXAP_FORM_DEFINITION,
  RXAP_FORM_SUBMIT_METHOD,
  RXAP_FORM_LOAD_METHOD,
  RXAP_FORM_LOAD_FAILED_METHOD,
  RXAP_FORM_LOAD_SUCCESSFUL_METHOD,
  RXAP_FORM_SUBMIT_FAILED_METHOD,
  RXAP_FORM_SUBMIT_SUCCESSFUL_METHOD,
  RXAP_FORM_DEFINITION_BUILDER
} from './tokens';
import { RxapFormGroup } from '../form-group';
import {
  isPromise,
  isObject,
  ToggleSubject,
  Required,
  clone
} from '@rxap/utilities';
import { FormDefinition } from '../model';
import {
  FormSubmitMethod,
  FormLoadMethod,
  FormLoadFailedMethod,
  FormLoadSuccessfulMethod,
  FormSubmitFailedMethod,
  FormSubmitSuccessfulMethod
} from './models';
import { BehaviorSubject } from 'rxjs';
import { RxapFormBuilder } from '../form-builder';
import { LoadingIndicatorService } from '@rxap/services';
import {
  take,
  tap
} from 'rxjs/operators';

@Directive({
  selector:  'form:not([formGroup]):not([ngForm]),rxap-form,form[rxapForm]',
  providers: [
    {
      provide:     ControlContainer,
      // ignore coverage
      useExisting: forwardRef(() => FormDirective)
    },
    // region form provider clear
    // form provider that are directly associated with the current form
    // are cleared to prevent that inner forms can access this providers
    // Example: The parent form has a submit method provider and the inner should
    // not have a submit method provider. If the parent submit method provider is
    // not cleared then the inner form uses the parent submit method provider on
    // submit
    {
      provide:  RXAP_FORM_SUBMIT_METHOD,
      useValue: null
    },
    {
      provide:  RXAP_FORM_LOAD_METHOD,
      useValue: null
    },
    {
      provide:  RXAP_FORM_LOAD_FAILED_METHOD,
      useValue: null
    },
    {
      provide:  RXAP_FORM_LOAD_SUCCESSFUL_METHOD,
      useValue: null
    },
    {
      provide:  RXAP_FORM_SUBMIT_FAILED_METHOD,
      useValue: null
    },
    {
      provide:  RXAP_FORM_SUBMIT_SUCCESSFUL_METHOD,
      useValue: null
    },
    {
      provide:  RXAP_FORM_DEFINITION_BUILDER,
      useValue: null
    }
    // endregion
  ],
  host:      { '(reset)': 'onReset()' },
  outputs:   [ 'ngSubmit' ],
  exportAs:  'rxapForm'
})
export class FormDirective<T extends Record<string, any> = any> extends FormGroupDirective implements OnInit, OnChanges {

  public form!: RxapFormGroup<T>;

  @Input()
  public initial?: T;

  /**
   * Emits when the submit method is executed without errors. The result of the
   * submit method is passed as event object.
   *
   * If no submit method is defined then emit infidelity after the submit button
   * is clicked.
   */
  @Output()
  public rxapSubmit = new EventEmitter();

  @Output()
  public invalidSubmit = new EventEmitter();

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
      this._formDefinition = value;
      this.form            = value.rxapFormGroup;
    }
  }

  public get formDefinition(): FormDefinition<T> {
    return this._formDefinition;
  }

  public submitting$   = new ToggleSubject();
  public submitError$  = new BehaviorSubject<Error | null>(null);
  public loading$      = new ToggleSubject();
  public loaded$       = new ToggleSubject();
  public loadingError$ = new BehaviorSubject<Error | null>(null);

  @Required
  private _formDefinition!: FormDefinition<T>;

  @Input()
  private readonly submitMethod: FormSubmitMethod<any> | null = null;

  constructor(
    @Inject(ChangeDetectorRef) public readonly cdr: ChangeDetectorRef,
    @Optional() @Inject(RXAP_FORM_DEFINITION) formDefinition: FormDefinition | null                                                                = null,
    // skip self, bc the token is set to null
    @SkipSelf() @Optional() @Inject(RXAP_FORM_SUBMIT_METHOD) submitMethod: FormSubmitMethod<any> | null                                            = null,
    // skip self, bc the token is set to null
    @SkipSelf() @Optional() @Inject(RXAP_FORM_LOAD_METHOD) private readonly loadMethod: FormLoadMethod | null                                      = null,
    // skip self, bc the token is set to null
    @SkipSelf() @Optional() @Inject(RXAP_FORM_LOAD_FAILED_METHOD) private readonly loadFailedMethod: FormLoadFailedMethod | null                   = null,
    // skip self, bc the token is set to null
    @SkipSelf() @Optional() @Inject(RXAP_FORM_LOAD_SUCCESSFUL_METHOD) private readonly loadSuccessfulMethod: FormLoadSuccessfulMethod | null       = null,
    // skip self, bc the token is set to null
    @SkipSelf() @Optional() @Inject(RXAP_FORM_SUBMIT_FAILED_METHOD) private readonly submitFailedMethod: FormSubmitFailedMethod | null             = null,
    // skip self, bc the token is set to null
    @SkipSelf() @Optional() @Inject(RXAP_FORM_SUBMIT_SUCCESSFUL_METHOD) private readonly submitSuccessfulMethod: FormSubmitSuccessfulMethod | null = null,
    // skip self, bc the token is set to null
    @SkipSelf() @Optional() @Inject(RXAP_FORM_DEFINITION_BUILDER) private readonly formDefinitionBuilder: RxapFormBuilder | null                   = null,
    @Optional() @Inject(LoadingIndicatorService) private readonly loadingIndicatorService: LoadingIndicatorService | null                          = null,
    @Inject(NgZone)
    private readonly zone: NgZone | null                                                                                                           = null
  ) {
    super([], []);
    if (submitMethod) {
      this.submitMethod = submitMethod;
    }
    if (!formDefinition && formDefinitionBuilder) {
      formDefinition = formDefinitionBuilder.build();
    }
    if (formDefinition) {
      this._formDefinition = formDefinition;
      this.form            = formDefinition.rxapFormGroup;
    }
    this.loadingIndicatorService?.attachLoading(this.loading$);
    this.loadingIndicatorService?.attachLoading(this.submitting$);
  }

  public ngOnChanges(changes: SimpleChanges) {
    super.ngOnChanges(changes);

    const formChange = changes.form;

    if (formChange && !formChange.firstChange) {
      this.loadInitialState(formChange.currentValue);
    }

  }

  public ngOnInit() {
    if (!this.form) {
      // TODO : replace with rxap error
      throw new Error('The form definition instance is not defined');
    }
    if (this.zone) {
      this.zone.onStable.pipe(
        take(1),
        tap(() => {
          this.zone?.run(() => {
            this.loadInitialState(this.form);
          });
        })
      ).subscribe();
    } else {
      this.loadInitialState(this.form);
    }
  }

  private loadInitialState(form: RxapFormGroup): void {

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
              .then(value => {
                form.patchValue(value);
                this.loaded$.enable();
                this.loadSuccessful(value);
              })
              .catch(error => {
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
        } catch (error) {
          this.loaded$.disable();
          this.loadingError$.next(error);
          this.loadFailed(error);
          this.loading$.disable();
        }

      } else {
        if (isDevMode()) {
          console.warn('The form loading method is not defined for: ' + this.form.controlId);
        }
        this.loaded$.enable();
      }
    }
  }

  @HostListener('submit', [ '$event' ])
  public onSubmit($event: Event): boolean {
    super.onSubmit($event);
    if (this.form.valid) {
      this.submit();
    } else {
      if (isDevMode()) {
        console.log('Form submit is not valid for: ' + this.form.controlId, this.form.errors);

        function printErrorControls(control: any) {
          if (!control.valid) {
            console.group(control.controlId);
            if (control.controls) {
              if (Array.isArray(control.controls)) {
                for (let i = 0; i < control.controls.length; i++) {
                  const child = control.controls[ i ];
                  if (!child.valid) {
                    console.group(`index: ${i}`);
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
      this.invalidSubmit.emit();
    }

    return false;
  }

  private loadSuccessful(value: any) {
    if (this.loadSuccessfulMethod) {
      this.loadSuccessfulMethod.call(value);
    } else if (isDevMode()) {
      console.warn('The load successful is not defined for: ' + this.form.controlId);
    }
  }

  private loadFailed(error: Error) {
    console.debug('Load Error:', error);
    console.error('Load Error:', error.message);
    if (this.loadFailedMethod) {
      this.loadFailedMethod?.call(error);
    } else if (isDevMode()) {
      console.warn('The form loading failed for: ' + this.form.controlId);
    }
  }

  private submit() {
    const value = clone(this.form.value);
    if (this.submitMethod) {
      Reflect.set(this, 'submitted', false);
      this.submitting$.enable();
      this.submitError$.next(null);
      try {
        const resultOrPromise = this.submitMethod.call(value);
        if (isPromise(resultOrPromise)) {
          resultOrPromise
            .then(result => {
              Reflect.set(this, 'submitted', true);
              this.rxapSubmit.emit(result);
              this.submitSuccessful(resultOrPromise);
            })
            .catch(error => {
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
      } catch (error) {
        this.submitting$.disable();
        this.submitError$.next(error);
        this.submitFailed(error);
      }
    } else {

      if (isDevMode()) {
        console.warn('The form submit method is not defined for: ' + this.form.controlId);
      }

      this.rxapSubmit.emit(value);
      this.submitSuccessful(value);
    }
  }

  private submitFailed(error: Error) {
    console.debug('Submit Error:', error);
    console.error('Submit Error:', error.message);
    if (this.submitFailedMethod) {
      this.submitFailedMethod.call(error);
    } else if (isDevMode()) {
      console.warn('The form submit failed method is not defined for: ' + this.form.controlId);
    }
  }

  private submitSuccessful(value: any) {
    if (this.submitSuccessfulMethod) {
      this.submitSuccessfulMethod.call(value);
    } else if (isDevMode()) {
      console.warn('The form submit successful method is not defined for: ' + this.form.controlId);
    }
  }

}
