import { CoerceSuffix } from '@rxap/schematics-utilities';
import { CoerceGetOperation } from './coerce-get-operation';
import { CoerceOperationOptions } from './coerce-operation';
import { DtoClassProperty } from './dto-class-property';

export interface CoerceGetByIdControllerOptions extends Omit<CoerceOperationOptions, 'operationName'> {
  propertyList?: DtoClassProperty[],
  isArray?: boolean,
  idProperty?: DtoClassProperty,
  operationName?: string,
}

export function CoerceGetByIdOperation(options: CoerceGetByIdControllerOptions) {
  const {
    controllerName,
    paramList= [],
    propertyList = [],
    idProperty = { name: 'uuid', type: 'string' },
    operationName = 'getById',
  } = options;
  let { nestModule } = options;

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

  if (isFirstBornSibling && !propertyList.some(param => param.name === idProperty.name)) {
    propertyList.unshift(idProperty);
  }

  if (isFirstBornSibling) {
    nestModule = controllerName;
  }

  if (!paramList.some(param => param.name === idProperty.name)) {
    paramList.push({
      name: idProperty.name,
      type: idProperty.type,
      alias: isFirstBornSibling ? undefined : CoerceSuffix(nestModule!, '-' + idProperty.name),
      fromParent: !isFirstBornSibling,
    });
  }

  return CoerceGetOperation({
    ...options,
    operationName,
    nestModule,
    paramList,
    propertyList,
  });

}
