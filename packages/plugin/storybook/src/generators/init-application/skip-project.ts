import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import {
  SkipNonAngularProject,
  SkipNonApplicationProject,
} from '@rxap/workspace-utilities';
import { InitLibraryGeneratorSchema } from '../init-library/schema';

export function skipProject(
  tree: Tree,
  options: InitLibraryGeneratorSchema,
  project: ProjectConfiguration,
  projectName: string,
): boolean {

  if (SkipNonApplicationProject(tree, options, project, projectName)) {
    return true;
  }

  if (SkipNonAngularProject(tree, options, project, projectName)) {
    return true;
  }

  return false;

}
