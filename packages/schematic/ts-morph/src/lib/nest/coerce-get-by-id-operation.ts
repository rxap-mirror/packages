import { CoerceDtoClass } from './coerce-dto-class';
import { CoerceOperation } from './coerce-operation';
import { CoerceSuffix } from '@rxap/schematics-utilities';
import { CoerceImports } from '../ts-morph/coerce-imports';
import { OperationParameter } from '../add-operation-to-controller';
import { DtoClassProperty } from '../create-dto-class';
import { SchematicsException } from '@angular-devkit/schematics';

export interface CoerceGetByIdControllerOptions {
  name?: string;
  controllerName?: string;
  nestController?: string;
  project: string;
  feature: string;
  shared: boolean;
  module?: string;
  nestModule?: string;
  paramList?: OperationParameter[],
  propertyList?: DtoClassProperty[],
  skipCoerce?: boolean,
  isArray?: boolean,
}

export function CoerceGetByIdOperation(options: CoerceGetByIdControllerOptions) {
  let {
    name,
    controllerName,
    nestController,
    isArray,
    module,
    nestModule,
    paramList,
    propertyList,
  } = options;

  nestModule ??= module;
  propertyList ??= [];
  paramList ??= [];
  controllerName ??= name;
  controllerName ??= nestController;

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
    if (!nestModule) {
      throw new SchematicsException('Could not determine the nest module name');
    }
    paramList.push({
      name: 'uuid',
      type: 'string',
      alias: isFirstBornSibling ? undefined : CoerceSuffix(nestModule, '-uuid'),
      fromParent: !isFirstBornSibling,
    });
  }

  return CoerceOperation({
    ...options,
    module: nestModule,
    nestModule,
    name: controllerName,
    nestController: controllerName,
    controllerName,
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
        returnType: dtoClassName + (isArray ? '[]' : ''),
      };

    },
  });

}
