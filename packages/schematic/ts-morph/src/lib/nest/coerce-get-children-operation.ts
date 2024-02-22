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

export type CoerceGetChildrenOperationOptions = CoerceGetRootOperationOptions

export function CoerceGetChildrenOperation(options: Readonly<CoerceGetChildrenOperationOptions>) {
  const {
    tsMorphTransform = noop,
    paramList = [],
    propertyList = [],
  } = options;
  let { controllerName } = options;
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
  controllerName = CoerceSuffix(controllerName, '-tree-table');
  paramList.push({
    name: 'parentUuid',
    type: 'string',
  });
  return CoerceOperation({
    ...options,
    // TODO : remove after migration to controllerName
    controllerName,
    operationName: 'get-children',
    paramList,
    tsMorphTransform: (
      project,
      sourceFile,
      classDeclaration,
      controllerName,
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
          namedImports: [ 'plainToInstance' ],
          moduleSpecifier: 'class-transformer',
        },
        {
          namedImports: [ 'classTransformOptions' ],
          moduleSpecifier: '@rxap/nest-utilities',
        },
        {
          namedImports: [ className ],
          moduleSpecifier: filePath,
        },
      ]);

      return {
        returnType: className + '[]',
        ...tsMorphTransform!(project, sourceFile, classDeclaration, controllerName),
      };
    },
  });
}
