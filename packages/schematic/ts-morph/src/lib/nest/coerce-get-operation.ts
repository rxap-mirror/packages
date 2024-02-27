import { CoerceSuffix } from '@rxap/schematics-utilities';
import { CoerceImports } from '@rxap/ts-morph';
import { CoerceDtoClass } from './coerce-dto-class';
import {
  CoerceOperation,
  CoerceOperationOptions,
} from './coerce-operation';
import { DtoClassProperty } from './dto-class-property';

export interface CoerceGetControllerOptions extends Omit<CoerceOperationOptions, 'operationName'> {
  propertyList?: DtoClassProperty[],
  isArray?: boolean,
  operationName?: string,
}

export function CoerceGetOperation(options: CoerceGetControllerOptions) {
  const {
    controllerName,
    isArray,
    paramList= [],
    propertyList = [],
    operationName = 'get',
  } = options;
  let { nestModule } = options;

  /**
   * If the module is not specified. This controller has an own module. Else the
   * module is originated by another controller.
   *
   * **Example**
   * true:
   * The controller ReportDetailsController should be extended with get Operation.
   * And the controller is used in the module ReportDetailsModule
   *
   * name = "report-details"
   * module = undefined
   *
   * false:
   * The controller ReportDetailsNotificationController should be extend with get Operation.
   * And the controller ise used in the module ReportDetailsModule
   *
   * name = "notification"
   * module = "report-details"
   */
  const isFirstBornSibling = !nestModule || nestModule === controllerName;

  if (isFirstBornSibling) {
    nestModule = controllerName;
  }

  return CoerceOperation({
    ...options,
    nestModule,
    controllerName,
    paramList,
    operationName,
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
