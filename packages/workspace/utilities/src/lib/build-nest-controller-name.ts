import { SchematicsException } from '@angular-devkit/schematics';
import {
  CoercePrefix,
  CoerceSuffix,
} from '@rxap/utilities';

export interface BuildNestControllerNameOptions {
  controllerName?: string | null;
  nestModule?: string | null;
  controllerNameSuffix?: string | null;
}

export function BuildNestControllerName(options: BuildNestControllerNameOptions): string {
  const { controllerNameSuffix, nestModule } = options;
  let { controllerName } = options;

  if (nestModule && nestModule !== controllerName) {
    console.log('The nest module name is different from the controller name');
    if (controllerName) {
      console.log('controllerName', controllerName);
      if (!controllerName.startsWith(nestModule)) {
        console.log(`The controller name is not prefixed with the nest module name (${nestModule})-(${controllerName})`);
        controllerName = [ nestModule, controllerName ].join('-');
      } else {
        console.warn('The controller name is already prefixed with the nest module name');
      }
    } else {
      console.warn('The controller name is not defined');
      controllerName = nestModule;
    }
  } else if(!controllerName && nestModule) {
    console.log('The controller name is not defined, using the nest module name as controller name');
    controllerName = nestModule;
  } else {
    console.log('The nest module name is the same as the controller name');
  }

  if (!controllerName) {
    throw new SchematicsException('Could not determine the controller name');
  }

  if (controllerNameSuffix) {
    controllerName = CoerceSuffix(controllerName, CoercePrefix(controllerNameSuffix, '-'));
  }

  if (controllerName.endsWith('-')) {
    console.log(JSON.stringify(options));
    throw new Error(`The controller name should not end with a dash`);
  }

    return controllerName;

}
