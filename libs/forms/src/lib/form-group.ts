import {
  Observable,
  Subject,
  Subscription,
  isObservable
} from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { FormGroup as NgFormGroup } from '@angular/forms';
import {
  ControlEventOptions,
  ExtractStrings,
  EmitEvent,
  KeyValueControls,
  ExtractAbstractControl,
  ControlState,
  OnlySelf,
  AsyncValidator,
  AbstractControl,
  ControlOptions,
  Validator
} from './types';
import {
  validateControlOn,
  hasErrorAndTouched,
  controlDisabled$,
  mergeControlValidators,
  hasErrorAndDirty,
  controlStatusChanges$,
  enableControl,
  controlEnabledWhile,
  disableControl,
  controlValueChanges$,
  selectControlValue$,
  controlEnabled$,
  controlErrorChanges$,
  markAllDirty,
  controlDisabledWhile,
  markAllPristine,
  markAllUntouched
} from './control-actions';
import { coerceArray } from '@rxap/utilities';
import {
  FormGroupOptions,
  FormType,
  FormDefinition
} from './model';

export class RxapFormGroup<
  T extends Record<string, any> = any,
  E extends object = any
> extends NgFormGroup {
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

  private _readonly: boolean = false;

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

  readonly value!: T;
  readonly errors!: E | null;
  readonly valueChanges!: Observable<T>;
  readonly status!: ControlState;
  readonly statusChanges!: Observable<ControlState>;

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
    public controls: ExtractAbstractControl<KeyValueControls<T>, T>,
    options: FormGroupOptions
  ) {
    super(controls, options);
    this.controlId = options.controlId;
  }

  public select<R>(mapFn: (state: T) => R): Observable<R> {
    return selectControlValue$<T, R>(this, mapFn);
  }

  public getRawValue(): T {
    return super.getRawValue();
  }

  public get<K1 extends keyof T>(path: [K1]): AbstractControl<T[K1]>;
  public get<K1 extends keyof T, K2 extends keyof T[K1]>(
    path: [K1, K2]
  ): AbstractControl<T[K1][K2]>;
  public get<
    K1 extends keyof T,
    K2 extends keyof T[K1],
    K3 extends keyof T[K1][K2]
  >(path: [K1, K2, K3]): AbstractControl<T[K1][K2][K3]>;
  public get(path: string): AbstractControl;
  public get(path: any): AbstractControl | null {
    return super.get(path);
  }

  public getControl<P1 extends keyof T>(prop1: P1): AbstractControl<T[P1]>;
  public getControl<P1 extends keyof T, P2 extends keyof T[P1]>(
    prop1: P1,
    prop2: P2
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
    prop4: P4
  ): AbstractControl<T[P1][P2][P3][P4]>;
  public getControl(...names: any): AbstractControl<any> {
    return this.get(names.join('.'));
  }

  public addControl<K extends ExtractStrings<T>>(
    name: K,
    control: AbstractControl<T[K]>
  ): void {
    super.addControl(name, control);
  }

  public removeControl(name: ExtractStrings<T>): void {
    super.removeControl(name);
  }

  public contains(controlName: ExtractStrings<T>): boolean {
    return super.contains(controlName);
  }

  public setControl<K extends ExtractStrings<T>>(
    name: K,
    control: AbstractControl<T[K]>
  ): void {
    super.setControl(name, control);
  }

  public setValue(
    valueOrObservable: Observable<T>,
    options?: ControlEventOptions
  ): Subscription;
  public setValue(valueOrObservable: T, options?: ControlEventOptions): void;
  public setValue(valueOrObservable: any, options?: ControlEventOptions): any {
    if (isObservable<T>(valueOrObservable)) {
      return valueOrObservable.subscribe((value) =>
        super.setValue(value, options)
      );
    }

    super.setValue(valueOrObservable, options);
  }

  public patchValue(
    valueOrObservable: Observable<Partial<T>>,
    options?: ControlEventOptions
  ): Subscription;
  public patchValue(
    valueOrObservable: Partial<T>,
    options?: ControlEventOptions
  ): void;
  public patchValue(
    valueOrObservable: any,
    options?: ControlEventOptions
  ): Subscription | void {
    if (isObservable<T>(valueOrObservable)) {
      return valueOrObservable.subscribe((value) =>
        super.patchValue(value, options)
      );
    }

    super.patchValue(valueOrObservable, options);
  }

  public disabledWhile(
    observable: Observable<boolean>,
    options?: ControlOptions
  ) {
    return controlDisabledWhile(this, observable, options);
  }

  public enabledWhile(
    observable: Observable<boolean>,
    options?: ControlOptions
  ) {
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
    markAllDirty(this);
  }

  public markAllAsPristine(): void {
    markAllPristine(this);
  }

  public markAllAsUntouched(): void {
    markAllUntouched(this);
  }

  public reset(formState?: Partial<T>, options?: ControlEventOptions): void {
    super.reset(formState, options);
  }

  public setValidators(
    newValidator: Validator,
    updateValueAndValidity: boolean = true
  ): void {
    super.setValidators(newValidator);
    if (updateValueAndValidity) {
      super.updateValueAndValidity();
    }
  }

  public setAsyncValidators(
    newValidator: AsyncValidator,
    updateValueAndValidity: boolean = true
  ): void {
    super.setAsyncValidators(newValidator);
    if (updateValueAndValidity) {
      super.updateValueAndValidity();
    }
  }

  public validateOn(observableValidation: Observable<null | object>) {
    return validateControlOn(this, observableValidation);
  }

  public hasError<K1 extends keyof T>(
    errorCode: ExtractStrings<E>,
    path?: [K1]
  ): boolean;
  public hasError<K1 extends keyof T, K2 extends keyof T[K1]>(
    errorCode: ExtractStrings<E>,
    path?: [K1, K2]
  ): boolean;
  public hasError<
    K1 extends keyof T,
    K2 extends keyof T[K1],
    K3 extends keyof T[K1][K2]
  >(errorCode: ExtractStrings<E>, path?: [K1, K2, K3]): boolean;
  public hasError(errorCode: ExtractStrings<E>, path?: string): boolean;
  public hasError(errorCode: ExtractStrings<E>, path?: any): boolean {
    return super.hasError(errorCode, path);
  }

  public setErrors(errors: Partial<E> | null, opts: EmitEvent = {}) {
    return super.setErrors(errors, opts);
  }

  public getError<K extends keyof E, K1 extends keyof T>(
    errorCode: K,
    path?: [K1]
  ): E[K] | null;
  public getError<
    K extends keyof E,
    K1 extends keyof T,
    K2 extends keyof T[K1]
  >(errorCode: K, path?: [K1, K2]): E[K] | null;
  public getError<
    K extends keyof E,
    K1 extends keyof T,
    K2 extends keyof T[K1],
    K3 extends keyof T[K1][K2]
  >(errorCode: K, path?: [K1, K2, K3]): E[K] | null;
  public getError<K extends keyof E>(errorCode: K, path?: string): E[K] | null;
  public getError<K extends keyof E>(errorCode: K, path?: any): E[K] | null {
    return super.getError(errorCode as any, path) as E[K] | null;
  }

  public hasErrorAndTouched<P1 extends keyof T>(
    error: ExtractStrings<E>,
    prop1?: P1
  ): boolean;
  public hasErrorAndTouched<P1 extends keyof T, P2 extends keyof T[P1]>(
    error: ExtractStrings<E>,
    prop1?: P1,
    prop2?: P2
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
    prop4?: P4
  ): boolean;
  public hasErrorAndTouched(error: any, ...path: any): boolean {
    return hasErrorAndTouched(this, error, ...path);
  }

  public hasErrorAndDirty<P1 extends keyof T>(
    error: ExtractStrings<E>,
    prop1?: P1
  ): boolean;
  public hasErrorAndDirty<P1 extends keyof T, P2 extends keyof T[P1]>(
    error: ExtractStrings<E>,
    prop1?: P1,
    prop2?: P2
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
    prop4?: P4
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
