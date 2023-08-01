import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import {
  SkipProject,
  SkipProjectOptions,
} from '@rxap/generator-utilities';

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
  if (!project.tags?.includes('nest') && !project.tags?.includes('nestjs')) {
    return true;
  }
  if (project.tags?.includes('plugin') || project.tags?.includes('schematic')) {
    return true;
  }
  return false;
}
