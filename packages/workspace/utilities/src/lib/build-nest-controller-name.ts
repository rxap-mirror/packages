import { CoerceSuffix } from '@rxap/utilities';

export interface BuildNestControllerNameOptions {
  controllerName?: string | null;
  nestModule?: string | null;
  controllerNameSuffix?: string | null;
}

export function BuildNestControllerName(options: BuildNestControllerNameOptions): string {
  const { controllerNameSuffix, nestModule } = options;
  let { controllerName } = options;

  if (nestModule && nestModule !== controllerName) {
    controllerName = [ nestModule, controllerName ].join('-');
  }

  if (controllerNameSuffix) {
    controllerName = CoerceSuffix(controllerName!, '-' + controllerNameSuffix);
  }

  if (!controllerName) {
    throw new Error('Could not determine the controller name');
  }

  return controllerName;

}
