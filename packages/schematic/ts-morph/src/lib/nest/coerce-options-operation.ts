import { Rule } from '@angular-devkit/schematics';
import {
  CoerceSuffix,
  joinWithDash,
} from '@rxap/utilities';
import {
  ClassDeclaration,
  SourceFile,
  WriterFunction,
} from 'ts-morph';
import { AbstractControl } from '../types/abstract-control';
import { CoerceDtoClassOutput } from './coerce-dto-class';
import {
  CoerceOperation,
  CoerceOperationOptions,
  TransformOperation,
} from './coerce-operation';

export interface CoerceOptionsOperationRuleOptions extends CoerceOperationOptions {
  control: AbstractControl;
  responseDtoName?: string;
}

export function BuildOptionsDtoDataMapperImplementation(
  classDeclaration: ClassDeclaration,
  moduleSourceFile: SourceFile,
  dto: CoerceDtoClassOutput | null,
  options: Readonly<CoerceOperationOptions>,
): TransformOperation<string | WriterFunction> {
  const {
    isArray,
  } = options;
  return () => {
    // TODO : implement the data mapper
    return isArray ? '[]' : '{}';
  };
}

export function CoerceOptionsOperationRule(options: Readonly<CoerceOptionsOperationRuleOptions>): Rule {
  const {
    control,
    builtDtoDataMapperImplementation = BuildOptionsDtoDataMapperImplementation,
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
    builtDtoDataMapperImplementation,
    buildOperationDtoClassName: (controllerName, { dtoClassName, dtoClassNameSuffix }) => {
      const className = responseDtoName ?? joinWithDash([ dtoClassName ?? controllerName, control.name, 'control', 'options' ]);
      return dtoClassName ?? (
        dtoClassNameSuffix ? CoerceSuffix(className, dtoClassNameSuffix) : className
      );
    },
  });
}
