import { ProjectConfiguration } from '@nx/devkit';
import { HasGenerators } from './generators';
import { IsPluginProject } from './is-project';
import {
  SkipProject,
  SkipProjectOptions,
} from './skip-project';
import { TreeLike } from './tree';

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
