import {
  CoerceOperation,
  CoerceOperationOptions,
} from './coerce-operation';
import { DtoClassProperty } from '../create-dto-class';
import { CoerceDtoClass } from './coerce-dto-class';
import { CoerceSuffix } from '@rxap/schematics-utilities';
import { CoerceImports } from '../ts-morph/coerce-imports';

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
