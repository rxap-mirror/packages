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
    if (controllerName) {
      if (!controllerName.startsWith(nestModule)) {
        controllerName = [ nestModule, controllerName ].join('-');
      }
    } else {
      controllerName = nestModule;
    }
  }

  if (controllerNameSuffix) {
    controllerName = CoerceSuffix(controllerName!, '-' + controllerNameSuffix);
  }

  if (!controllerName) {
    throw new SchematicsException('Could not determine the controller name');
  }

  return controllerName;

}
