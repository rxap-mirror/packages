import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import {
  GetMajorAngularSchematicDevkitVersion,
  UpdateProjectPackageJson,
} from '@rxap/workspace-utilities';
import { gte } from 'semver';

export function updatePackageJson(tree: Tree, projectName: string, project: ProjectConfiguration) {
  UpdateProjectPackageJson(tree, packageJson => {
    const majorAngularVersion = GetMajorAngularSchematicDevkitVersion(tree);
    const version = `${ majorAngularVersion }.0.0-dev.0`;
    if (!packageJson.version || gte(version, packageJson.version)) {
      packageJson.version = version;
    }
  }, { projectName });
}
