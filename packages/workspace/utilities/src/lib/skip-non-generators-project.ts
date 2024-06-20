import { ProjectConfiguration } from '@nx/devkit';
import { HasGenerators } from './generators';
import { IsPluginProject } from './is-project';
import {
  SkipProject,
  SkipProjectOptions,
} from './skip-project';
import { TreeLike } from './tree';

/**
 * Determines whether a project should be skipped based on specific conditions related to generator usage.
 *
 * This function checks if a project should be skipped by evaluating several conditions in sequence:
 * 1. It first checks if the project should be skipped based on general criteria using the `SkipProject` function.
 * 2. If the project is not skipped by the first check, it then checks if the project is not a plugin project using the `IsPluginProject` function.
 * 3. If the project is a plugin project, it finally checks if the project lacks generators using the `HasGenerators` function.
 *
 * @param {TreeLike} tree - The tree structure representing the project or workspace.
 * @param {SkipProjectOptions} options - Configuration options that determine the skipping logic.
 * @param {ProjectConfiguration} project - The configuration object of the project being evaluated.
 * @param {string} projectName - The name of the project.
 * @returns {boolean} Returns `true` if the project should be skipped based on the evaluated conditions, otherwise returns `false`.
 */
export function SkipNonGeneratorsProject(
  tree: TreeLike,
  options: SkipProjectOptions,
  project: ProjectConfiguration,
  projectName: string,
) {
  if (SkipProject(tree, options, project, projectName)) {
    return true;
  }
  if (!IsPluginProject(project)) {
    return true;
  }
  if (!HasGenerators(tree, project)) {
    return true;
  }

  return false;
}
