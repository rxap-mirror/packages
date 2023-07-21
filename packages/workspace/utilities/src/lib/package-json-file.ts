import { GetLatestPackageVersion } from '@rxap/node-utilities';
import { join } from 'path';
import gt from 'semver/functions/gt';
import {
  GetJsonFile,
  UpdateJsonFile,
  UpdateJsonFileOptions,
} from './json-file';
import { PackageJson } from './package-json';
import { TreeLike } from './tree';

export function GetPackageJson<Tree extends TreeLike>(tree: Tree, basePath = ''): PackageJson {
  return GetJsonFile(tree, join(basePath, 'package.json'));
}

export interface UpdatePackageJsonOptions extends UpdateJsonFileOptions {
  basePath?: string;
}


export function UpdatePackageJson<Tree extends TreeLike>(
  tree: Tree,
  updaterOrJsonFile: PackageJson | ((packageJson: PackageJson) => void | PromiseLike<void>),
  options?: UpdatePackageJsonOptions,
) {
  return UpdateJsonFile(tree, updaterOrJsonFile, join(options?.basePath ?? '', 'package.json'), options);
}

export function AddPackageJsonScript<Tree extends TreeLike>(
  tree: Tree,
  scriptName: string,
  script: string,
  options?: UpdatePackageJsonOptions,
) {
  return UpdatePackageJson(
    tree,
    packageJson => {
      packageJson.scripts ??= {};
      packageJson.scripts[scriptName] = script;
    },
    options,
  );
}

export interface AddPackageJsonDependencyOptions extends UpdatePackageJsonOptions {
  /**
   * true - only update the version if the current version is lower than the new version and the anticipated version is not set to latest
   */
  soft?: boolean;
}

export async function AddPackageJsonDependency<Tree extends TreeLike>(
  tree: Tree,
  packageName: string,
  packageVersion: string | 'latest' = 'latest',
  options?: AddPackageJsonDependencyOptions,
  propertyPath = 'dependencies',
) {
  let mewPackageVersion: string | null = packageVersion;
  if (packageVersion === 'latest') {
    mewPackageVersion = await GetLatestPackageVersion(packageName);
  }

  if (!mewPackageVersion) {
    console.error(`Could not resolve the latest version of the package \x1b[31m${ packageName }\x1b[0m`);
    return;
  }

  return UpdatePackageJson(
    tree,
    packageJson => {
      packageJson[propertyPath] ??= {};
      if (options?.soft) {
        if (packageJson[propertyPath][packageName]) {
          if (packageVersion === 'latest') {
            console.log(`The package \x1b[34m${ packageName }\x1b[0m already exists in the \x1b[90m${ propertyPath }\x1b[0m`);
            // if soft and latest and the package already exists in the dependencies do nothing
            return;
          }
          const currentVersion = packageJson[propertyPath][packageName].replace(/^(~|\^|>|<|<=|>=)/, '');
          if (gt(currentVersion, mewPackageVersion!)) {
            console.log(`The package \x1b[34m${ packageName }\x1b[0m version \x1b[31m${ currentVersion }\x1b[0m is greater than the anticipated version \x1b[32m${ mewPackageVersion }\x1b[0m`);
            // if soft and the current version is greater than the new version do nothing
            return;
          }
        }
      }
      if (packageJson[propertyPath][packageName]) {
        console.log(`Change the package \x1b[34m${ packageName }\x1b[0m version from \x1b[31m${ packageJson[propertyPath][packageName] }\x1b[0m to \x1b[32m${ mewPackageVersion }\x1b[0m`);
      } else {
        console.log(`Add the package \x1b[34m${ packageName }\x1b[0m to the \x1b[90m${ propertyPath }\x1b[0m with version \x1b[32m${ mewPackageVersion }\x1b[0m`);
      }
      if (packageName.match(/^@rxap\//) && packageJson.name === 'rxap') {
        console.log(`\x1b[33mWARNING: Detecting that the workspace is the \x1b[34mrxap\x1b[33m workspace. The package \x1b[34m${ packageName }\x1b[33m will \x1b[31mNOT\x1b[33m be added to the package.json file.\x1b[0m`);
      } else {
        packageJson[propertyPath][packageName] = mewPackageVersion;
      }
    },
    options,
  );
}

export async function AddPackageJsonDevDependency<Tree extends TreeLike>(
  tree: Tree,
  packageName: string,
  packageVersion: string | 'latest' = 'latest',
  options?: AddPackageJsonDependencyOptions,
) {
  return AddPackageJsonDependency(tree, packageName, packageVersion, options, 'devDependencies');
}

