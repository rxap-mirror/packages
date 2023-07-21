import { CoerceImports } from '../ts-morph/coerce-imports';
import { CoerceDtoClass } from './coerce-dto-class';
import {
  CoerceOperation,
  CoerceOperationOptions,
} from './coerce-operation';

export interface CoerceTreeOperationOptions extends Omit<CoerceOperationOptions, 'operationName'> {
  operationName?: string;
  fullTree?: boolean;
}

export function CoerceTreeOperationRule(options: CoerceTreeOperationOptions) {
  let {
    tsMorphTransform,
    operationName,
    fullTree,
    path,
  } = options;
  operationName ??= 'tree';
  fullTree ??= false;
  path ??= 'tree';
  tsMorphTransform ??= () => ({});

  if (!fullTree) {
    throw new Error('non full tree not implemented yet');
  }

  return CoerceOperation({
    ...options,
    path,
    operationName,
    tsMorphTransform: (project, sourceFile, classDeclaration, controllerName) => {

      const {
        className,
        filePath,
      } = CoerceDtoClass({
        project,
        name: 'TreeNode',
        propertyList: [
        {
          name: 'id',
          type: 'string',
        },
        {
          name: 'name',
          type: 'string',
        },
        {
          name: 'type',
          type: 'string',
        },
        {
          name: 'icon',
          type: 'IconConfigDto',
          isType: true,
        },
        {
          name: 'children',
          isOptional: true,
          isArray: true,
          isType: true,
          type: '<self>',
        },
        ]
      });

      CoerceImports(
        sourceFile,
        {
          namedImports: [ className ],
          moduleSpecifier: filePath,
        },
      );

      return {
        returnType: className + '[]',
        ...tsMorphTransform!(project, sourceFile, classDeclaration, controllerName),
      };
    },
  });
}
