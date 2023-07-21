import {
  classify,
  CoerceSuffix,
} from '@rxap/schematics-utilities';
import { CoerceImports } from '../ts-morph/coerce-imports';
import { CoerceDtoClass } from './coerce-dto-class';
import {
  CoerceOperation,
  CoerceOperationOptions,
} from './coerce-operation';

export type CoerceGetRootOperationOptions = Omit<CoerceOperationOptions, 'operationName'>

export function CoerceGetRootOperation(options: Readonly<CoerceGetRootOperationOptions>) {
  let {
    tsMorphTransform,
    controllerName,
  } = options;
  tsMorphTransform ??= () => ({});
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
        propertyList: [
          {
            name: 'uuid',
            type: 'string',
          },
          {
            name: 'hasChildren',
            type: 'boolean',
          },
          {
            name: 'children',
            type: classify(CoerceSuffix(controllerName, '-item-dto')),
            isArray: true,
            isOptional: true,
            isType: true,
          },
        ],
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
