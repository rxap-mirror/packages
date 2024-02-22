import {
  joinWithDash,
  noop,
} from '@rxap/utilities';
import { CoerceImports } from '../ts-morph/coerce-imports';
import { CoerceDtoClass } from './coerce-dto-class';
import {
  CoerceOperation,
  CoerceOperationOptions,
} from './coerce-operation';
import { DtoClassProperty } from './create-dto-class';

export interface CoerceFormSubmitOperationOptions extends Omit<CoerceOperationOptions, 'operationName'> {
  propertyList?: DtoClassProperty[],
  bodyDtoName?: string;
}

export function CoerceFormSubmitOperation(options: CoerceFormSubmitOperationOptions) {
  const {
    tsMorphTransform = noop,
    controllerName,
    propertyList= [],
    context,
    bodyDtoName= joinWithDash([ context, controllerName ]),
  } = options;

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
