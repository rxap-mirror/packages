import { ProjectConfiguration } from '@nx/devkit';

/**
 * Removes a specified build target from a project configuration if it exists.
 *
 * @param {ProjectConfiguration} project - The project configuration object which contains various build targets.
 * @param {string} target - The name of the target to be removed from the project configuration.
 */
export function DeleteTarget(project: ProjectConfiguration, target: string): void {
  if (project.targets?.[target]) {
    delete project.targets[target];
  }
}
