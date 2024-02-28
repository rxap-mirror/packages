import {
  CoerceArrayItems,
  noop,
} from '@rxap/utilities';
import {
  CoerceGetByIdControllerOptions,
  CoerceGetByIdOperation,
} from './coerce-get-by-id-operation';
import { TABLE_QUERY_LIST } from './table-query-list';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CoerceGetRootOperationOptions extends CoerceGetByIdControllerOptions {
}

export function CoerceGetRootOperation(options: Readonly<CoerceGetRootOperationOptions>) {
  const {
    tsMorphTransform = noop,
    propertyList = [],
    operationName = 'get-root',
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
