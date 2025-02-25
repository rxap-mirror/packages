import {
  getProjects,
  Tree,
} from '@nx/devkit';
import {
  HasProject,
  IsAngularProject,
  IsApplicationProject,
  IsBuildable,
} from '@rxap/workspace-utilities';

export function guessBuildTarget(tree: Tree): string {
  if (HasProject(tree, 'cypress')) {
    return 'cypress:build:development';
  }
  for (const [projectName, project] of getProjects(tree).entries()) {

    if (IsApplicationProject(project) && IsAngularProject(project) && IsBuildable(tree, project)) {
      return `${ projectName }:build:development`;
    }

  }

  throw new Error('Unable to guess build target');
}
