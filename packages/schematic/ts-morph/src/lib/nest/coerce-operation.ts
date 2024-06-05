import {
  chain,
  Rule,
} from '@angular-devkit/schematics';
import {
  CoerceNestOperation,
  CoerceOperationOptions as NEW_CoerceOperationOptions,
} from '@rxap/ts-morph';
import { dasherize } from '@rxap/utilities';
import { TsMorphNestProjectTransformOptions } from '@rxap/workspace-ts-morph';
import { join } from 'path';
import { TsMorphNestProjectTransformRule } from '../ts-morph-transform';
import { BuildNestControllerName } from './build-nest-controller-name';
import { CoerceNestController } from './coerce-nest-controller';

export interface CoerceOperationOptions extends TsMorphNestProjectTransformOptions, NEW_CoerceOperationOptions {
  controllerName: string;
  shared?: boolean;
  nestModule?: string | null;
  skipCoerce?: boolean;
  backend: { project?: string | null, kind: any } | undefined;
}

export function CoerceOperation(options: CoerceOperationOptions): Rule {
  const {
    controllerName,
    project,
    paramList = [],
    feature,
    shared,
    operationName,
    skipCoerce,
    backend,
  } = options;
  let { nestModule, directory, path } = options;


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

  const operationPathParameters = paramList.filter(p => !p.fromParent).map(p => p.name);

  if (operationPathParameters.length) {
    if (!path) {
      path = operationPathParameters.map(p => `:${ p }`).join('/');
    } else {
      const notFound = operationPathParameters.filter(p => !path!.includes(p));
      path += '/' + notFound.map(p => `:${ p }`).join('/');
    }
  }

  return chain([
    () => console.log(`Coerce Operation '${ operationName }' with path '${ path ?? '<empty>' }' in the controller '${ nestController }' in the module '${ nestModule }'`.blue),
    () => console.log(`Operation path parameters: ${paramList.map(p => (p.fromParent ? '^' : '') + p.name).join(', ')}`.grey),
    CoerceNestController({
      project,
      feature,
      shared,
      backend,
      directory,
      coerceModule: !skipCoerce,
      name: nestController,
      nestModule,
    }),
    TsMorphNestProjectTransformRule({
      project,
      feature,
      shared,
      directory,
      // must be set to false are some specializations of this function need to access more files then only the
      // controller and module source file
      filter: false,
    }, (project, [controllerSourceFile, moduleSourceFile]) => {

      CoerceNestOperation(controllerSourceFile, options, moduleSourceFile);

    }, [`${ nestController }.controller.ts?`, `${ dasherize(nestModule!) }.module.ts?`]),
  ]);


}
