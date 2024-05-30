import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import {
  IsNestJsProject,
  IsPluginProject,
  IsSchematicProject,
  SkipProject,
  SkipProjectOptions,
} from '@rxap/workspace-utilities';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SkipNonNestProject extends SkipProjectOptions {
}

/**
 * Skips projects that are not NestJS projects or are plugin/schematic projects.
 *
 * @param {Tree} tree - The workspace tree.
 * @param {SkipNonNestProject} options - The options for skipping non-NestJS projects.
 * @param {ProjectConfiguration} project - The project configuration.
 * @param {string} projectName - The name of the project.
 * @return {boolean} - Returns true if the project is skipped, otherwise false.
 */
export function SkipNonNestProject(
  tree: Tree,
  options: SkipNonNestProject,
  project: ProjectConfiguration,
  projectName: string,
) {
  if (SkipProject(tree, options, project, projectName)) {
    return true;
  }
  if (!IsNestJsProject(project)) {
    return true;
  }
  if (IsPluginProject(project) || IsSchematicProject(project)) {
    return true;
  }
  return false;
}
