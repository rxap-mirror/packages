import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import {
  SkipProject,
  SkipProjectOptions,
} from '@rxap/generator-utilities';
import {
  IsNestJsProject,
  IsPluginProject,
  IsSchematicProject,
} from '@rxap/workspace-utilities';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SkipNonNestProject extends SkipProjectOptions {
}

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
