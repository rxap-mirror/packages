import { CoerceSuffix } from '@rxap/schematics-utilities';
import { CoerceImports } from '../ts-morph/coerce-imports';
import { CoerceDtoClass } from './coerce-dto-class';
import {
  CoerceOperation,
  CoerceOperationOptions,
} from './coerce-operation';
import { DtoClassProperty } from './create-dto-class';

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
  } = options;
  collection ??= false;
  tsMorphTransform ??= () => ({});
  propertyList ??= [];
  controllerName =
    CoerceSuffix(controllerName, '-data-grid');

  return CoerceOperation({
    ...options,
    controllerName,
    operationName: 'get',
    tsMorphTransform: (
      project,
      sourceFile,
      classDeclaration,
      controllerName,
      moduleSourceFile,
    ) => {

      const {
        className: dtoClassName,
        filePath: dtoFilePath,
      } = CoerceDtoClass({
        project,
        name: controllerName,
        propertyList,
      });

      CoerceImports(sourceFile, {
        namedImports: [ dtoClassName ],
        moduleSpecifier: dtoFilePath,
      });

      return {
        returnType: dtoClassName + (collection ? '[]' : ''),
        ...tsMorphTransform!(project, sourceFile, classDeclaration, controllerName, moduleSourceFile),
      };

    },
  });

}
