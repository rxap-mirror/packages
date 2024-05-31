import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { UpdateProjectPackageJson } from '@rxap/workspace-utilities';

export function updatePackageJson(tree: Tree, projectName: string, project: ProjectConfiguration) {
  UpdateProjectPackageJson(tree, packageJson => {

    packageJson['ng-update'] ??= {};
    packageJson['ng-update']['migrations'] = './migrations.json';

  }, { projectName });
}
