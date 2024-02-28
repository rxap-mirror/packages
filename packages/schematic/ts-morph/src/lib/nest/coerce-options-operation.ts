import { Rule } from '@angular-devkit/schematics';
import {
  CoerceSuffix,
  joinWithDash,
} from '@rxap/utilities';
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
    isArray = true,
    responseDtoName,
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
    isArray,
    buildOperationDtoClassName: (controllerName, { dtoClassName, dtoClassNameSuffix }) => {
      return dtoClassName ?? (
        dtoClassNameSuffix ? CoerceSuffix(responseDtoName ?? joinWithDash([ dtoClassName, 'control', control.name, 'options' ]), dtoClassNameSuffix) : responseDtoName ?? joinWithDash([ dtoClassName, 'control', control.name, 'options' ])
      );
    },
  });
}
