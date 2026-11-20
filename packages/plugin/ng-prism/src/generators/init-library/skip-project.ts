import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import {
  GetProjectRoot,
  HasComponents,
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

  if (options.project === projectName) {
    return false;
  }

  if (SkipNonLibraryProject(tree, options, project, projectName)) {
    return true;
  }

  if (SkipNonAngularProject(tree, options, project, projectName)) {
    return true;
  }

  // a styleguide is only useful for libraries that contain angular components
  if (!HasComponents(tree, GetProjectRoot(tree, projectName))) {
    return true;
  }

  return false;

}
