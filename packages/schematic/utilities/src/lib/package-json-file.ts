import {
  Rule,
  Tree,
} from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import {
  AddPackageJsonDependency,
  AddPackageJsonDevDependency,
  AddPackageJsonScript,
  PackageJson,
  UpdatePackageJson,
} from '@rxap/workspace-utilities';
import { join } from 'path';
import {
  GetJsonFile,
  UpdateJsonFileOptions,
} from './json-file';

export function GetPackageJson(host: Tree, basePath = ''): PackageJson {
  return GetJsonFile(host, join(basePath, 'package.json'));
}

export interface UpdatePackageJsonOptions extends UpdateJsonFileOptions {
  basePath?: string;
}


export function UpdatePackageJsonRule(
  updaterOrJsonFile: ((packageJson: PackageJson) => void | PromiseLike<void>),
  options?: UpdatePackageJsonOptions,
): Rule {
  return tree => UpdatePackageJson(tree, updaterOrJsonFile, options);
}

export function AddPackageJsonScriptRule(
  scriptName: string,
  script: string,
  options?: UpdatePackageJsonOptions,
): Rule {
  return tree => AddPackageJsonScript(tree, scriptName, script, options);
}

export interface AddPackageJsonDependencyOptions extends UpdatePackageJsonOptions {
  /**
   * true - only update the version if the current version is lower than the new version and the anticipated version is not set to latest
   */
  soft?: boolean;
}

export function AddPackageJsonDependencyRule(
  packageName: string,
  packageVersion: string | 'latest' = 'latest',
  options?: AddPackageJsonDependencyOptions,
  propertyPath = 'dependencies',
): Rule {
  return tree => AddPackageJsonDependency(tree, packageName, packageVersion, options, propertyPath);
}

export function AddPackageJsonDevDependencyRule(
  packageName: string,
  packageVersion: string | 'latest' = 'latest',
  options?: AddPackageJsonDependencyOptions,
): Rule {
  return tree => AddPackageJsonDevDependency(tree, packageName, packageVersion, options);
}

export function InstallPackageIfNotExistsRule(
  packageName: string,
  packageVersion: string | 'latest' = 'latest',
  dev = false,
): Rule {
  return (tree, context) => {
    const packageJson = GetPackageJson(tree);
    let hasPackage = false;
    if (dev) {
      hasPackage = !!packageJson.devDependencies && !!packageJson.devDependencies[packageName];
    } else {
      hasPackage = !!packageJson.dependencies && !!packageJson.dependencies[packageName];
    }
    if (!hasPackage) {
      if (dev) {
        AddPackageJsonDevDependencyRule(packageName, packageVersion)(tree, context);
      } else {
        AddPackageJsonDependencyRule(packageName, packageVersion)(tree, context);
      }
      context.addTask(new NodePackageInstallTask());
    }
  };
}

export function InstallNodePackages(): Rule {
  return (_, context) => {
    context.addTask(new NodePackageInstallTask());
  };
}

