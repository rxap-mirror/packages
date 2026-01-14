import {
  CoercePrefix,
  CoerceSuffix,
} from '@rxap/utilities';

export interface BuildNestControllerNameOptions {
  controllerName?: string | null;
  nestModule?: string | null;
  controllerNameSuffix?: string | null;
  /**
   * The prefix to be joined with `-` to the controller name.
   *
   * true - the nestModule name will be used as prefix.
   * false - no prefix will be used.
   * string - the string will be used as prefix.
   */
  prefix?: string | null | boolean;
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
 * @throws {Error} Throws an error if the controller name cannot be determined.
 * @throws {Error} Throws an error if the resulting controller name ends with a dash.
 *
 * ### Usage
 *
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
  let { controllerName, prefix } = options;

  if (prefix === true) {
    prefix = nestModule ?? false;
  }

  if (prefix && prefix !== controllerName) {
    process.env['RXAP_GENERATOR_DEBUG'] === 'true' && console.log('The prefix is different from the controller name');
    if (controllerName) {
      process.env['RXAP_GENERATOR_DEBUG'] === 'true' && console.log('controllerName', controllerName);
      if (!controllerName.startsWith(prefix)) {
        process.env['RXAP_GENERATOR_DEBUG'] === 'true' && console.log(`The controller name is not prefixed with (${prefix})-(${controllerName})`);
        controllerName = [ prefix, controllerName ].join('-');
      } else {
        process.env['RXAP_GENERATOR_DEBUG'] === 'true' && console.warn('The controller name is already prefixed');
      }
    } else {
      process.env['RXAP_GENERATOR_DEBUG'] === 'true' && console.warn('The controller name is not defined');
      controllerName = prefix;
    }
  } else if(!controllerName && prefix) {
    process.env['RXAP_GENERATOR_DEBUG'] === 'true' && console.log('The controller name is not defined, using the prefix as controller name');
    controllerName = prefix;
  } else {
    process.env['RXAP_GENERATOR_DEBUG'] === 'true' && console.log('The prefix is the same as the controller name');
  }

  if (!controllerName) {
    throw new Error('Could not determine the controller name');
  }

  if (controllerNameSuffix) {
    controllerName = CoerceSuffix(controllerName, CoercePrefix(controllerNameSuffix, '-'));
  }

  if (controllerName.endsWith('-')) {
    process.env['RXAP_GENERATOR_DEBUG'] === 'true' && console.log(JSON.stringify(options));
    throw new Error(`The controller name should not end with a dash`);
  }

    return controllerName;

}
