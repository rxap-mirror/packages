import { CoerceSuffix } from '@rxap/schematics-utilities';
import { CoerceImports } from '@rxap/ts-morph';
import { noop } from '@rxap/utilities';
import {
  ClassDeclaration,
  Project,
  SourceFile,
} from 'ts-morph';
import { OperationOptions } from './add-operation-to-controller';
import {
  CoerceDtoClass,
  CoerceDtoClassOutput,
} from './coerce-dto-class';
import {
  CoerceOperation,
  CoerceOperationOptions,
} from './coerce-operation';
import { DtoClassProperty } from './dto-class-property';

export interface CoerceGetControllerOptions extends Omit<CoerceOperationOptions, 'operationName' | 'tsMorphTransform'> {
  propertyList?: DtoClassProperty[],
  isArray?: boolean,
  operationName?: string,
  tsMorphTransform?: (
    project: Project,
    sourceFile: SourceFile,
    classDeclaration: ClassDeclaration,
    controllerName: string,
    moduleSourceFile: SourceFile,
    dto: CoerceDtoClassOutput
  ) => Partial<OperationOptions>,
}

export function CoerceGetOperation(options: CoerceGetControllerOptions) {
  const {
    controllerName,
    isArray,
    propertyList = [],
    operationName = 'get',
    tsMorphTransform = noop,
  } = options;

  return CoerceOperation({
    ...options,
    controllerName,
    operationName,
    tsMorphTransform: (
      project,
      sourceFile,
      classDeclaration,
      controllerName,
      moduleSourceFile
    ) => {

      const dto = CoerceDtoClass({
        project,
        name: controllerName,
        propertyList,
      });

      const {
        className: dtoClassName,
        filePath: dtoFilePath,
      } = dto;

      CoerceImports(sourceFile, {
        namedImports: [ dtoClassName ],
        moduleSpecifier: dtoFilePath,
      });

      return {
        returnType: dtoClassName + (isArray ? '[]' : ''),
        ...tsMorphTransform(project, sourceFile, classDeclaration, controllerName, moduleSourceFile, dto) ?? {},
      };

    },
  });

}
