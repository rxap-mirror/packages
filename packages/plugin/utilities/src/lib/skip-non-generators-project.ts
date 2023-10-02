import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import {
  SkipProject,
  SkipProjectOptions,
} from '@rxap/generator-utilities';
import { IsPluginProject } from '@rxap/workspace-utilities';
import { HasGenerators } from './generators';

export function SkipNonGeneratorsProject(
  tree: Tree,
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
