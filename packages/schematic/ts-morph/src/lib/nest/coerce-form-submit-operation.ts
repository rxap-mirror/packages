import { joinWithDash } from '@rxap/utilities';
import { CoerceImports } from '../ts-morph/coerce-imports';
import { CoerceDtoClass } from './coerce-dto-class';
import {
  CoerceOperation,
  CoerceOperationOptions,
} from './coerce-operation';
import { DtoClassProperty } from './create-dto-class';

export interface CoerceFormSubmitOperationOptions extends Omit<CoerceOperationOptions, 'operationName'> {
  propertyList?: DtoClassProperty[] | null,
  bodyDtoName?: string;
}

export function CoerceFormSubmitOperation(options: CoerceFormSubmitOperationOptions) {
  let {
    tsMorphTransform,
    controllerName,
    propertyList,
    bodyDtoName,
    context,
  } = options;
  tsMorphTransform ??= () => ({});

  propertyList ??= [];
  bodyDtoName ??= joinWithDash([ context, controllerName ]);

  return CoerceOperation({
    ...options,
    operationName: 'submit',
    tsMorphTransform: (
      project,
      sourceFile,
      classDeclaration,
      controllerName,
    ) => {

      const {
        className: dtoClassName,
        filePath: dtoFilePath,
      } = CoerceDtoClass({
        project,
        name: bodyDtoName!,
        propertyList,
      });

      CoerceImports(sourceFile, {
        namedImports: [ dtoClassName ],
        moduleSpecifier: dtoFilePath,
      });

      return {
        body: dtoClassName,
        method: 'post',
        ...tsMorphTransform!(project, sourceFile, classDeclaration, controllerName),
      };

    },
  });

}
