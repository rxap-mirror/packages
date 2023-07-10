import {
  CoerceOperation,
  CoerceOperationOptions,
} from './coerce-operation';
import { CoerceDtoClass } from './coerce-dto-class';
import { CoerceSuffix } from '@rxap/schematics-utilities';
import { CoerceImports } from '../ts-morph/coerce-imports';
import { DtoClassProperty } from '../create-dto-class';
import { SchematicsException } from '@angular-devkit/schematics';

export interface CoerceGetDataGridOperationOptions extends Omit<CoerceOperationOptions, 'operationName'> {
  collection?: boolean;
  propertyList?: DtoClassProperty[],
}

export function CoerceGetDataGridOperation(options: Readonly<CoerceGetDataGridOperationOptions>) {
  let {
    tsMorphTransform,
    collection,
    propertyList,
    controllerName,
    nestController,
    name,
  } = options;
  collection ??= false;
  tsMorphTransform ??= () => ({});
  propertyList ??= [];
  controllerName ??= nestController;
  controllerName ??= name;
  if (!controllerName) {
    throw new SchematicsException('No controller name provided!');
  }
  controllerName =
    CoerceSuffix(controllerName, '-data-grid');

  return CoerceOperation({
    ...options,
    // TODO : remove after migration to controllerName
    name: controllerName,
    nestController: controllerName,
    controllerName,
    operationName: 'get',
    tsMorphTransform: (
      project,
      sourceFile,
      classDeclaration,
      controllerName,
    ) => {

      const {
        className: dtoClassName,
        filePath: dtoFilePath,
      } = CoerceDtoClass(
        project,
        controllerName,
        propertyList!,
      );

      CoerceImports(sourceFile, {
        namedImports: [ dtoClassName ],
        moduleSpecifier: `..${ dtoFilePath }`,
      });

      return {
        returnType: dtoClassName + (collection ? '[]' : ''),
        ...tsMorphTransform!(project, sourceFile, classDeclaration, controllerName),
      };

    },
  });

}
