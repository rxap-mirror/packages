import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import {
  SkipProject,
  SkipProjectOptions,
} from '@rxap/generator-utilities';
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
  if (!project.tags?.includes('plugin')) {
    return true;
  }
  if (!HasGenerators(tree, project)) {
    return true;
  }

  return false;
}
