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
  if (HasProject(tree, 'shell')) {
    return 'shell:build:development';
  }
  if (HasProject(tree, 'user-interface-shell')) {
    return 'user-interface-shell:build:development';
  }
  for (const [projectName, project] of getProjects(tree).entries()) {

    if (IsApplicationProject(project) && IsAngularProject(project) && IsBuildable(project)) {
      return `${ projectName }:build:development`;
    }

  }

  throw new Error('Unable to guess build target');
}
