import {
  CoerceSuffix,
  noop,
} from '@rxap/utilities';
import {
  CoerceGetByIdControllerOptions,
  CoerceGetByIdOperation,
} from './coerce-get-by-id-operation';

export interface CoerceFormSubmitOperationOptions extends CoerceGetByIdControllerOptions {
  bodyDtoName?: string;
}

export function CoerceFormSubmitOperation(options: CoerceFormSubmitOperationOptions) {
  const {
    tsMorphTransform = noop,
    bodyDtoName,
    operationName = 'submit',
    isReturnVoid = true,
  } = options;

  return CoerceGetByIdOperation({
    ...options,
    operationName,
    isReturnVoid,
    buildOperationDtoClassName: (controllerName, { dtoClassName, dtoClassNameSuffix }) => {
      return dtoClassName ?? (
        dtoClassNameSuffix ? CoerceSuffix(bodyDtoName ?? controllerName, dtoClassNameSuffix) : bodyDtoName ?? controllerName
      );
    },
    tsMorphTransform: (
      project,
      sourceFile,
      classDeclaration,
      controllerName,
      moduleSourceFile,
      dto,
    ) => {

      if (!dto) {
        throw new Error('The dto must be created for an submit operation');
      }

      return {
        body: dto.className,
        method: 'post',
        ...tsMorphTransform!(project, sourceFile, classDeclaration, controllerName, moduleSourceFile, dto),
      };

    },
  });

}
