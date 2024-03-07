import { Rule } from '@angular-devkit/schematics';
import {
  CoerceSuffix,
  joinWithDash,
} from '@rxap/utilities';
import { AbstractControl } from '../types/abstract-control';
import {
  CoerceOperation,
  CoerceOperationOptions,
} from './coerce-operation';

export interface CoerceOptionsOperationRuleOptions extends CoerceOperationOptions {
  control: Required<AbstractControl>;
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
        type: control.type,
      },
    ],
  } = options;
  return CoerceOperation({
    ...options,
    propertyList,
    isArray,
    buildOperationDtoClassName: (controllerName, { dtoClassName, dtoClassNameSuffix }) => {
      const className = responseDtoName ?? joinWithDash([ dtoClassName ?? controllerName, control.name, 'control', 'options' ]);
      return dtoClassName ?? (
        dtoClassNameSuffix ? CoerceSuffix(className, dtoClassNameSuffix) : className
      );
    },
  });
}
