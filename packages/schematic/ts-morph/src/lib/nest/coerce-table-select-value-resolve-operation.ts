import {
  DataProperty,
  IsNormalizedOpenApiUpstreamOptions,
  NormalizeDataProperty,
  NormalizedDataProperty,
} from '@rxap/ts-morph';
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

  propertyList.unshift({
    ...rowDisplayProperty,
    name: '__display',
    source: rowDisplayProperty.name,
  });
  propertyList.unshift({
    ...rowValueProperty,
    name: '__value',
    source: rowValueProperty.name,
  });
  propertyList.unshift(NormalizeDataProperty({
    ...rowIdProperty,
    name: '__rowId',
    source: rowIdProperty.name,
  }, 'number'));

  return CoerceOperation<CoerceTableSelectValueResolveOperationOptions>({
    ...options,
    buildUpstreamGetParametersImplementation,
  });
}
