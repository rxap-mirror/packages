import { ProviderToken } from '@angular/core';
import { RxapFormControl } from '@rxap/forms';
import { Mixin } from '@rxap/mixin';
import { Method } from '@rxap/pattern';
import { ControlOptions } from '@rxap/utilities';
import { ExtractControlMixin } from './extract-control.mixin';
import { ExtractFormDefinitionMixin } from './extract-form-definition.mixin';
import { ExtractMethodMixin } from './extract-method.mixin';
import {
  UseMethod,
  UseMethodConfig,
} from './extract-methods.mixin';

export const OPTIONS_METHOD_NAME = 'options';

export function UseOptionsMethod(method: ProviderToken<Method<ControlOptions>>, config?: UseMethodConfig) {
  return function (target: any, propertyKey: string) {
    UseMethod(method, OPTIONS_METHOD_NAME, config)(target, propertyKey);
  };
}

export interface ExtractOptionsMethodMixin extends ExtractFormDefinitionMixin, ExtractMethodMixin,
  ExtractControlMixin {
}

@Mixin(ExtractFormDefinitionMixin, ExtractMethodMixin, ExtractControlMixin)
export class ExtractOptionsMethodMixin {

  protected extractOptionsMethod(
    control: RxapFormControl = this.extractControl(),
    formDefinition           = this.extractFormDefinition(control),
  ) {
    return this.extractMethod(formDefinition, control.controlId, OPTIONS_METHOD_NAME);
  }

}
