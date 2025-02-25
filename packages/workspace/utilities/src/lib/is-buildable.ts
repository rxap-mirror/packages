import { ProjectConfiguration } from '@nx/devkit';
import { TreeLike } from './tree';

/**
 * Determines if the given project configuration has a build target.
 *
 * This function checks if the 'build' property exists within the 'targets' object of the project configuration.
 * It returns true if the 'build' target is defined, otherwise it returns false.
 *
 * @param tree - a tree instance
 * @param {ProjectConfiguration} project - The project configuration object to check.
 * @returns {boolean} - True if the project has a build target, false otherwise.
 */
export function IsBuildable(tree: TreeLike, project: ProjectConfiguration) {
  return !!project.targets?.['build'] || tree.exists(`${project.root}/tsconfig.lib.json`);
}
