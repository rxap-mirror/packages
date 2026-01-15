import {
  CoercePrefix,
  CoerceSuffix,
} from '@rxap/utilities';

export interface BuildNestControllerNameOptions {
  /**
   * @deprecated use `controller` instead
   */
  controllerName?: string | null;
  /**
   * @deprecated use `module` instead
   */
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
  /**
   * The module name
   */
  module?: string | null;
  /**
   * The controller name
   */
  controller?: string | null;
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
  const {
    controllerName,
    controllerNameSuffix,
    nestModule,
  } = options;
  let {
    prefix,
    module,
    controller,
  } = options;

  module ??= nestModule;
  controller ??= controllerName;
  if (prefix === true) {
    prefix = module ?? false;
  }

  if (prefix && prefix !== controller) {
    process.env['RXAP_GENERATOR_DEBUG'] === 'true' && console.log('The prefix is different from the controller name');
    if (controller) {
      process.env['RXAP_GENERATOR_DEBUG'] === 'true' && console.log('controller', controller);
      if (!controller.startsWith(prefix)) {
        process.env['RXAP_GENERATOR_DEBUG'] === 'true' && console.log(`The controller name is not prefixed with (${prefix})-(${controllerName})`);
        controller = [ prefix, controller ].join('-');
      } else {
        process.env['RXAP_GENERATOR_DEBUG'] === 'true' && console.warn('The controller name is already prefixed');
      }
    } else {
      process.env['RXAP_GENERATOR_DEBUG'] === 'true' && console.warn('The controller name is not defined');
      controller = prefix;
    }
  } else if (!controller && prefix) {
    process.env['RXAP_GENERATOR_DEBUG'] === 'true' && console.log('The controller name is not defined, using the prefix as controller name');
    controller = prefix;
  } else {
    process.env['RXAP_GENERATOR_DEBUG'] === 'true' && console.log('The prefix is the same as the controller name');
  }

  if (!controller) {
    throw new Error('Could not determine the controller name');
  }

  if (controllerNameSuffix) {
    controller = CoerceSuffix(controller, CoercePrefix(controllerNameSuffix, '-'));
  }

  if (controller.endsWith('-')) {
    process.env['RXAP_GENERATOR_DEBUG'] === 'true' && console.log(JSON.stringify(options));
    throw new Error(`The controller name should not end with a dash`);
  }

  return controller;

}
