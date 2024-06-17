import { GetRootPackageJson } from './package-json-file';
import { TreeLike } from './tree';
import { parse } from 'semver';

export function GetMajorAngularVersion(tree?: TreeLike): number {
  const rootPackageJson = GetRootPackageJson(tree);

  let targetVersion = rootPackageJson.dependencies?.['@angular/core'] ??
                      rootPackageJson.devDependencies?.['@angular/cli'];

  if (!targetVersion) {
    throw new Error(`The package @angular/core and @angular/cli are not installed in the root package.json`);
  }

  targetVersion = targetVersion.replace(/^[~^]/, '');

  const version = parse(targetVersion);

  if (!version) {
    throw new Error(`Unable to parse the version ${ targetVersion }`);
  }

  return version.major;
}

export function GetMajorAngularSchematicDevkitVersion(tree?: TreeLike): number {
  const rootPackageJson = GetRootPackageJson(tree);

  let targetVersion = rootPackageJson.devDependencies?.['@angular-devkit/schematics'];

  if (!targetVersion) {
    throw new Error(`The package @angular-devkit/schematics is not installed in the root package.json`);
  }

  targetVersion = targetVersion.replace(/^[~^]/, '');

  const version = parse(targetVersion);

  if (!version) {
    throw new Error(`Unable to parse the version ${ targetVersion }`);
  }

  return version.major;
}
