import {
  ProjectConfiguration,
  TargetConfiguration,
} from '@nx/devkit';

/**
 * Retrieves a list of configuration names for a specified target within a project configuration.
 *
 * This function checks if the specified target exists within the provided project configuration object.
 * If the target is found, it returns a list of all configuration names associated with that target.
 * If the target does not exist or there are no configurations defined for it, an empty array is returned.
 *
 * @param {ProjectConfiguration} projectConfiguration - The complete project configuration object which includes targets and their configurations.
 * @param {string} targetName - The name of the target for which configuration names are to be retrieved.
 * @returns {string[]} An array of configuration names for the given target. Returns an empty array if the target or configurations are not found.
 */
export function GetTargetConfigurationNameList(
  projectConfiguration: ProjectConfiguration,
  targetName: string,
): string[] {
  const configurationNameList: string[] = [];
  if (projectConfiguration.targets && projectConfiguration.targets[targetName]) {
    return Object.keys(projectConfiguration.targets[targetName].configurations ?? {});
  }
  return configurationNameList;
}

/**
 * Generates a map of configuration names to empty records for a specified target within a project configuration.
 *
 * This function retrieves a list of configuration names associated with a specific target (e.g., 'build') from the given project configuration.
 * It then creates a map where each configuration name is a key, and the value is an empty record. This can be useful for initializing configuration
 * settings for different builds or environments within a project.
 *
 * @param {ProjectConfiguration} projectConfiguration - The complete configuration object of the project.
 * @param {string} targetName - The name of the target (e.g., 'build', 'test') for which the configuration names are to be retrieved and mapped.
 * @returns {Record<string, Record<string, unknown>>} A record where each key is a configuration name associated with the target, and each value is an empty record.
 */
export function CreateConfigurationMapMatchingWithTarget(
  projectConfiguration: ProjectConfiguration,
  targetName: string,
): Record<string, Record<string, unknown>> {
  return GetTargetConfigurationNameList(projectConfiguration, 'build')
    .reduce((acc, configurationName) => ({
      ...acc,
      [configurationName]: {},
    }), {});
}

/**
 * Retrieves the configuration for a specified target within a given project configuration.
 *
 * @param {ProjectConfiguration} projectConfiguration - The complete configuration object of the project.
 * @param {string} targetName - The name of the target to retrieve the configuration for.
 * @returns {TargetConfiguration} The configuration of the specified target.
 * @throws {Error} Throws an error if the target name is not found within the project's configuration.
 *
 * @example
 * const projectConfig = {
 * name: "ExampleProject",
 * targets: {
 * build: {
 * tools: ["webpack", "babel"],
 * options: { optimize: true }
 * }
 * }
 * };
 * const targetConfig = GetTarget(projectConfig, "build");
 * console.log(targetConfig); // Output: { tools: ["webpack", "babel"], options: { optimize: true } }
 */
export function GetTarget(projectConfiguration: ProjectConfiguration, targetName: string) {
  if (projectConfiguration.targets && projectConfiguration.targets[targetName]) {
    return projectConfiguration.targets[targetName];
  }
  throw new Error(`Could not find target '${ targetName }' for project '${ projectConfiguration.name }'`);
}

/**
 * Retrieves the configuration options for a specified project target, optionally merging them
 * with the options of a specific configuration.
 *
 * This function first checks for general options defined at the project target level. If a
 * configuration name is provided, it then attempts to merge these general options with the ones
 * specified under the given configuration name. If the specified configuration does not exist,
 * only the general options are returned.
 *
 * @template T The expected type of the options object. Defaults to `Record<string, unknown>`.
 * @param {TargetConfiguration} projectTarget - The project target object containing both general
 * options and optional specific configurations.
 * @param {string} [configurationName] - Optional. The name of the specific configuration to merge
 * with the general target options.
 * @returns {T} The merged options as an object of type T. If no specific configuration is provided,
 * returns the general options of the project target.
 */
export function GetTargetOptions<T = Record<string, unknown>>(
  projectTarget: TargetConfiguration,
  configurationName?: string,
): T {
  const options = projectTarget.options ?? {};
  if (configurationName) {
    if (projectTarget.configurations && projectTarget.configurations[configurationName]) {
      Object.assign(options, projectTarget.configurations[configurationName]);
    }
  }
  return options;
}
