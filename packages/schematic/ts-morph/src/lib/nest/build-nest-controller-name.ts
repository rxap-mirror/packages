import { SchematicsException } from '@angular-devkit/schematics';
import { CoerceSuffix } from '@rxap/schematics-utilities';

export interface BuildNestControllerNameOptions {
  controllerName?: string | null;
  nestModule?: string | null;
  controllerNameSuffix?: string | null;
}

export function BuildNestControllerName(options: BuildNestControllerNameOptions): string {
  let {
    controllerName,
    controllerNameSuffix,
    nestModule,
  } = options;

  if (nestModule && nestModule !== controllerName) {
    console.log('The nest module name is different from the controller name');
    if (controllerName) {
      console.log('controllerName', controllerName);
      if (!controllerName.startsWith(nestModule)) {
        console.log('The controller name is not prefixed with the nest module name');
        controllerName = [ nestModule, controllerName ].join('-');
      } else {
        console.warn('The controller name is already prefixed with the nest module name');
      }
    } else {
      console.warn('The controller name is not defined');
      controllerName = nestModule;
    }
  } else {
    console.log('The nest module name is the same as the controller name');
  }

  if (controllerNameSuffix) {
    controllerName = CoerceSuffix(controllerName!, '-' + controllerNameSuffix);
  }

  if (!controllerName) {
    throw new SchematicsException('Could not determine the controller name');
  }

  return controllerName;

}
