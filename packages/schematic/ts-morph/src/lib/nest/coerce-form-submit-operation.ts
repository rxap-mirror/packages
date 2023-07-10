import {CoerceDtoClass} from './coerce-dto-class';
import {CoerceOperation, CoerceOperationOptions} from './coerce-operation';
import {CoerceImports} from '../ts-morph/coerce-imports';
import {DtoClassProperty} from '../create-dto-class';

export interface CoerceFormSubmitOperationOptions extends Omit<CoerceOperationOptions, 'operationName'> {
  propertyList?: DtoClassProperty[] | null,
}

export function CoerceFormSubmitOperation(options: CoerceFormSubmitOperationOptions) {
  let {
    tsMorphTransform,
    paramList,
    propertyList,
  } = options;
  tsMorphTransform ??= () => ({});

  paramList ??= [];
  propertyList ??= [];

  return CoerceOperation({
    ...options,
    operationName: 'submit',
    tsMorphTransform: (
      project,
      sourceFile,
      classDeclaration,
      controllerName,
    ) => {

      const {className: dtoClassName, filePath: dtoFilePath} = CoerceDtoClass(
        project,
        controllerName,
        propertyList!,
      );

      CoerceImports(sourceFile, {
        namedImports: [dtoClassName],
        moduleSpecifier: `..${dtoFilePath}`,
      });

      return {
        body: dtoClassName,
        method: 'post',
        paramList,
        ...tsMorphTransform!(project, sourceFile, classDeclaration, controllerName),
      };

    },
  });

}
