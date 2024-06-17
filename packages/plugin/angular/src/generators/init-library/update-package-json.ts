import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import {
  GetMajorAngularVersion,
  IsPublishable,
  UpdateProjectPackageJson,
} from '@rxap/workspace-utilities';
import { gte } from 'semver';

export function updatePackageJson(
  tree: Tree,
  projectName: string,
  project: ProjectConfiguration,
) {
  if (IsPublishable(tree, project)) {
    UpdateProjectPackageJson(tree, packageJson => {
      const majorAngularVersion = GetMajorAngularVersion(tree);
      const version = `${ majorAngularVersion }.0.0`;
      if (!packageJson.version || gte(version, packageJson.version)) {
        packageJson.version = version;
      }
    }, { projectName });
  }
}
