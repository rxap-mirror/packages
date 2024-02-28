import { Rule } from '@angular-devkit/schematics';
import { joinWithDash } from '@rxap/utilities';
import { FormDefinitionControl } from '../types/form-definition-control';
import {
  CoerceOperation,
  CoerceOperationOptions,
} from './coerce-operation';

export interface CoerceOptionsOperationRuleOptions extends CoerceOperationOptions {
  control: Required<FormDefinitionControl>;
  responseDtoName?: string;
}

export function CoerceOptionsOperationRule(options: Readonly<CoerceOptionsOperationRuleOptions>): Rule {
  const {
    control,
    context,
    responseDtoName = joinWithDash([ context, control.name, 'options' ]),
    dtoClassName = responseDtoName,
    isArray = true,
    propertyList = [
      {
        name: 'display',
        type: 'string',
      },
      {
        name: 'value',
        type: control,
      },
    ],
  } = options;
  return CoerceOperation({
    ...options,
    propertyList,
    dtoClassName,
    isArray,
  });
}
