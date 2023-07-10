import {SchematicsException} from '@angular-devkit/schematics';
import {CoerceSuffix} from '@rxap/schematics-utilities';

export interface BuildNestControllerNameOptions {
  name?: string | null;
  controllerName?: string | null;
  nestController?: string | null;
  module?: string | null;
  nestModule?: string | null;
  controllerNameSuffix?: string | null;
}

export function BuildNestControllerName(options: BuildNestControllerNameOptions): string {
  let {name, controllerName, controllerNameSuffix, nestController, module, nestModule} = options;

  nestModule ??= module;
  controllerName ??= nestController;
  controllerName ??= name;

  if (!controllerName) {
    throw new SchematicsException('Could not determine the controller name');
  }

  if (nestModule && nestModule !== controllerName) {
    controllerName = [nestModule, controllerName].join('-');
  }

  if (controllerNameSuffix) {
    controllerName = CoerceSuffix(controllerName, '-' + controllerNameSuffix);
  }

  return controllerName;

}
