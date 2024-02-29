import {
  IsNormalizedOpenApiUpstreamOptions,
  NormalizeTypeImport,
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
  rowDisplayProperty?: string;
  rowValueProperty?: string;
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
    rowDisplayProperty = 'name',
    rowValueProperty = 'uuid',
  } = options;

  propertyList.unshift({
    name: '__display',
    type: NormalizeTypeImport('string'),
    isArray: false,
    source: rowDisplayProperty,
  });
  propertyList.unshift({
    name: '__value',
    type: NormalizeTypeImport('string'),
    isArray: false,
    source: rowValueProperty,
  });

  return CoerceOperation({
    ...options,
    buildUpstreamGetParametersImplementation,
  });
}
