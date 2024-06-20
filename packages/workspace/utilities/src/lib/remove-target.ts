import { NxJsonOrProjectConfiguration } from '@rxap/workspace-utilities';

/**
 * Removes a specified target from a project configuration.
 *
 * This function modifies the `projectConfiguration` object by removing a target identified by the `name` parameter.
 * If the target with the specified name exists within the `targets` property of the `projectConfiguration`, it will be deleted.
 *
 * @param {NxJsonOrProjectConfiguration} projectConfiguration - The configuration object for an Nx project which potentially contains multiple targets.
 * @param {string} name - The name of the target to be removed from the project configuration.
 */
export function RemoveTarget(
  projectConfiguration: NxJsonOrProjectConfiguration,
  name: string,
  ) {
  if (projectConfiguration.targets?.[name]) {
    delete projectConfiguration.targets[name];
  }
}
