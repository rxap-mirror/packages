import {
  AbstractControl as NgAbstractControl,
  AbstractControlOptions as NgAbstractControlOptions,
  ValidationErrors as NgValidationErrors,
} from '@angular/forms';
import {
  Observable,
  Subject,
} from 'rxjs';
import {RxapFormArray} from './form-array';
import {RxapFormControl} from './form-control';
import {RxapFormGroup} from './form-group';
import {FormDefinition} from './model';

export type ValidationErrors<T = NgValidationErrors> = T;
export type ValidatorFn<T = any, E = any> = (control: AbstractControl<T>) => ValidationErrors<E> | null;
export type AsyncValidatorFn<T = any, E = any> = (
  control: AbstractControl<T>,
) => Promise<ValidationErrors<E> | null> | Observable<ValidationErrors<E> | null>;

export interface AbstractControlOptions<T = any, E extends NgValidationErrors = any> extends NgAbstractControlOptions {
  validators?: ValidatorFn<T, E> | ValidatorFn<T, E>[] | null;
  asyncValidators?: AsyncValidatorFn<T, E> | AsyncValidatorFn<T, E>[] | null;
}

export type ValidatorOrOpts = ValidatorFn | ValidatorFn[] | AbstractControlOptions | null;
export type AsyncValidator = AsyncValidatorFn | AsyncValidatorFn[] | null;
export type Validator = ValidatorFn | ValidatorFn[];

export interface ControlOptions {
  onlySelf?: boolean;
  emitEvent?: boolean;
  emitModelToViewChange?: boolean;
  emitViewToModelChange?: boolean;
  initial?: boolean;
  /**
   * used in the RxapFormArray patchValue method.
   *
   * true - if the value has not a control with any index. The control is created
   * false - default behavior
   */
  coerce?: boolean;

  /**
   * used in the RxapFormArray patchValue method.
   *
   * true - the length of the control array is limited by the length of the value.
   * false - default behavior
   *
   * example with strict = true
   *
   * current from array controls: [ 0: {}, 1: {}, 2: {} ]
   *
   * patch value A: [ 0: {}, 1: {}, 2: {} ]
   * result: [ 0: {}, 1: {}, 2: {} ]
   *
   * path value B: [ 0: {}, 1: {} ]
   * result: [ 0: {}, 1: {} ]
   *
   */
  strict?: boolean;
}

export type ControlEventOptions = Pick<ControlOptions, 'emitEvent' | 'onlySelf' | 'coerce' | 'strict'>;
export type OnlySelf = Pick<ControlOptions, 'onlySelf'>;
export type EmitEvent = Pick<ControlOptions, 'emitEvent'>;
export type ControlPath = Array<string | number> | string;
export type ControlState = 'VALID' | 'INVALID' | 'PENDING' | 'DISABLED';

export interface AbstractControl<T = any> extends NgAbstractControl {
  value: T;
  controlId?: string;
  fullControlPath?: string;
  rxapFormDefinition?: FormDefinition;
  readonly?: boolean;
  stateChanges?: Subject<any>;
}

export type ExtractStrings<T> = Extract<keyof T, string>;

export interface NgValidatorsErrors {
  required: true;
  email: true;
  pattern: { requiredPattern: string; actualValue: string };
  minlength: { requiredLength: number; actualLength: number };
  maxlength: { requiredLength: number; actualLength: number };
  min: { min: number; actual: number };
  max: { max: number; actual: number };
}

export interface BoxedValue<T> {
  value: T;
  disabled?: boolean;
}

export type OrBoxedValue<T> = T | BoxedValue<T> | (() => T);

type ArrayType<T> = T extends Array<infer R> ? R : any;

export type KeyValueControls<T> = {
  [K in keyof T]: T[K] extends RxapFormControl<T[K]>
    ? RxapFormControl<T[K]>
    : T[K] extends RxapFormGroup<T[K]>
      ? RxapFormGroup<T[K]>
      : T[K] extends RxapFormArray<ArrayType<T[K]>>
        ? RxapFormArray<ArrayType<T[K]>>
        : AbstractControl<T[K]>;
};
export type ExtractAbstractControl<T, U> = T extends KeyValueControls<any>
  ? { [K in keyof U]: AbstractControl<U[K]> }
  : T;
