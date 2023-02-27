import {
  UntypedFormArray,
  AbstractControl as NgAbstractControl
} from '@angular/forms';
import {
  ControlEventOptions,
  ExtractStrings,
  EmitEvent,
  ControlPath,
  ControlState,
  OnlySelf,
  AbstractControl,
  AsyncValidator,
  ControlOptions,
  Validator
} from './types';
import {
  distinctUntilChanged,
  map
} from 'rxjs/operators';
import {
  isObservable,
  Subject,
  Observable,
  Subscription
} from 'rxjs';
import {
  controlDisabled$,
  mergeControlValidators,
  hasErrorAndDirty,
  hasErrorAndTouched,
  controlStatusChanges$,
  enableControl,
  controlEnabledWhile,
  disableControl,
  controlValueChanges$,
  controlEnabled$,
  controlErrorChanges$,
  markAllDirty,
  controlDisabledWhile,
  markAllPristine,
  markAllUntouched
} from './control-actions';
import { coerceArray } from '@rxap/utilities';
import {
  FormArrayOptions,
  FormBuilderFn,
  ControlRemovedFn,
  ControlInsertedFn,
  FormType,
  FormDefinition
} from './model';
import { isDevMode } from '@angular/core';

export class RxapFormArray<T = any,
  E extends object = any,
  Parent extends object = any>
  extends UntypedFormArray
  implements AbstractControl<T[]> {

  private _readonly: boolean = false;

  public get readonly(): boolean {
    return (this.parent as any)?.readonly ?? this._readonly;
  }

  public set readonly(value: boolean) {
    this._readonly = value;
    this.controls.forEach(control => (control as any).stateChanges?.next());
  }

  /**
   * @internal
   */
  public get rxapFormDefinition():
    | (FormType<Parent> & FormDefinition<Parent>)
    | undefined {
    return (this.parent as any).rxapFormDefinition;
  }

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
    return this.controlId;
  }
  public readonly value!: T[];

  public get fullControlPath(): string {
    const parent: any = this.parent;
    if (parent) {
      if (parent.fullControlPath) {
        return [parent.fullControlPath, this.controlId].join('.');
      }
    }
    return this.controlId;
  }
  public readonly valueChanges!: Observable<T[]>;

  public readonly value$ = controlValueChanges$<T[]>(this);
  public readonly status!: ControlState;
  public readonly disabled$ = controlDisabled$(this);
  public readonly statusChanges!: Observable<ControlState>;
  public readonly enabled$ = controlEnabled$(this);
  public readonly errors!: E | null;
  public readonly status$ = controlStatusChanges$(this);
  public readonly errors$ = controlErrorChanges$<E>(this);
  public readonly controlId: string;
  private readonly touchChanges = new Subject<boolean>();
  public readonly touch$ = this.touchChanges
    .asObservable()
    .pipe(distinctUntilChanged());
  private readonly dirtyChanges = new Subject<boolean>();
  public readonly dirty$ = this.dirtyChanges
    .asObservable()
    .pipe(distinctUntilChanged());
  private readonly _builder: FormBuilderFn;
  private readonly _controlInsertedFn: ControlInsertedFn;
  private readonly _controlRemovedFn: ControlRemovedFn;

  constructor(
    public controls: Array<AbstractControl<T>>,
    options: FormArrayOptions
  ) {
    super(controls, options);
    this.controlId = options.controlId;
    this._builder = options.builder;
    this._controlInsertedFn = options.controlInsertedFn;
    this._controlRemovedFn = options.controlRemovedFn;
  }

  public select<R>(mapFn: (state: T[]) => R): Observable<R> {
    return this.value$.pipe(map(mapFn), distinctUntilChanged());
  }

  public at(index: number): AbstractControl<T> {
    return super.at(index) as AbstractControl<T>;
  }

  public getRawValue(): T[] {
    return super.getRawValue();
  }

  public insert(index: number, control: AbstractControl<T>): void {
    if (isDevMode()) {
      console.warn('It is not recommend to use the FormArray.insert method');
    }
    return super.insert(index, control);
  }

  /**
   * inserts a new control at the specified index. If the index is undefined
   * the new control will be added to the end.
   *
   * @param index (optional) the index where the control should be created
   * @param state (optional) the initial state of the new control
   * @param options (optional) ControlEventOptions
   */
  public insertAt(index?: number, state?: T, options?: ControlEventOptions): void {
    const insertIndex = index ?? this.controls.length;
    const controlOrDefinition = this._builder(state, {
      controlId: insertIndex.toFixed(0),
    });

    this._controlInsertedFn(insertIndex, controlOrDefinition);

    if (insertIndex < this.controls.length) {
      // update the control ids for all controls, that are moved.
      for (let i = insertIndex; i < this.controls.length; i++) {
        Reflect.set(this.controls[i], 'controlId', (i + 1).toFixed(0));
      }
    }

    // call the super insert after the update, bc the insert method will
    // trigger a change detection
    if (controlOrDefinition instanceof NgAbstractControl) {
      super.insert(insertIndex, controlOrDefinition, options);
    } else {
      super.insert(insertIndex, controlOrDefinition.rxapFormGroup!, options);
    }
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

  public markAllAsDirty(): void {
    markAllDirty(this);
  }

  public markAllAsPristine(): void {
    markAllPristine(this);
  }

  private coerceValue(value: T[]) {
    for (let index = 0; index < value.length; index++) {
      if (!this.at(index)) {
        this.insertAt(index, value[ index ]);
      }
    }
  }

  public setValue(
    valueOrObservable: T[] | Observable<T[]>,
    options?: ControlEventOptions
  ): Subscription | void {
    if (isObservable(valueOrObservable)) {
      return valueOrObservable.subscribe((value) => {
          if (options?.coerce) {
            this.coerceValue(value);
          }
          super.setValue(value, options);
        }
      );
    }

    if (options?.coerce) {
      this.coerceValue(valueOrObservable);
    }

    super.setValue(valueOrObservable, options);
  }

  public markAllAsUntouched(): void {
    markAllUntouched(this);
  }

  public validateOn(observableValidation: Observable<null | object>) {
    return observableValidation.subscribe((maybeError) => {
      this.setErrors(maybeError);
    });
  }

  public hasErrorAndTouched(
    errorCode: ExtractStrings<E>,
    path?: ControlPath
  ): boolean {
    return hasErrorAndTouched(this, errorCode, path);
  }

  public patchValue(
    valueOrObservable: any,
    options?: ControlEventOptions
  ): Subscription | void {
    if (isObservable<T[]>(valueOrObservable)) {
      return valueOrObservable.subscribe((value: T[]) => {
        if (options?.coerce) {
          this.coerceValue(value);
        }
        super.patchValue(value, options);
      });
    }

    if (options?.coerce) {
      this.coerceValue(valueOrObservable);
    }

    super.patchValue(valueOrObservable as T[], options);
  }

  public hasErrorAndDirty(
    errorCode: ExtractStrings<E>,
    path?: ControlPath
  ): boolean {
    return hasErrorAndDirty(this, errorCode, path);
  }
  public removeAt(index: number) {
    if (isDevMode()) {
      console.warn('It is not recommend to use the FormArray.removeAt method');
    }
    super.removeAt(index);
    this._controlRemovedFn(index);
  }

  public setEnable(enable = true, opts?: ControlEventOptions) {
    enableControl(this, enable, opts);
  }
  public push(control: AbstractControl<T>, options?: ControlEventOptions): void {
    if (isDevMode()) {
      console.warn('It is not recommend to use the FormArray.push method');
    }
    return super.push(control, options);
  }

  public setDisable(disable = true, opts?: ControlEventOptions) {
    disableControl(this, disable, opts);
  }

  public setControl(index: number, control: AbstractControl<T>, options?: ControlEventOptions): void {
    if (isDevMode()) {
      console.warn('It is not recommend to use the FormArray.setControl method');
    }
    return super.setControl(index, control, options);
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

  public reset(value?: T[], options?: ControlEventOptions): void {
    super.reset(value, options);
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

  public hasError(errorCode: ExtractStrings<E>, path?: ControlPath) {
    return super.hasError(errorCode, path);
  }

  public setErrors(errors: Partial<E> | null, opts: EmitEvent = {}) {
    return super.setErrors(errors, opts);
  }

  public getError<K extends ExtractStrings<E>>(
    errorCode: K,
    path?: ControlPath
  ) {
    return super.getError(errorCode, path) as E[K] | null;
  }
}
