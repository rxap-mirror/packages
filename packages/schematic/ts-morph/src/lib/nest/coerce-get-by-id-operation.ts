import { CoerceSuffix } from '@rxap/schematics-utilities';
import { CoerceImports } from '../ts-morph/coerce-imports';
import { CoerceDtoClass } from './coerce-dto-class';
import {
  CoerceOperation,
  CoerceOperationOptions,
} from './coerce-operation';
import { DtoClassProperty } from './create-dto-class';

export interface CoerceGetByIdControllerOptions extends Omit<CoerceOperationOptions, 'operationName'> {
  propertyList?: DtoClassProperty[],
  isArray?: boolean,
}

export function CoerceGetByIdOperation(options: CoerceGetByIdControllerOptions) {
  let {
    controllerName,
    isArray,
    nestModule,
    paramList,
    propertyList,
  } = options;

  propertyList ??= [];
  paramList ??= [];

  /**
   * If the module is not specified. This controller has an own module. Else the
   * module is originated by another controller.
   *
   * **Example**
   * true:
   * The controller ReportDetailsController should be extended with getById Operation.
   * And the controller is used in the module ReportDetailsModule
   *
   * name = "report-details"
   * module = undefined
   *
   * false:
   * The controller ReportDetailsNotificationController should be extend with getById Operation.
   * And the controller ise used in the module ReportDetailsModule
   *
   * name = "notification"
   * module = "report-details"
   */
  const isFirstBornSibling = !nestModule || nestModule === controllerName;

  if (isFirstBornSibling && !propertyList.some(param => param.name === 'uuid')) {
    propertyList.unshift({
      name: 'uuid',
      type: 'string',
    });
  }

  if (isFirstBornSibling) {
    nestModule = controllerName;
  }

  if (!paramList.some(param => param.name === 'uuid')) {
    paramList.push({
      name: 'uuid',
      type: 'string',
      alias: isFirstBornSibling ? undefined : CoerceSuffix(nestModule!, '-uuid'),
      fromParent: !isFirstBornSibling,
    });
  }

  return CoerceOperation({
    ...options,
    nestModule,
    controllerName: controllerName!,
    paramList,
    operationName: 'getById',
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
        name: controllerName,
        propertyList,
      });

      CoerceImports(sourceFile, {
        namedImports: [ dtoClassName ],
        moduleSpecifier: dtoFilePath,
      });

      return {
        returnType: dtoClassName + (isArray ? '[]' : ''),
      };

    },
  });

}
