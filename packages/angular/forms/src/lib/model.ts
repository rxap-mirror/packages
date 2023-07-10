import {
  AbstractControlOptions,
  AsyncValidatorFn,
  ValidatorFn,
} from '@angular/forms';
import { Constructor } from '@rxap/utilities';
import type { RxapFormGroup } from './form-group';
import {
  AbstractType,
  InjectionToken,
  StaticProvider,
  Type,
} from '@angular/core';
import { RxapFormControl } from './form-control';
import {
  AbstractControl,
  ControlOptions,
} from './types';
import { BaseDefinitionMetadata } from '@rxap/definition';
import { RxapFormArray } from './form-array';

export interface InjectableValidator {
  validate?: ValidatorFn;
  asyncValidate?: AsyncValidatorFn;
}

/**
 * @internal
 */
// tslint:disable-next-line:class-name
export interface _RxapAbstractControlOptions extends AbstractControlOptions {
  state?: any | (() => any);
  injectValidators?: Array<
    | Type<InjectableValidator>
    | InjectionToken<InjectableValidator>
    | AbstractType<InjectableValidator>
  >;
  controlType?: Constructor<RxapFormControl>;
}

export type RxapAbstractControlOptions<
  T extends Record<string, any> = Record<string, any>
> = _RxapAbstractControlOptions & T;

export interface RxapAbstractControlOptionsWithDefinition
  extends RxapAbstractControlOptions {
  definition: Constructor;
}

export interface FormDefinition<T = any,
  E extends object = any,
  JSON extends Record<string, any> = any,
> {
  rxapFormGroup: RxapFormGroup<T, E>;

  /**
   * used to access the form definition metadata type save
   */
  rxapMetadata: FormDefinitionMetadata;

  /**
   * The Reuse hook is called when the instance is reused.
   * And can be used to reset or alter the local state of the instance.
   */
  rxapReuse?(): void;

  /**
   * Called to get the value that should be submitted. If not defined
   * the value property of the root RxapFormGroup instance will be used
   */
  getSubmitValue?(): JSON;

  /**
   * Called to get the value that should be submitted. If not defined
   * the value property of the root RxapFormGroup instance will be used
   */
  toJSON?(): JSON;
}

export interface FormDefinitionArray<T> extends Array<T> {
  rxapFormArray: RxapFormArray;
}

export type FormType<T> = Partial<
  FormDefinition<T>
> &
  {
    [K in keyof T]: T[K] extends (infer U)[]
    ? FormDefinitionArray<FormType<U>> | FormDefinitionArray<RxapFormControl<U>> | RxapFormControl<T[K]> | RxapFormArray<U>
    : T[K] extends Record<string, any>
      ? (FormType<T[K]> & Partial<FormDefinition<T[K]>>) | RxapFormControl<T[K]>
      : RxapFormControl<T[K]>;
  };

export interface FormOptions extends RxapAbstractControlOptions {
  id: string;
}

export interface FormDefinitionMetadata
  extends BaseDefinitionMetadata,
    FormOptions {
  providers?: StaticProvider[];
  /**
   * true - after 5000ms the form is automatically submitted if valid
   * number - after the set ms the is automatically submitted if valid
   */
  autoSubmit?: boolean | number;
}

export type ChangeFn<T = any> = (
  value: T,
  emitViewToModelChange: boolean,
) => void;

export type SetValueFn<T = any> = (value: T, options?: ControlOptions) => void;

export type FormBuilderFn<T extends (FormDefinition<Data> | FormType<Data>) = FormDefinition, Data = Record<string, any>> = (
  state: any,
  options: { controlId: string },
) => T | RxapFormControl;

export type ControlInsertedFn = (
  index: number,
  controlOrDefinition: AbstractControl | FormDefinition,
) => void;
export type ControlRemovedFn = (index: number) => void;

export interface FormArrayOptions extends RxapAbstractControlOptions {
  builder: FormBuilderFn;
  controlId: string;
  controlInsertedFn: ControlInsertedFn;
  controlRemovedFn: ControlRemovedFn;
}

export interface FormGroupOptions extends RxapAbstractControlOptions {
  controlId: string;
}
