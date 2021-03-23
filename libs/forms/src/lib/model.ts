import {
  AbstractControlOptions,
  AsyncValidatorFn,
  ValidatorFn
} from '@angular/forms';
import { Constructor } from '@rxap/utilities';
import type { RxapFormGroup } from './form-group';
import {
  StaticProvider,
  Type,
  InjectionToken,
  AbstractType
} from '@angular/core';
import { RxapFormControl } from './form-control';
import {
  AbstractControl,
  ControlOptions
} from './types';
import { BaseDefinitionMetadata } from '@rxap/definition';
import { RxapFormArray } from './form-array';

export interface InjectableValidator {
  validate?: ValidatorFn;
  asyncValidate?: AsyncValidatorFn
}

export interface RxapAbstractControlOptions extends AbstractControlOptions {
  state?: any | (() => any);
  injectValidators?: Array<Type<InjectableValidator> | InjectionToken<InjectableValidator> | AbstractType<InjectableValidator>>;
}

export interface RxapAbstractControlOptionsWithDefinition extends RxapAbstractControlOptions {
  definition: Constructor;
}

export interface FormDefinition<T extends Record<string, any> = any, E extends object = any> {
  rxapFormGroup: RxapFormGroup<T, E>;

  /**
   * The Reuse hook is called when the instance is reused.
   * And can be used to reset or alter the local state of the instance.
   */
  rxapReuse?(): void;

  /**
   * Called to get the value that should be submitted. If not defined
   * the value property of the root RxapFormGroup instance will be used
   */
  getSubmitValue?(): T;
}

export interface FormDefinitionArray<T> extends Array<T> {
  rxapFormArray: RxapFormArray;
}

export type FormType<T extends Record<string, any>> = FormDefinition<T> & {
  [K in keyof T]: T[K] extends (infer U)[] ?
                  FormDefinitionArray<FormType<U>> | RxapFormControl<T[K]> :
                  T[K] extends object | undefined ?
                  FormDefinition<T[K]> | RxapFormControl<T[K]> :
                  RxapFormControl<T[K]>;
}

export interface FormOptions extends RxapAbstractControlOptions {
  id: string;
}

export interface FormDefinitionMetadata extends BaseDefinitionMetadata, FormOptions {
  providers?: StaticProvider[];
}

export type ChangeFn<T = any> = (value: T, emitViewToModelChange: boolean) => void;

export type SetValueFn<T = any> = (value: T, options?: ControlOptions) => void;

export type FormBuilderFn = (state: any, options: { controlId: string }) => FormDefinition | RxapFormControl;

export type ControlInsertedFn = (index: number, controlOrDefinition: AbstractControl | FormDefinition) => void;
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
