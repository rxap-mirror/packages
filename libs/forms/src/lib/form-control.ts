import { FormControl as NgFormControl } from '@angular/forms';
import {
  controlEnabled$,
  controlDisabled$,
  mergeControlValidators,
  controlStatusChanges$,
  disableControl,
  controlValueChanges$,
  controlErrorChanges$,
  controlDisabledWhile,
  hasErrorAndDirty,
  hasErrorAndTouched,
  enableControl,
  controlEnabledWhile,
  validateControlOn
} from './control-actions';
import {
  ControlEventOptions,
  ExtractStrings,
  EmitEvent,
  ControlState,
  OnlySelf,
  OrBoxedValue,
  ControlOptions,
  AsyncValidator,
  Validator
} from './types';
import { distinctUntilChanged } from 'rxjs/operators';
import {
  isObservable,
  Subject,
  Subscription,
  Observable
} from 'rxjs';
import { coerceArray } from '@rxap/utilities';
import {
  RxapAbstractControlOptions,
  SetValueFn,
  FormType
} from './model';

export class RxapFormControl<T = any, E extends object = any, Parent extends object = any> extends NgFormControl {

  /**
   * @internal
   */
  public get rxapFormDefinition(): FormType<Parent> | undefined {
    return (this.parent as any).rxapFormDefinition;
  }

  readonly value!: T;
  readonly errors!: E | null;
  // TODO : find solution to only overwrite the type with out impl the getter or setter logic
  // readonly asyncValidator!: AsyncValidatorFn<T>;
  readonly valueChanges!: Observable<T>;
  readonly status!: ControlState;
  readonly statusChanges!: Observable<ControlState>;
  readonly initialState!: OrBoxedValue<T>;

  private touchChanges = new Subject<boolean>();
  private dirtyChanges = new Subject<boolean>();

  readonly touch$ = this.touchChanges.asObservable().pipe(distinctUntilChanged());
  readonly dirty$ = this.dirtyChanges.asObservable().pipe(distinctUntilChanged());

  readonly value$: Observable<T> = controlValueChanges$<T>(this);
  readonly disabled$             = controlDisabled$<T>(this);
  readonly enabled$              = controlEnabled$<T>(this);
  readonly status$               = controlStatusChanges$<T>(this);
  readonly errors$               = controlErrorChanges$<E>(this);

  readonly controlId: string;

  private readonly _onSetValue: SetValueFn<T>[] = [];

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

  constructor(formState: OrBoxedValue<T>, options: RxapAbstractControlOptions & { controlId: string }) {
    super(formState, options);
    this.controlId    = options.controlId;
    this.initialState = formState;
  }

  public setValue(valueOrObservable: Observable<T>, options?: ControlOptions): Subscription;
  public setValue(valueOrObservable: T, options?: ControlOptions): void;
  public setValue(valueOrObservable: any, options?: ControlOptions): Subscription | void {
    if (isObservable<T>(valueOrObservable)) {
      return valueOrObservable.subscribe(value => {
        super.setValue(value, options);
        this._onSetValue.forEach(setValueFn => setValueFn(value, options));
      });
    }

    super.setValue(valueOrObservable, options);
    this._onSetValue.forEach(setValueFn => setValueFn(valueOrObservable, options));
  }

  public patchValue(valueOrObservable: Observable<T>, options?: ControlOptions): Subscription;
  public patchValue(valueOrObservable: T, options?: ControlOptions): void;
  public patchValue(valueOrObservable: any, options?: ControlOptions): Subscription | void {
    if (isObservable(valueOrObservable)) {
      return valueOrObservable.subscribe(value => super.patchValue(value, options));
    }

    super.patchValue(valueOrObservable, options);
  }

  public disabledWhile(observable: Observable<boolean>, options?: ControlOptions) {
    return controlDisabledWhile(this, observable, options);
  }

  public enabledWhile(observable: Observable<boolean>, options?: ControlOptions) {
    return controlEnabledWhile(this, observable, options);
  }

  public mergeValidators(validators: Validator) {
    mergeControlValidators(this, validators);
  }

  public mergeAsyncValidators(validators: AsyncValidator) {
    this.setAsyncValidators([
      // TODO : remove 'as any' if solution for the type overwrite issue is found (above)
      this.asyncValidator as any,
      ...coerceArray(validators)
    ]);
    this.updateValueAndValidity();
  }

  public markAsTouched(opts?: OnlySelf): void {
    super.markAsTouched(opts);
    this.touchChanges.next(true);
  }

  public markAsUntouched(opts?: OnlySelf): void {
    super.markAsUntouched(opts);
    this.touchChanges.next(false);
  }

  public markAsPristine(opts?: OnlySelf): void {
    super.markAsPristine(opts);
    this.dirtyChanges.next(false);
  }

  public markAsDirty(opts?: OnlySelf): void {
    super.markAsDirty(opts);
    this.dirtyChanges.next(true);
  }

  public markAllAsDirty(): void {
    this.markAsDirty({ onlySelf: true });
  }

  public reset(formState?: OrBoxedValue<T>, options?: ControlEventOptions): void {
    super.reset(formState ?? this.initialState, options);
  }

  public setValidators(newValidator: Validator, updateValueAndValidity: boolean = true): void {
    super.setValidators(newValidator);
    if (updateValueAndValidity) {
      super.updateValueAndValidity();
    }
  }

  public setAsyncValidators(newValidator: AsyncValidator, updateValueAndValidity: boolean = true): void {
    super.setAsyncValidators(newValidator);
    if (updateValueAndValidity) {
      super.updateValueAndValidity();
    }
  }

  public validateOn(observableValidation: Observable<null | object>) {
    return validateControlOn(this, observableValidation);
  }

  public getError<K extends ExtractStrings<E>>(errorCode: K): E[K] | null {
    return super.getError(errorCode) as E[K] | null;
  }

  public hasError<K extends ExtractStrings<E>>(errorCode: K) {
    return super.hasError(errorCode);
  }

  public setErrors(errors: Partial<E> | null, opts: EmitEvent = {}) {
    return super.setErrors(errors, opts);
  }

  public setError(key: string, value: any, opts: EmitEvent = {}): void {
    super.setErrors({ [ key ]: value }, opts);
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
