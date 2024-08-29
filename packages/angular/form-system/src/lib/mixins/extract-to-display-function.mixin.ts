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

export const TO_DISPLAY_FUNCTION_NAME = 'to-display';

export function UseToDisplayFunction(
  fnc: UseFunctionType<[any], string>,
): any;
export function UseToDisplayFunction(
  fnc: UseFunctionType<any[], any>,
  config: UseFunctionConfig<string, any[], any, [any]>,
): any;
export function UseToDisplayFunction(
  fnc: UseFunctionType<[any], string>,
  config?: UseMethodConfig,
) {
  return function (target: any, propertyKey: string) {
    UseFunction(fnc, TO_DISPLAY_FUNCTION_NAME, config)(target, propertyKey);
  };
}

export interface ExtractToDisplayFunctionMixin extends ExtractFormDefinitionMixin, ExtractFunctionMixin,
  ExtractControlMixin {
}

@Mixin(ExtractFormDefinitionMixin, ExtractFunctionMixin, ExtractControlMixin)
export class ExtractToDisplayFunctionMixin {

  protected extractToDisplayFunction(
    defaultFunction: UseFunctionType<[any], string> | null = null,
    control: RxapFormControl = this.extractControl(),
    formDefinition           = this.extractFormDefinition(control),
  ): UseFunctionType<[any], string> {
    return this.extractFunction(defaultFunction, formDefinition, control.controlId, TO_DISPLAY_FUNCTION_NAME);
  }

}
