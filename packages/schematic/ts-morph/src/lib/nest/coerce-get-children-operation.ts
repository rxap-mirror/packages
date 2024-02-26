import {
  classify,
  CoerceSuffix,
} from '@rxap/schematics-utilities';
import {
  CoerceArrayItems,
  noop,
} from '@rxap/utilities';
import { CoerceImports } from '../ts-morph/coerce-imports';
import { CoerceDtoClass } from './coerce-dto-class';
import { CoerceGetRootOperationOptions } from './coerce-get-root-operation';
import {
  CoerceOperation,
  CoerceOperationOptions,
} from './coerce-operation';
import { TABLE_QUERY_LIST } from './table-query-list';

export type CoerceGetChildrenOperationOptions = CoerceGetRootOperationOptions

export function CoerceGetChildrenOperation(options: Readonly<CoerceGetChildrenOperationOptions>) {
  const {
    tsMorphTransform = noop,
    paramList = [],
    propertyList = [],
    operationName = 'get-children',
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
  paramList.push({
    name: 'parentUuid',
    type: 'string',
  });
  return CoerceOperation({
    ...options,
    operationName,
    paramList,
    tsMorphTransform: (
      project,
      sourceFile,
      classDeclaration,
      controllerName,
      moduleSourceFile,
    ) => {

      const {
        className,
        filePath,
      } = CoerceDtoClass({
        project,
        name: CoerceSuffix(controllerName, '-item'),
        propertyList,
      });

      CoerceImports(sourceFile, [
        {
          namedImports: [ 'FilterQuery', 'FilterQueryPipe' ],
          moduleSpecifier: '@rxap/nest-utilities',
        },
        {
          namedImports: [ className ],
          moduleSpecifier: filePath,
        },
      ]);

      return {
        queryList: TABLE_QUERY_LIST,
        returnType: className + '[]',
        ...tsMorphTransform!(project, sourceFile, classDeclaration, controllerName, moduleSourceFile),
      };
    },
  });
}
