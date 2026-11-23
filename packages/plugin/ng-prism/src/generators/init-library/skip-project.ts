import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import {
  GetProjectRoot,
  HasComponents,
  HasDirectives,
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

  // a styleguide is only useful for libraries that contain angular components or directives
  const projectRoot = GetProjectRoot(tree, projectName);
  if (!HasComponents(tree, projectRoot) && !HasDirectives(tree, projectRoot)) {
    return true;
  }

  return false;

}
