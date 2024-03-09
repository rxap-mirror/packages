import { Rule } from '@angular-devkit/schematics';
import {
  IsNormalizedOpenApiUpstreamOptions,
  NormalizedDataProperty,
} from '@rxap/ts-morph';
import { CoerceArrayItems } from '@rxap/utilities';
import {
  ClassDeclaration,
  SourceFile,
  WriterFunction,
  Writers,
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
  options: Readonly<CoerceAutocompleteOptionsOperationRuleOptions>,
): TransformOperation<string | WriterFunction> {
  const {
    isArray,
  } = options;
  return () => {
    const { upstream, toValueProperty, toDisplayProperty } = options;
    if (upstream && IsNormalizedOpenApiUpstreamOptions(upstream)) {
      return w => {
        w.write('(data.entities ?? []).map(item => ({');
        w.indent(() => {
          w.writeLine(`value: item.${toValueProperty.name},`);
          w.writeLine(`display: item.${toDisplayProperty.name},`);
          w.writeLine(`${toDisplayProperty.name}: item.${toDisplayProperty.name},`);
          w.writeLine(`${toValueProperty.name}: item.${toValueProperty.name}`);
        });
        w.write('}))');
      };
    }
    // TODO : implement the data mapper
    return isArray ? '[]' : '{}';
  };
}

export function BuildAutocompleteOptionsUpstreamGetParametersImplementation(
  classDeclaration: ClassDeclaration,
  moduleSourceFile: SourceFile,
  dto: CoerceDtoClassOutput | null,
  options: Readonly<CoerceAutocompleteOptionsOperationRuleOptions>,
): TransformOperation<string | WriterFunction> {
  return () => {
    const { upstream, toDisplayProperty } = options;
    if (upstream && IsNormalizedOpenApiUpstreamOptions(upstream)) {
      return Writers.object({
        parameters: Writers.object({
          filter: w => {
            w.write('search ? ');
            w.write(`\`${toDisplayProperty.name}:\${ search }\``);
            w.write(` : ''`);
          },
          sort: w => w.quote('__updatedAt'),
          order: w => w.quote('desc'),
          page: '0',
          size: '10'
        }),
      });
    }
    return '';
  };
}

export function CoerceAutocompleteOptionsOperationRule(options: Readonly<CoerceAutocompleteOptionsOperationRuleOptions>): Rule {
  const {
    builtDtoDataMapperImplementation = BuildAutocompleteOptionsDtoDataMapperImplementation,
    buildUpstreamGetParametersImplementation = BuildAutocompleteOptionsUpstreamGetParametersImplementation,
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
  return CoerceOperation<CoerceAutocompleteOptionsOperationRuleOptions>({
    ...options,
    propertyList,
    isArray,
    queryList,
    buildUpstreamGetParametersImplementation,
    builtDtoDataMapperImplementation,
  });
}
