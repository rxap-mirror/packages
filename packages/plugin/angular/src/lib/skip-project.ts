import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import {
  IsAngularProject,
  IsPluginProject,
  IsSchematicProject,
  SkipProject,
  SkipProjectOptions,
} from '@rxap/workspace-utilities';

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
