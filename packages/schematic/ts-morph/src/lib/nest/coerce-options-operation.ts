import { Rule } from '@angular-devkit/schematics';
import {
  CoerceImports,
  IsNormalizedOpenApiUpstreamOptions,
  IsNormalizedOptionsRequestMapper,
  ToOptionsFunction,
} from '@rxap/ts-morph';
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
    upstream,
  } = options;
  return () => {
    if (upstream) {
      if (IsNormalizedOpenApiUpstreamOptions(upstream)) {
        const { mapper } = upstream;
        let toFunction = 'ToOptions';
        let toValue: string | null = null;
        let toDisplay: string | null = null;
        if (mapper && IsNormalizedOptionsRequestMapper(mapper)) {
          toFunction = mapper.toFunction ?? toFunction;
          toValue = mapper.toValue ?? toValue;
          toDisplay = mapper.toDisplay ?? toDisplay;
        }
        const sourceFile = classDeclaration.getSourceFile();
        switch (toFunction) {
          case ToOptionsFunction.TO_OPTIONS:
            CoerceImports(sourceFile, {
              namedImports: [ ToOptionsFunction.TO_OPTIONS ],
              moduleSpecifier: '@rxap/utilities',
            });
            break;
          case ToOptionsFunction.TO_OPTIONS_FROM_OBJECT:
            CoerceImports(sourceFile, {
              namedImports: [ ToOptionsFunction.TO_OPTIONS_FROM_OBJECT ],
              moduleSpecifier: '@rxap/utilities',
            });
            break;
        }
        return w => {
          w.write(toFunction);
          w.write('(data');
          if (toValue) {
            w.write(`, ${ toValue }`);
          }
          if (toDisplay) {
            if (!toValue) {
              w.write(', undefined');
            }
            w.write(`, ${ toDisplay }`);
          }
          w.write(')');
        };
      }
    }
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
