import { CoerceSuffix } from '@rxap/utilities';

export interface BuildNestControllerNameOptions {
  controllerName?: string | null;
  nestModule?: string | null;
  controllerNameSuffix?: string | null;
}

export function BuildNestControllerName(options: BuildNestControllerNameOptions): string {
  const { controllerNameSuffix, nestModule } = options;
  let { controllerName } = options;

  if (!controllerName) {
    if (!nestModule) {
      throw new Error('Could not determine the controller name. No controller name and no nest module provided.');
    }
    controllerName = nestModule;
  }

  if (nestModule && nestModule !== controllerName) {
    controllerName = [ nestModule, controllerName ].join('-');
  }

  if (controllerNameSuffix) {
    controllerName = CoerceSuffix(controllerName!, '-' + controllerNameSuffix);
  }

  if (!controllerName) {
    throw new Error('Could not determine the controller name');
  }

  if (controllerName.endsWith('-')) {
    console.log(JSON.stringify(options));
    throw new Error(`The controller name should not end with a dash`);
  }

  return controllerName;

}
