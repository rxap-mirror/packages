import { DtoClassProperty } from '../create-dto-class';
import { CoerceDtoClass } from './coerce-dto-class';
import {
  CoerceOperation,
  CoerceOperationOptions,
} from './coerce-operation';
import { CoerceImports } from '../ts-morph/coerce-imports';
import { joinWithDash } from '@rxap/utilities';

export interface CoerceFormSubmitOperationOptions extends Omit<CoerceOperationOptions, 'operationName'> {
  propertyList?: DtoClassProperty[] | null,
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
      } = CoerceDtoClass(
        project,
        bodyDtoName!,
        propertyList!,
      );

      CoerceImports(sourceFile, {
        namedImports: [ dtoClassName ],
        moduleSpecifier: `..${ dtoFilePath }`,
      });

      return {
        body: dtoClassName,
        method: 'post',
        ...tsMorphTransform!(project, sourceFile, classDeclaration, controllerName),
      };

    },
  });

}
