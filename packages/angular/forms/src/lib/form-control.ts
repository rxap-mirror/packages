import { UntypedFormControl } from '@angular/forms';
import { coerceArray } from '@rxap/utilities';
import {
  isObservable,
  Observable,
  Subject,
  Subscription,
} from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import {
  controlDisabled$,
  controlDisabledWhile,
  controlEnabled$,
  controlEnabledWhile,
  controlErrorChanges$,
  controlReadonly$,
  controlStatusChanges$,
  controlValueChanges$,
  disableControl,
  enableControl,
  hasErrorAndDirty,
  hasErrorAndTouched,
  mergeControlValidators,
  validateControlOn,
} from './control-actions';
import {
  FormDefinition,
  FormType,
  RxapAbstractControlOptions,
  SetValueFn,
} from './model';
import {
  AsyncValidator,
  ControlEventOptions,
  ControlOptions,
  ControlState,
  EmitEvent,
  ExtractStrings,
  OnlySelf,
  OrBoxedValue,
  Validator,
} from './types';

export class RxapFormControl<
  T = any,
  E extends object = any,
  Parent extends object = any
> extends UntypedFormControl {
  /**
   * @internal
   */
  public get rxapFormDefinition():
    | (FormType<Parent> & FormDefinition<Parent>)
    | undefined {
    return (this.parent as any).rxapFormDefinition;
  }

  override readonly value!: T;
  override readonly errors!: E | null;
  // TODO : find solution to only overwrite the type with out impl the getter or setter logic
  // readonly asyncValidator!: AsyncValidatorFn<T>;
  override readonly valueChanges!: Observable<T>;
  override readonly status!: ControlState;
  override readonly statusChanges!: Observable<ControlState>;
  readonly initialState!: OrBoxedValue<T>;
  private _readonly = false;

  private touchChanges = new Subject<boolean>();
  private dirtyChanges = new Subject<boolean>();

  readonly touch$ = this.touchChanges
                        .asObservable()
                        .pipe(distinctUntilChanged());
  readonly dirty$ = this.dirtyChanges
                        .asObservable()
                        .pipe(distinctUntilChanged());

  readonly value$: Observable<T> = controlValueChanges$<T>(this);
  readonly disabled$ = controlDisabled$<T>(this);
  readonly enabled$ = controlEnabled$<T>(this);

  public get readonly(): boolean {
    return (this.parent as any)?.readonly ?? this._readonly;
  }

  public set readonly(value: boolean) {
    this._readonly = value;
    this.stateChanges.next();
  }

  readonly status$ = controlStatusChanges$<T>(this);
  readonly errors$ = controlErrorChanges$<E>(this);

  readonly controlId: string;

  private readonly _onSetValue: SetValueFn<T>[] = [];

  readonly stateChanges = new Subject<void>();
  readonly readonly$ = controlReadonly$<T>(this);

  public get controlPath(): string {
    const parent: any = this.parent;
    if (parent) {
      if (parent.controlPath) {
        if (parent === this.root) {
          return this.controlId;
        } else {
          return [ parent.controlPath, this.controlId ].join('.');
        }
      }
    }
    return this.controlId;
  }

  public get fullControlPath(): string {
    const parent: any = this.parent;
    if (parent) {
      if (parent.fullControlPath) {
        return [ parent.fullControlPath, this.controlId ].join('.');
      }
    }
    return this.controlId;
  }

  constructor(
    formState: OrBoxedValue<T>,
    options: RxapAbstractControlOptions & { controlId: string },
  ) {
    super(formState, options);
    this.controlId = options.controlId;
    if (options.disabled) {
      this.disable({ emitEvent: false });
    }
    this.initialState = formState;
  }

  public override setValue(
    valueOrObservable: Observable<T>,
    options?: ControlOptions,
  ): Subscription;
  public override setValue(valueOrObservable: T, options?: ControlOptions): void;
  public override setValue(
    valueOrObservable: any,
    options?: ControlOptions,
  ): Subscription | void {
    if (isObservable(valueOrObservable)) {
      return (valueOrObservable as Observable<T>).subscribe((value) => {
        super.setValue(value, options);
        this._onSetValue.forEach((setValueFn) => setValueFn(value, options));
      });
    }

    super.setValue(valueOrObservable, options);
    this._onSetValue.forEach((setValueFn) =>
      setValueFn(valueOrObservable, options),
    );
  }

  public override patchValue(
    valueOrObservable: Observable<T>,
    options?: ControlOptions,
  ): Subscription;
  public override patchValue(valueOrObservable: T, options?: ControlOptions): void;
  public override patchValue(
    valueOrObservable: any,
    options?: ControlOptions,
  ): Subscription | void {
    if (isObservable(valueOrObservable)) {
      return valueOrObservable.subscribe((value) =>
        super.patchValue(value, options),
      );
    }

    super.patchValue(valueOrObservable, options);
  }

  public disabledWhile(
    observable: Observable<boolean>,
    options?: ControlOptions,
  ) {
    return controlDisabledWhile(this, observable, options);
  }

  public enabledWhile(
    observable: Observable<boolean>,
    options?: ControlOptions,
  ) {
    return controlEnabledWhile(this, observable, options);
  }

  public mergeValidators(validators: Validator) {
    mergeControlValidators(this, validators);
  }

  public mergeAsyncValidators(validators: AsyncValidator) {
    this.setAsyncValidators([
      // TODO : remove 'as any' if solution for the type overwrite issue is found (above)
      this.asyncValidator as any,
      ...coerceArray(validators),
    ]);
    this.updateValueAndValidity();
  }

  public override markAsTouched(opts?: OnlySelf): void {
    super.markAsTouched(opts);
    this.touchChanges.next(true);
  }

  public override markAsUntouched(opts?: OnlySelf): void {
    super.markAsUntouched(opts);
    this.touchChanges.next(false);
  }

  public override markAsPristine(opts?: OnlySelf): void {
    super.markAsPristine(opts);
    this.dirtyChanges.next(false);
  }

  public override markAsDirty(opts?: OnlySelf): void {
    super.markAsDirty(opts);
    this.dirtyChanges.next(true);
  }

  public markAllAsDirty(): void {
    this.markAsDirty({ onlySelf: true });
  }

  public override reset(
    formState?: OrBoxedValue<T>,
    options?: ControlEventOptions,
  ): void {
    const newState = formState ?? this.initialState;

    if (typeof newState === 'function') {
      super.reset((newState as any)(), options);
    } else {
      super.reset(newState, options);
    }
  }

  public override setValidators(
    newValidator: Validator,
    updateValueAndValidity = true,
  ): void {
    super.setValidators(newValidator);
    if (updateValueAndValidity) {
      super.updateValueAndValidity();
    }
  }

  public override setAsyncValidators(
    newValidator: AsyncValidator,
    updateValueAndValidity = true,
  ): void {
    super.setAsyncValidators(newValidator);
    if (updateValueAndValidity) {
      super.updateValueAndValidity();
    }
  }

  public validateOn(observableValidation: Observable<null | object>) {
    return validateControlOn(this, observableValidation);
  }

  public override getError<K extends ExtractStrings<E>>(errorCode: K): E[K] | null {
    return super.getError(errorCode) as E[K] | null;
  }

  public override hasError<K extends ExtractStrings<E>>(errorCode: K) {
    return super.hasError(errorCode);
  }

  public override setErrors(errors: Partial<E> | null, opts: EmitEvent = {}) {
    return super.setErrors(errors, opts);
  }

  public setError(key: string, value: any, opts: EmitEvent = {}): void {
    super.setErrors({ [key]: value }, opts);
  }

  public hasErrorAndTouched(error: ExtractStrings<E>): boolean {
    return hasErrorAndTouched(this, error);
  }

  public hasErrorAndDirty(error: ExtractStrings<E>): boolean {
    return hasErrorAndDirty(this, error);
  }

  public setEnable(enable = true, opts?: ControlEventOptions) {
    enableControl(this, enable, opts);
  }

  public setDisable(disable = true, opts?: ControlEventOptions) {
    disableControl(this, disable, opts);
  }

  public registerOnSetValue(setValueFn: SetValueFn<T>) {
    this._onSetValue.push(setValueFn);
  }
}
