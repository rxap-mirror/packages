import {
  ProjectConfiguration,
  readJson,
  Tree,
  writeJson,
} from '@nx/devkit';
import { ProjectPackageJson } from '@rxap/plugin-utilities';
import { IsPublishable } from '@rxap/workspace-utilities';
import { join } from 'path';
import { gte } from 'semver';
import { getAngularMajorVersion } from './get-angular-major-version';

export function updatePackageJson(
  tree: Tree,
  project: ProjectConfiguration,
  rootPackageJson: ProjectPackageJson,
) {
  if (IsPublishable(tree, project) && tree.exists(join(project.root, 'package.json'))) {
    const packageJson: ProjectPackageJson = readJson(tree, join(project.root, 'package.json'));
    const version = getAngularMajorVersion(rootPackageJson) ?? packageJson.version;
    if (!version) {
      throw new Error('Unable to determine the angular major version from the root package.json');
    }
    if (!packageJson.version || gte(version, packageJson.version)) {
      packageJson.version = version;
    }
    writeJson(tree, join(project.root, 'package.json'), packageJson);
  }
}
