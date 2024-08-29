import { RxapFormControl } from '@rxap/forms';
import { Mixin } from '@rxap/mixin';
import { ExtractControlMixin } from './extract-control.mixin';
import { ExtractFormDefinitionMixin } from './extract-form-definition.mixin';
import { ExtractFunctionMixin } from './extract-function.mixin';
import {
  UseFunction,
  UseFunctionConfig,
  UseFunctionType,
} from './extract-functions.mixin';
import { UseMethodConfig } from './extract-methods.mixin';

export const IS_VALUE_FUNCTION_NAME = 'is-value';

export function UseIsValueFunction(
  fnc: UseFunctionType<[any], boolean>,
): any;
export function UseIsValueFunction(
  fnc: UseFunctionType<any[], any>,
  config: UseFunctionConfig<boolean, any[], any, [any]>,
): any;
export function UseIsValueFunction(
  fnc: UseFunctionType<[any], boolean>,
  config?: UseMethodConfig,
) {
  return function (target: any, propertyKey: string) {
    UseFunction(fnc, IS_VALUE_FUNCTION_NAME, config)(target, propertyKey);
  };
}

export interface ExtractIsValueFunctionMixin extends ExtractFormDefinitionMixin, ExtractFunctionMixin,
  ExtractControlMixin {
}

@Mixin(ExtractFormDefinitionMixin, ExtractFunctionMixin, ExtractControlMixin)
export class ExtractIsValueFunctionMixin {

  protected extractIsValueFunction(
    defaultFunction: UseFunctionType<[any], boolean> | null = null,
    control: RxapFormControl = this.extractControl(),
    formDefinition           = this.extractFormDefinition(control),
  ): UseFunctionType<[any], boolean> {
    return this.extractFunction(defaultFunction, formDefinition, control.controlId, IS_VALUE_FUNCTION_NAME);
  }

}
