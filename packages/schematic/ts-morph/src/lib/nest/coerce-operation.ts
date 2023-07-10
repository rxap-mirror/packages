import {
  chain,
  noop,
  Rule,
  SchematicsException,
} from '@angular-devkit/schematics';
import { CoerceNestModule } from './coerce-nest-module';
import { CoerceNestController } from './coerce-nest-controller';
import { TsMorphNestProjectTransform } from '../ts-morph-transform';
import { classify } from '@rxap/schematics-utilities';
import {
  ClassDeclaration,
  Project,
  SourceFile,
} from 'ts-morph';
import { BuildNestControllerName } from './build-nest-controller-name';
import { CoerceImports } from '../ts-morph/coerce-imports';
import {
  AddOperationToController,
  OperationOptions,
  OperationParameter,
} from '../add-operation-to-controller';

export interface CoerceOperationOptions {
  /**
   * @deprecated use controllerName instead
   */
  name?: string;
  controllerName?: string;
  nestController?: string;
  project: string;
  feature?: string;
  shared?: boolean;
  /**
   * @deprecated use nestModule instead
   */
  module?: string;
  nestModule?: string;
  skipCoerce?: boolean;
  paramList?: OperationParameter[],
  queryList?: OperationParameter[],
  tsMorphTransform?: (
    project: Project,
    sourceFile: SourceFile,
    classDeclaration: ClassDeclaration,
    controllerName: string,
  ) => Partial<OperationOptions>,
  operationName: string,
  path?: string,
  controllerPath?: string,
}

export function CoerceOperation(options: CoerceOperationOptions): Rule {
  let {
    nestModule,
    nestController,
    controllerName,
    name,
    project,
    module,
    paramList,
    feature,
    shared,
    tsMorphTransform,
    operationName,
    skipCoerce,
    controllerPath,
    queryList,
    path,
  } = options;

  nestModule ??= module;
  tsMorphTransform ??= () => ({});
  controllerName ??= name;
  controllerName ??= nestController;
  paramList ??= [];
  queryList ??= [];

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

  controllerName = BuildNestControllerName({
    controllerName,
    nestModule,
  });

  if (isFirstBornSibling) {
    nestModule = controllerName;
  }

  console.log(`Coerce Operation '${ operationName }' with path '${ path }' in the controller '${ controllerName }' in the module '${ nestModule }'`);

  if (!nestModule) {
    throw new SchematicsException('FATAL: the nestModule property is not defined');
  }

  return chain([
    skipCoerce ? noop() : chain([
      CoerceNestModule({
        project,
        feature,
        shared,
        name: nestModule,
      }),
      CoerceNestController({
        ...options,
        name: controllerName,
        module: nestModule,
      }),
    ]),
    TsMorphNestProjectTransform(options, project => {

      const sourceFile = project.getSourceFileOrThrow(`/${ nestModule }/${ controllerName }.controller.ts`);
      const classDeclaration = sourceFile.getClassOrThrow(`${ classify(controllerName!) }Controller`);

      const operationOptions = tsMorphTransform!(project, sourceFile, classDeclaration, controllerName!);

      if (controllerPath) {
        classDeclaration.getDecoratorOrThrow('Controller').set({
          arguments: [ w => w.quote(`${ nestModule }/${ controllerPath }`) ],
        });
      } else if (!isFirstBornSibling) {
        const parentParamList = paramList!.filter(p => p.fromParent);
        classDeclaration.getDecoratorOrThrow('Controller').set({
          arguments: [
            w => w.quote(`${ nestModule }/${ parentParamList.length ?
              parentParamList.map(param => `:${ param.name }`).join('/') + '/' :
              '' }${ controllerName!.replace(nestModule + '-', '') }`),
          ],
        });
      }

      CoerceImports(sourceFile, AddOperationToController(
        classDeclaration,
        operationName,
        {
          isAsync: true,
          paramList,
          queryList,
          path,
          ...operationOptions,
        },
      ));

    }),
  ]);


}
