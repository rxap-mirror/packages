import { ProviderToken } from '@angular/core';
import { RxapFormControl } from '@rxap/forms';
import { Mixin } from '@rxap/mixin';
import { MethodWithParameters } from '@rxap/pattern';
import { ControlOption } from '@rxap/utilities';
import { ExtractControlMixin } from './extract-control.mixin';
import { ExtractFormDefinitionMixin } from './extract-form-definition.mixin';
import { ExtractMethodMixin } from './extract-method.mixin';
import {
  UseMethod,
  UseMethodConfig,
} from './extract-methods.mixin';

export const RESOLVE_METHOD_NAME = 'resolve';

export function UseResolveMethod<Value = unknown>(
  method: ProviderToken<MethodWithParameters<ControlOption, Value>>,
): any;
export function UseResolveMethod<Value = unknown>(
  method: ProviderToken<MethodWithParameters>,
  config: UseMethodConfig<ControlOption, Value>,
): any;
export function UseResolveMethod<Value = unknown>(
  method: ProviderToken<MethodWithParameters<ControlOption, Value>>,
  config?: UseMethodConfig,
) {
  return function (target: any, propertyKey: string) {
    UseMethod(method, RESOLVE_METHOD_NAME, config)(target, propertyKey);
  };
}

export interface ExtractResolveMethodMixin extends ExtractFormDefinitionMixin, ExtractMethodMixin,
  ExtractControlMixin {
}

@Mixin(ExtractFormDefinitionMixin, ExtractMethodMixin, ExtractControlMixin)
export class ExtractResolveMethodMixin {

  protected extractResolveMethod(
    control: RxapFormControl = this.extractControl(),
    formDefinition           = this.extractFormDefinition(control),
  ) {
    return this.extractMethod(formDefinition, control.controlId, RESOLVE_METHOD_NAME);
  }

}
