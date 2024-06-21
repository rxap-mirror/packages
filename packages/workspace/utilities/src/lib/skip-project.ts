import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { join } from 'path';
import { IsBuildable } from './is-buildable';
import {
  IsAngularProject,
  IsApplicationProject,
  IsInternalProject,
  IsLibraryProject,
  IsPluginProject,
  IsSchematicProject,
} from './is-project';
import { IsPublishable } from './is-publishable';
import { TreeLike } from './tree';

export interface SkipProjectOptions {
  projects?: string[];
  project?: string;
}

/**
 * Determines whether a given project should be skipped based on specified conditions.
 *
 * This function checks if a project should be skipped based on three criteria:
 * 1. If the `projects` array in the options includes the project name.
 * 2. If the project is marked as an internal project.
 * 3. If the project's root directory does not contain a 'project.json' file.
 *
 * @param {TreeLike} tree - The file tree representation, used to check for the existence of files within the project.
 * @param {SkipProjectOptions} options - Configuration options which may include a list of project names to be specifically included or excluded.
 * @param {ProjectConfiguration} project - The configuration object of the project being checked.
 * @param {string} projectName - The name of the project to check.
 * @returns {boolean} Returns `true` if the project should be skipped, otherwise returns `false`.
 */
export function SkipProject(
  tree: TreeLike,
  options: SkipProjectOptions,
  project: ProjectConfiguration,
  projectName: string,
) {

  if (options.projects?.length && !options.projects?.includes(projectName)) {
    return true;
  }

  if (IsInternalProject(project)) {
    return true;
  }

  if (!tree.exists(join(project.root, 'project.json'))) {
    console.warn(`The project ${ projectName } has no project.json file.`);
    return true;
  }

  return false;

}

/**
 * Determines whether to skip processing for a non-library project based on specific conditions.
 *
 * This function checks if a project should be skipped using a generic skip condition and additionally
 * verifies if the project is not a library. If either condition is met, the project will be skipped.
 *
 * @param tree - The abstract representation of the workspace file and folder structure.
 * @param options - Configuration options that may influence skipping logic.
 * @param project - The configuration details of the project being evaluated.
 * @param projectName - The name of the project to potentially skip.
 * @returns `true` if the project should be skipped either due to generic conditions or because it is not a library; otherwise, `false`.
 */
export function SkipNonLibraryProject(
  tree: TreeLike,
  options: SkipProjectOptions,
  project: ProjectConfiguration,
  projectName: string,
) {

  if (SkipProject(tree, options, project, projectName)) {
    return true;
  }

  if (!IsLibraryProject(project)) {
    return true;
  }

  return false;

}

/**
 * Determines whether a project should be skipped based on its type and buildability.
 *
 * This function checks if the given project is not a library or is not buildable, and if either condition is met,
 * the project is skipped.
 *
 * @param tree - The tree structure representing the workspace or project configuration.
 * @param options - Configuration options that may influence skipping logic.
 * @param project - The configuration details of the project being evaluated.
 * @param projectName - The name of the project to evaluate.
 * @returns `true` if the project should be skipped (either it's not a library or not buildable), otherwise `false`.
 */
export function SkipNonBuildableProject(
  tree: TreeLike,
  options: SkipProjectOptions,
  project: ProjectConfiguration,
  projectName: string,
) {

  if (SkipNonLibraryProject(tree, options, project, projectName)) {
    return true;
  }

  if (!IsBuildable(project)) {
    return true;
  }

  return false;

}

/**
 * Determines whether a project should be skipped based on its publishability and buildability.
 *
 * This function checks if a given project should be skipped during operations that require
 * the project to be both buildable and publishable. It first checks if the project is non-buildable,
 * and if so, it skips the project. If the project is buildable, it then checks if the project is
 * non-publishable. If either condition is met, the project is skipped.
 *
 * @param {TreeLike} tree - The tree structure representing the workspace or project files.
 * @param {SkipProjectOptions} options - Configuration options that may influence skipping logic.
 * @param {ProjectConfiguration} project - The configuration object of the project to be checked.
 * @param {string} projectName - The name of the project to be evaluated.
 * @returns {boolean} Returns `true` if the project should be skipped, otherwise `false`.
 */
export function SkipNonPublishableProject(
  tree: TreeLike,
  options: SkipProjectOptions,
  project: ProjectConfiguration,
  projectName: string,
) {

  if (SkipNonBuildableProject(tree, options, project, projectName)) {
    return true;
  }

  if (!IsPublishable(tree, project)) {
    return true;
  }

  return false;

}

/**
 * Determines whether a given project should be skipped based on specific criteria.
 *
 * This function checks if the project should be skipped by evaluating several conditions:
 * 1. If the project is already marked to be skipped by another function `SkipProject`.
 * 2. If the project is not identified as an application project by `IsApplicationProject`.
 * 3. If the project does not have a 'build' target defined.
 * 4. If the 'build' target does not specify an 'outputPath'.
 *
 * @param {TreeLike} tree - The tree structure representing all projects.
 * @param {SkipProjectOptions} options - Configuration options that may influence skipping logic.
 * @param {ProjectConfiguration} project - The configuration object of the project to evaluate.
 * @param {string} projectName - The name of the project.
 * @returns {boolean} Returns `true` if the project should be skipped, otherwise `false`.
 */
export function SkipNonApplicationProject(
  tree: TreeLike,
  options: SkipProjectOptions,
  project: ProjectConfiguration,
  projectName: string,
) {

  if (SkipProject(tree, options, project, projectName)) {
    return true;
  }

  if (!IsApplicationProject(project)) {
    return true;
  }

  if (!project.targets?.['build']) {
    return true;
  }

  if (!project.targets?.['build']?.options?.outputPath) {
    return true;
  }

  return false;

}

/**
 * Determines whether a given project should be skipped based on specific conditions.
 *
 * This function checks if the project should be skipped by evaluating several conditions:
 * 1. General conditions for skipping the project.
 * 2. Whether the project is not an Angular project.
 * 3. Whether the project is a plugin or schematic project.
 *
 * @param {Tree} tree - The abstract representation of the file system.
 * @param {SkipProjectOptions} options - Configuration options that specify skip conditions.
 * @param {ProjectConfiguration} project - The configuration object of the project.
 * @param {string} projectName - The name of the project.
 * @returns {boolean} Returns `true` if the project should be skipped based on any of the evaluated conditions, otherwise returns `false`.
 */
export function SkipNonAngularProject(tree: Tree, options: SkipProjectOptions, project: ProjectConfiguration, projectName: string) {
  if (SkipProject(tree, options, project, projectName)) {
    return true;
  }
  if (!IsAngularProject(project)) {
    return true;
  }
  if (IsPluginProject(project) || IsSchematicProject(project)) {
    return true;
  }
  return false;
}
