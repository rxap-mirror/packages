import {
  DataProperty,
  IsNormalizedOpenApiUpstreamOptions,
  NormalizeDataProperty,
  NormalizedDataProperty,
} from '@rxap/ts-morph';
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

export interface CoerceTableSelectValueResolveOperationOptions
  extends CoerceOperationOptions {
  rowIdProperty: DataProperty;
  rowDisplayProperty: NormalizedDataProperty;
  rowValueProperty?: NormalizedDataProperty;
}

export function BuildTableSelectValueResolveUpstreamGetParametersImplementation(
                                                             classDeclaration: ClassDeclaration,
                                                             moduleSourceFile: SourceFile,
                                                             dto: CoerceDtoClassOutput | null,
                                                             options: Readonly<CoerceTableSelectValueResolveOperationOptions>,
                                                           ): TransformOperation<string | WriterFunction> {
  return () => {
    const { upstream } = options;
    if (upstream) {
      if (IsNormalizedOpenApiUpstreamOptions(upstream)) {
        if (upstream.mapper?.value) {
          return `{ parameters: { ${ upstream.mapper.value }: value } }`;
        }
      }
      return '{ value }';
    }
    return '';
  };
}

export function CoerceTableSelectValueResolveOperationRule(options: CoerceTableSelectValueResolveOperationOptions) {
  const {
    buildUpstreamGetParametersImplementation = BuildTableSelectValueResolveUpstreamGetParametersImplementation,
    propertyList = [],
    rowIdProperty,
    rowDisplayProperty,
    rowValueProperty = NormalizeDataProperty(rowIdProperty),
  } = options;

  CoerceArrayItems(propertyList, [
    {
      ...rowValueProperty,
      name: '__value',
      source: rowValueProperty.name,
    },
    {
      ...rowDisplayProperty,
      name: '__display',
      source: rowDisplayProperty.name,
    },
    NormalizeDataProperty({
      ...rowIdProperty,
      name: '__rowId',
      source: rowIdProperty.name,
    }, 'number')
  ], { compareTo: (a, b) => a.name === b.name, unshift: true });

  return CoerceOperation<CoerceTableSelectValueResolveOperationOptions>({
    ...options,
    buildUpstreamGetParametersImplementation,
  });
}
