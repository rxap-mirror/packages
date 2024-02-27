import { CoerceSuffix } from '@rxap/schematics-utilities';
import { noop } from '@rxap/utilities';
import { CoerceImports } from '../ts-morph/coerce-imports';
import { CoerceDtoClass } from './coerce-dto-class';
import {
  CoerceOperation,
  CoerceOperationOptions,
} from './coerce-operation';
import { DtoClassProperty } from './dto-class-property';

export interface CoerceGetDataGridOperationOptions extends Omit<CoerceOperationOptions, 'operationName'> {
  collection?: boolean;
  propertyList?: DtoClassProperty[],
}

export function CoerceGetDataGridOperation(options: Readonly<CoerceGetDataGridOperationOptions>) {
  const {
    tsMorphTransform = noop,
    collection= false,
    propertyList = [],
    controllerName,
  } = options;

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
