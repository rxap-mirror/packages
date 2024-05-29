import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import {
  SkipNonAngularProject,
  SkipNonLibraryProject,
} from '@rxap/workspace-utilities';
import { InitLibraryGeneratorSchema } from './schema';

export function skipProject(
  tree: Tree,
  options: InitLibraryGeneratorSchema,
  project: ProjectConfiguration,
  projectName: string,
): boolean {

  if (SkipNonLibraryProject(tree, options, project, projectName)) {
    return true;
  }

  if (SkipNonAngularProject(tree, options, project, projectName)) {
    return true;
  }

  return false;

}
