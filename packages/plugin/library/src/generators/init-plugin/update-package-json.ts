import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import {
  GetNxVersion,
  UpdateProjectPackageJson,
} from '@rxap/workspace-utilities';

export function updatePackageJson(tree: Tree, projectName: string, project: ProjectConfiguration) {
  UpdateProjectPackageJson(tree, packageJson => {

    if (packageJson.version === '0.0.1') {
      const nxVersion = GetNxVersion(tree);
      const major = nxVersion.split('.')[0];
      packageJson.version = `${ major }.0.0`;
    }

  }, { projectName });
}
