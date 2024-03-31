import { ProjectConfiguration } from '@nx/devkit';
import {
  HasGenerators,
  IsPluginProject,
  SkipProject,
  SkipProjectOptions,
  TreeLike,
} from '@rxap/workspace-utilities';

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
