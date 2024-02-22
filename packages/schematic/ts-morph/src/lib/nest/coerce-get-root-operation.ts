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
import {
  CoerceOperation,
  CoerceOperationOptions,
} from './coerce-operation';
import { DtoClassProperty } from './create-dto-class';

export interface CoerceGetRootOperationOptions extends Omit<CoerceOperationOptions, 'operationName'> {
  propertyList?: DtoClassProperty[],
}

export function CoerceGetRootOperation(options: Readonly<CoerceGetRootOperationOptions>) {
  const {
    tsMorphTransform = noop,
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
  return CoerceOperation({
    ...options,
    controllerName,
    operationName: 'get-root',
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
