import {
  CoerceOperation,
  CoerceOperationOptions,
} from './coerce-operation';
import { CoerceDtoClass } from './coerce-dto-class';
import {
  classify,
  CoerceSuffix,
} from '@rxap/schematics-utilities';
import { CoerceImports } from '../ts-morph/coerce-imports';
import { SchematicsException } from '@angular-devkit/schematics';

export type CoerceGetChildrenOperationOptions = Omit<CoerceOperationOptions, 'operationName'>

export function CoerceGetChildrenOperation(options: Readonly<CoerceGetChildrenOperationOptions>) {
  let {
    tsMorphTransform,
    name,
    controllerName,
    nestController,
    paramList,
  } = options;
  tsMorphTransform ??= () => ({});
  controllerName ??= nestController;
  controllerName ??= name;
  if (!controllerName) {
    throw new SchematicsException('No controller name provided!');
  }
  if (!name) {
    throw new SchematicsException('No name provided!');
  }
  controllerName = CoerceSuffix(controllerName, '-tree-table');
  paramList ??= [];
  paramList.push({name: 'parentUuid', type: 'string'});
  return CoerceOperation({
    ...options,
    // TODO : remove after migration to controllerName
    name: controllerName,
    nestController: controllerName,
    controllerName,
    operationName: 'get-children',
    paramList,
    tsMorphTransform: (
      project,
      sourceFile,
      classDeclaration,
      controllerName,
    ) => {

      const {className, filePath} = CoerceDtoClass(
        project,
        CoerceSuffix(name!, '-item'),
        [
          {name: 'uuid', type: 'string'},
          {name: 'hasChildren', type: 'boolean'},
          {
            name: 'children',
            type: classify(CoerceSuffix(name!, '-item-dto')),
            isArray: true,
            isOptional: true,
            isType: true,
          },
        ],
      );

      CoerceImports(sourceFile, [
        {
          namedImports: ['plainToInstance'],
          moduleSpecifier: 'class-transformer',
        },
        {
          namedImports: ['classTransformOptions'],
          moduleSpecifier: '@rxap/nest/class-transformer/options',
        },
        {
          namedImports: [className],
          moduleSpecifier: `..${filePath}`,
        },
      ]);

      return {
        returnType: className + '[]',
        ...tsMorphTransform!(project, sourceFile, classDeclaration, controllerName),
      };
    },
  });
}
