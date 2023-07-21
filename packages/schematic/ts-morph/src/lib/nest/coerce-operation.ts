import {
  chain,
  noop,
  Rule,
} from '@angular-devkit/schematics';
import {
  AddOperationToController,
  OperationOptions,
  OperationParameter,
} from '../add-operation-to-controller';
import { CoerceNestModule } from './coerce-nest-module';
import { CoerceNestController } from './coerce-nest-controller';
import {
  TsMorphNestProjectTransform,
  TsMorphNestProjectTransformOptions,
} from '../ts-morph-transform';
import { classify } from '@rxap/schematics-utilities';
import {
  ClassDeclaration,
  Project,
  SourceFile,
} from 'ts-morph';
import { BuildNestControllerName } from './build-nest-controller-name';

export interface CoerceOperationOptions extends TsMorphNestProjectTransformOptions {
  controllerName: string;
  shared?: boolean;
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
  /**
   * true - the control path is overwritten with
   */
  overwriteControllerPath?: boolean;
  context?: string;
  bodyDtoName?: string;
  responseDtoName?: string;
}

export function CoerceOperationParamList(paramList: OperationParameter[], classDeclaration: ClassDeclaration) {
  const currentControllerPath = classDeclaration.getDecoratorOrThrow('Controller').getArguments()[0].getText();
  const fragments = currentControllerPath.split('/');
  const parameters = fragments.filter(fragment => fragment.startsWith(':'));
  for (const parameter of parameters) {
    if (!paramList.some(param => param.name === parameter.substr(1))) {
      paramList.push({ name: parameter.substr(1) });
    }
  }
}

export function CoerceOperation(options: CoerceOperationOptions): Rule {
  let {
    nestModule,
    controllerName,
    project,
    paramList,
    feature,
    shared,
    tsMorphTransform,
    operationName,
    skipCoerce,
    controllerPath,
    queryList,
    path,
    overwriteControllerPath,
  } = options;

  tsMorphTransform ??= () => ({});
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

  const nestController = BuildNestControllerName({
    controllerName,
    nestModule,
  });

  if (isFirstBornSibling) {
    nestModule = nestController;
  }

  return chain([
    () => console.log(`Coerce Operation '${ operationName }' with path '${ path }' in the controller '${ nestController }' in the module '${ nestModule }'`),
    skipCoerce ? noop() : chain([
      CoerceNestModule({
        project,
        feature,
        shared,
        name: nestModule!,
      }),
      CoerceNestController({
        ...options,
        name: nestController,
        nestModule: nestModule!,
      }),
    ]),
    TsMorphNestProjectTransform(options, project => {

      const sourceFile = project.getSourceFileOrThrow(`/${ nestModule }/${ nestController }.controller.ts`);
      const classDeclaration = sourceFile.getClassOrThrow(`${ classify(nestController) }Controller`);

      const operationOptions = tsMorphTransform!(project, sourceFile, classDeclaration, nestController);

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

      CoerceOperationParamList(paramList!, classDeclaration);

      AddOperationToController(
        sourceFile,
        classDeclaration,
        operationName,
        {
          isAsync: true,
          paramList,
          queryList,
          path,
          ...operationOptions,
        },
      );

    }),
  ]);


}
