import {
  isObservable,
  Observable,
  Subject,
  Subscription,
} from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { UntypedFormGroup } from '@angular/forms';
import {
  AbstractControl,
  AsyncValidator,
  ControlEventOptions,
  ControlOptions,
  ControlState,
  EmitEvent,
  ExtractAbstractControl,
  ExtractStrings,
  KeyValueControls,
  OnlySelf,
  ValidationErrors,
  Validator,
} from './types';
import {
  controlDisabled$,
  controlDisabledWhile,
  controlEnabled$,
  controlEnabledWhile,
  controlErrorChanges$,
  controlStatusChanges$,
  controlValueChanges$,
  disableControl,
  enableControl,
  hasErrorAndDirty,
  hasErrorAndTouched,
  markAllDirty,
  markAllPristine,
  markAllUntouched,
  mergeControlValidators,
  selectControlValue$,
  validateControlOn,
} from './control-actions';
import { coerceArray } from '@rxap/utilities';
import {
  FormDefinition,
  FormGroupOptions,
  FormType,
} from './model';

export class RxapFormGroup<
  T = any,
  E extends ValidationErrors = any
> extends UntypedFormGroup {
  /**
   * @internal
   */
  public get rxapFormDefinition():
    | (FormType<T> & FormDefinition<T>)
    | undefined {
    if (!this.parent) {
      return this._rxapFormDefinition;
    }
    if (this._rxapFormDefinition) {
      return this._rxapFormDefinition;
    }
    return (this.parent as any).rxapFormDefinition;
  }

  private _readonly = false;

  public get readonly(): boolean {
    return (this.parent as any)?.readonly ?? this._readonly;
  }

  public set readonly(value: boolean) {
    this._readonly = value;
    Object.values(this.controls ?? {}).forEach(control => (control as any).stateChanges?.next());
  }

  /**
   * @internal
   */
  private _rxapFormDefinition?: FormType<T> & FormDefinition<T>;

  override readonly value!: T;
  override readonly errors!: E | null;
  override readonly valueChanges!: Observable<T>;
  override readonly status!: ControlState;
  override readonly statusChanges!: Observable<ControlState>;

  private touchChanges = new Subject<boolean>();
  private dirtyChanges = new Subject<boolean>();

  touch$ = this.touchChanges.asObservable().pipe(distinctUntilChanged());
  dirty$ = this.dirtyChanges.asObservable().pipe(distinctUntilChanged());

  readonly value$: Observable<T> = controlValueChanges$<T>(this);
  readonly disabled$ = controlDisabled$<T>(this);
  readonly enabled$ = controlEnabled$<T>(this);
  readonly status$ = controlStatusChanges$<T>(this);
  readonly errors$ = controlErrorChanges$<E>(this);

  readonly controlId: string;

  public get controlPath(): string {
    const parent: any = this.parent;
    if (parent) {
      if (parent.controlPath) {
        if (parent === this.root) {
          return this.controlId;
        } else {
          return [parent.controlPath, this.controlId].join('.');
        }
      }
    }
    return '';
  }

  public get fullControlPath(): string {
    const parent: any = this.parent;
    if (parent) {
      if (parent.fullControlPath) {
        return [parent.fullControlPath, this.controlId].join('.');
      }
    }
    return this.controlId;
  }

  constructor(
    public override controls: ExtractAbstractControl<KeyValueControls<T>, T>,
    options: FormGroupOptions,
  ) {
    super(controls, options);
    this.controlId = options.controlId;
  }

  public select<R>(mapFn: (state: T) => R): Observable<R> {
    return selectControlValue$<T, R>(this, mapFn);
  }

  public override getRawValue(): T {
    return super.getRawValue();
  }

  public override get<K1 extends keyof T>(path: [K1]): AbstractControl<T[K1]>;
  public override get<K1 extends keyof T, K2 extends keyof T[K1]>(
    path: [K1, K2],
  ): AbstractControl<T[K1][K2]>;
  public override get<
    K1 extends keyof T,
    K2 extends keyof T[K1],
    K3 extends keyof T[K1][K2]
  >(path: [K1, K2, K3]): AbstractControl<T[K1][K2][K3]>;
  public override get(path: string): AbstractControl;
  public override get(path: any): AbstractControl | null {
    return super.get(path);
  }

  public getControl<P1 extends keyof T>(prop1: P1): AbstractControl<T[P1]>;
  public getControl<P1 extends keyof T, P2 extends keyof T[P1]>(
    prop1: P1,
    prop2: P2,
  ): AbstractControl<T[P1][P2]>;
  public getControl<
    P1 extends keyof T,
    P2 extends keyof T[P1],
    P3 extends keyof T[P1][P2]
  >(prop1: P1, prop2: P2, prop3: P3): AbstractControl<T[P1][P2][P3]>;
  public getControl<
    P1 extends keyof T,
    P2 extends keyof T[P1],
    P3 extends keyof T[P1][P2],
    P4 extends keyof T[P1][P2][P3]
  >(
    prop1: P1,
    prop2: P2,
    prop3: P3,
    prop4: P4,
  ): AbstractControl<T[P1][P2][P3][P4]>;
  public getControl(...names: any): AbstractControl<any> {
    return this.get(names.join('.'));
  }

  public override addControl<K extends ExtractStrings<T>>(
    name: K,
    control: AbstractControl<T[K]>,
  ): void {
    super.addControl(name, control);
  }

  public override removeControl(name: ExtractStrings<T>): void {
    super.removeControl(name);
  }

  public override contains(controlName: ExtractStrings<T>): boolean {
    return super.contains(controlName);
  }

  public override setControl<K extends ExtractStrings<T>>(
    name: K,
    control: AbstractControl<T[K]>,
  ): void {
    super.setControl(name, control);
  }

  public override setValue(
    valueOrObservable: Observable<T>,
    options?: ControlEventOptions,
  ): Subscription;
  public override setValue(valueOrObservable: T, options?: ControlEventOptions): void;
  public override setValue(valueOrObservable: any, options?: ControlEventOptions): any {
    if (isObservable(valueOrObservable)) {
      return (valueOrObservable as Observable<T>).subscribe((value) =>
        // TODO : refactor RxapFormGroup to typed FormGroup
        super.setValue(value as any, options),
      );
    }

    super.setValue(valueOrObservable, options);
  }

  private _patchValue(value: T, options?: ControlEventOptions) {
    // Even though the `value` argument type doesn't allow `null` and `undefined` values, the
    // `patchValue` can be called recursively and inner data structures might have these values, so
    // we just ignore such cases when a field containing FormGroup instance receives `null` or
    // `undefined` as a value.
    if (value == null /* both `null` and `undefined` */)
      return;
    Object.keys(value).forEach(name => {
      // TODO : resolve type issue
      const controls = this.controls as any;
      if (controls[name]) {
        controls[name].patchValue((value as any)[name], {...(options ?? {}), onlySelf: true});
      }
    });
    this.updateValueAndValidity(options);
  }

  public override patchValue(
    valueOrObservable: Observable<Partial<T>>,
    options?: ControlEventOptions,
  ): Subscription;
  public override patchValue(
    valueOrObservable: Partial<T>,
    options?: ControlEventOptions,
  ): void;
  public override patchValue(
    valueOrObservable: any,
    options?: ControlEventOptions,
  ): Subscription | void {
    if (isObservable(valueOrObservable)) {
      return (valueOrObservable as Observable<T>).subscribe((value) =>
        // TODO : refactor RxapFormGroup to typed FormGroup
        super.patchValue(value as any, options),
      );
    }

    this._patchValue(valueOrObservable, options);
  }

  public disabledWhile(
    observable: Observable<boolean>,
    options?: ControlOptions,
  ): Subscription {
    return controlDisabledWhile(this, observable, options);
  }

  public enabledWhile(
    observable: Observable<boolean>,
    options?: ControlOptions,
  ): Subscription {
    return controlEnabledWhile(this, observable, options);
  }

  public mergeValidators(validators: Validator) {
    mergeControlValidators(this, validators);
  }

  public mergeAsyncValidators(validators: AsyncValidator) {
    this.setAsyncValidators([
      ...coerceArray(this.asyncValidator),
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
    markAllDirty(this);
  }

  public markAllAsPristine(): void {
    markAllPristine(this);
  }

  public markAllAsUntouched(): void {
    markAllUntouched(this);
  }

  public override reset(formState?: Partial<T>, options?: ControlEventOptions): void {
    super.reset(formState, options);
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

  public override hasError<K1 extends keyof T>(
    errorCode: ExtractStrings<E>,
    path?: [K1],
  ): boolean;
  public override hasError<K1 extends keyof T, K2 extends keyof T[K1]>(
    errorCode: ExtractStrings<E>,
    path?: [K1, K2],
  ): boolean;
  public override hasError<
    K1 extends keyof T,
    K2 extends keyof T[K1],
    K3 extends keyof T[K1][K2]
  >(errorCode: ExtractStrings<E>, path?: [K1, K2, K3]): boolean;
  public override hasError(errorCode: ExtractStrings<E>, path?: string): boolean;
  public override hasError(errorCode: ExtractStrings<E>, path?: any): boolean {
    return super.hasError(errorCode, path);
  }

  public override setErrors(errors: Partial<E> | null, opts: EmitEvent = {}) {
    return super.setErrors(errors, opts);
  }

  public override getError<K extends keyof E, K1 extends keyof T>(
    errorCode: K,
    path?: [K1],
  ): E[K] | null;
  public override getError<
    K extends keyof E,
    K1 extends keyof T,
    K2 extends keyof T[K1]
  >(errorCode: K, path?: [K1, K2]): E[K] | null;
  public override getError<
    K extends keyof E,
    K1 extends keyof T,
    K2 extends keyof T[K1],
    K3 extends keyof T[K1][K2]
  >(errorCode: K, path?: [K1, K2, K3]): E[K] | null;
  public override getError<K extends keyof E>(errorCode: K, path?: string): E[K] | null;
  public override getError<K extends keyof E>(errorCode: K, path?: any): E[K] | null {
    return super.getError(errorCode as any, path) as E[K] | null;
  }

  public hasErrorAndTouched<P1 extends keyof T>(
    error: ExtractStrings<E>,
    prop1?: P1,
  ): boolean;
  public hasErrorAndTouched<P1 extends keyof T, P2 extends keyof T[P1]>(
    error: ExtractStrings<E>,
    prop1?: P1,
    prop2?: P2,
  ): boolean;
  public hasErrorAndTouched<
    P1 extends keyof T,
    P2 extends keyof T[P1],
    P3 extends keyof T[P1][P2]
  >(error: ExtractStrings<E>, prop1?: P1, prop2?: P2, prop3?: P3): boolean;
  public hasErrorAndTouched<
    P1 extends keyof T,
    P2 extends keyof T[P1],
    P3 extends keyof T[P1][P2],
    P4 extends keyof T[P1][P2][P3]
  >(
    error: ExtractStrings<E>,
    prop1?: P1,
    prop2?: P2,
    prop3?: P3,
    prop4?: P4,
  ): boolean;
  public hasErrorAndTouched(error: any, ...path: any): boolean {
    return hasErrorAndTouched(this, error, ...path);
  }

  public hasErrorAndDirty<P1 extends keyof T>(
    error: ExtractStrings<E>,
    prop1?: P1,
  ): boolean;
  public hasErrorAndDirty<P1 extends keyof T, P2 extends keyof T[P1]>(
    error: ExtractStrings<E>,
    prop1?: P1,
    prop2?: P2,
  ): boolean;
  public hasErrorAndDirty<
    P1 extends keyof T,
    P2 extends keyof T[P1],
    P3 extends keyof T[P1][P2]
  >(error: ExtractStrings<E>, prop1?: P1, prop2?: P2, prop3?: P3): boolean;
  public hasErrorAndDirty<
    P1 extends keyof T,
    P2 extends keyof T[P1],
    P3 extends keyof T[P1][P2],
    P4 extends keyof T[P1][P2][P3]
  >(
    error: ExtractStrings<E>,
    prop1?: P1,
    prop2?: P2,
    prop3?: P3,
    prop4?: P4,
  ): boolean;
  public hasErrorAndDirty(error: any, ...path: any): boolean {
    return hasErrorAndDirty(this, error, ...path);
  }

  public setEnable(enable = true, opts?: ControlEventOptions) {
    enableControl(this, enable, opts);
  }

  public setDisable(disable = true, opts?: ControlEventOptions) {
    disableControl(this, disable, opts);
  }
}
