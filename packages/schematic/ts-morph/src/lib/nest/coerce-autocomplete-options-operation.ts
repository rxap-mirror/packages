import { Rule } from '@angular-devkit/schematics';
import { NormalizedDataProperty } from '@rxap/ts-morph';
import { CoerceArrayItems } from '@rxap/utilities';
import {
  ClassDeclaration,
  SourceFile,
  WriterFunction,
} from 'ts-morph';
import { CoerceDtoClassOutput } from './coerce-dto-class';
import {
  CoerceOperation,
  CoerceOperationOptions,
  TransformOperation,
} from './coerce-operation';

export interface CoerceAutocompleteOptionsOperationRuleOptions extends CoerceOperationOptions {
  toDisplayProperty: NormalizedDataProperty;
  toValueProperty: NormalizedDataProperty;
}

export function BuildAutocompleteOptionsDtoDataMapperImplementation(
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

export function CoerceAutocompleteOptionsOperationRule(options: Readonly<CoerceAutocompleteOptionsOperationRuleOptions>): Rule {
  const {
    builtDtoDataMapperImplementation = BuildAutocompleteOptionsDtoDataMapperImplementation,
    isArray = true,
    propertyList = [],
    queryList = [],
  } = options;
  CoerceArrayItems(queryList, [{ name: 'search', type: 'string', hasQuestionToken: true }], (a, b) => a.name === b.name);
  CoerceArrayItems(propertyList, [
    {
      ...options.toValueProperty,
      name: 'value',
      source: options.toValueProperty.name,
    },
    {
      ...options.toDisplayProperty,
      name: 'display',
      source: options.toDisplayProperty.name,
    },
  ], (a, b) => a.name === b.name);
  return CoerceOperation({
    ...options,
    propertyList,
    isArray,
    builtDtoDataMapperImplementation,
  });
}
