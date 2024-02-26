import {
  chain,
  Rule,
} from '@angular-devkit/schematics';
import { classify } from '@rxap/schematics-utilities';
import { dasherize } from '@rxap/utilities';
import { join } from 'path';
import {
  ClassDeclaration,
  Project,
  SourceFile,
} from 'ts-morph';
import {
  TsMorphNestProjectTransformOptions,
  TsMorphNestProjectTransformRule,
} from '../ts-morph-transform';
import {
  AddOperationToController,
  OperationOptions,
  OperationParameter,
} from './add-operation-to-controller';
import { BuildNestControllerName } from './build-nest-controller-name';
import { CoerceNestController } from './coerce-nest-controller';

export interface CoerceOperationOptions extends TsMorphNestProjectTransformOptions {
  controllerName: string;
  shared?: boolean;
  nestModule?: string | null;
  skipCoerce?: boolean;
  paramList?: OperationParameter[],
  queryList?: OperationParameter[],
  tsMorphTransform?: (
    project: Project,
    sourceFile: SourceFile,
    classDeclaration: ClassDeclaration,
    controllerName: string,
    moduleSourceFile: SourceFile,
  ) => Partial<OperationOptions>,
  operationName: string,
  path?: string,
  controllerPath?: string,
  /**
   * true - the control path is overwritten with
   */
  overwriteControllerPath?: boolean;
  context?: string | null;
  // bodyDtoName?: string;
  // responseDtoName?: string;
}

/**
 * @deprecated import from @rxap/ts-morph
 */
export function CoerceOperationParamList(paramList: OperationParameter[], classDeclaration: ClassDeclaration) {
  const currentControllerPath = classDeclaration.getDecoratorOrThrow('Controller').getArguments()[0]?.getText() ?? '';
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
    directory,
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

  if (!nestModule || isFirstBornSibling) {
    nestModule = nestController;
  }

  directory = join(directory ?? '', nestModule!);

  return chain([
    () => console.log(`Coerce Operation '${ operationName }' with path '${ path ?? '<empty>' }' in the controller '${ nestController }' in the module '${ nestModule }'`),
    CoerceNestController({
      project,
      feature,
      shared,
      directory,
      coerceModule: !skipCoerce,
      name: nestController,
      nestModule,
    }),
    // IMPORTANT: the use of the filePath parameter for the narrow loading of the source file CAN NOT BE USED here
    //            because sub functions may need to load other source files that are then not loaded into the
    //            project instance!
    TsMorphNestProjectTransformRule({
      project,
      feature,
      shared,
      directory,
      // must be set to false are some specializations of this function need to access more files then only the
      // controller and module source file
      filter: false,
    }, (project, [controllerSourceFile, moduleSourceFile]) => {

      const classDeclaration = controllerSourceFile.getClassOrThrow(`${ classify(nestController) }Controller`);

      const operationOptions = tsMorphTransform!(project, controllerSourceFile, classDeclaration, nestController, moduleSourceFile);

      if (controllerPath) {
        classDeclaration.getDecoratorOrThrow('Controller').set({
          arguments: [ w => w.quote(controllerPath!) ],
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
        controllerSourceFile,
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

    }, [`${ nestController }.controller.ts?`, `${ dasherize(nestModule!) }.module.ts?`]),
  ]);


}
