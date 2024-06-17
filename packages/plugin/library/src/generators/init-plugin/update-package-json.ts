import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import {
  GetMajorNxVersion,
  UpdateProjectPackageJson,
} from '@rxap/workspace-utilities';
import { gte } from 'semver';

export function updatePackageJson(tree: Tree, projectName: string, project: ProjectConfiguration) {
  UpdateProjectPackageJson(tree, packageJson => {
    const majorNxVersion = GetMajorNxVersion(tree);
    const version = `${ majorNxVersion }.0.0-dev.0`;
    if (!packageJson.version || gte(version, packageJson.version)) {
      packageJson.version = version;
    }
  }, { projectName });
}
