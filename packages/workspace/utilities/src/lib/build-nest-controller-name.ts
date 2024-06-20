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

/**
 * Constructs a controller name for a NestJS module based on provided options.
 *
 * This function generates a controller name by ensuring it appropriately includes the module name as a prefix
 * and adheres to any specified naming conventions such as suffixes. The function also handles edge cases where
 * the controller name or module name might be missing or already formatted.
 *
 * @param {BuildNestControllerNameOptions} options - The options for building the controller name, which include:
 * - `controllerName`: initial or current name of the controller.
 * - `nestModule`: the name of the NestJS module this controller belongs to.
 * - `controllerNameSuffix`: optional suffix to append to the controller name.
 * @returns {string} The fully constructed controller name.
 * @throws {SchematicsException} Throws an error if the controller name cannot be determined.
 * @throws {Error} Throws an error if the resulting controller name ends with a dash.
 *
 * ### Usage
 * ```typescript
 * const options = {
 * controllerName: "User",
 * nestModule: "Admin",
 * controllerNameSuffix: "Controller"
 * };
 * const controllerName = BuildNestControllerName(options);
 * // Returns "Admin-UserController"
 * ```
 */
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
