import {
  CoerceArrayItems,
  noop,
} from '@rxap/utilities';
import {
  ClassDeclaration,
  SourceFile,
  WriterFunction,
} from 'ts-morph';
import { CoerceDtoClassOutput } from './coerce-dto-class';
import {
  CoerceGetByIdControllerOptions,
  CoerceGetByIdOperation,
} from './coerce-get-by-id-operation';
import {
  CoerceOperationOptions,
  TransformOperation,
} from './coerce-operation';
import { TABLE_QUERY_LIST } from './table-query-list';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CoerceGetRootOperationOptions extends CoerceGetByIdControllerOptions {
}

export function BuildGetRootDtoDataMapperImplementation(
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

export function CoerceGetRootOperation(options: Readonly<CoerceGetRootOperationOptions>) {
  const {
    tsMorphTransform = noop,
    propertyList = [],
    operationName = 'get-root',
    builtDtoDataMapperImplementation = BuildGetRootDtoDataMapperImplementation,
    idProperty = null,
    dtoClassNameSuffix = '-item',
    isArray = true,
  } = options;
  CoerceArrayItems(propertyList, [
    {
      name: 'hasChildren',
      type: 'boolean',
    },
    {
      name: 'children',
      type: '<self>',
      isArray: true,
      isOptional: true,
      isType: true,
    },
  ], (a, b) => a.name === b.name);
  return CoerceGetByIdOperation({
    ...options,
    operationName,
    idProperty,
    dtoClassNameSuffix,
    isArray,
    builtDtoDataMapperImplementation,
    tsMorphTransform: (
      project,
      sourceFile,
      classDeclaration,
      controllerName,
      moduleSourceFile,
      dto,
    ) => {

      return {
        queryList: TABLE_QUERY_LIST,
        ...tsMorphTransform!(project, sourceFile, classDeclaration, controllerName, moduleSourceFile, dto),
      };
    },
  });
}
