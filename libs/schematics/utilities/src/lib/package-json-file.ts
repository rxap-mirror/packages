import {
  Tree,
  Rule
} from '@angular-devkit/schematics';
import { PackageJson } from './package-json';
import { join } from 'path';
import {
  GetJsonFile,
  UpdateJsonFile
} from './json-file';
import { CoerceProperty } from '@rxap/utilities';
import { exec } from 'child_process';

export function GetPackageJson(host: Tree, basePath: string = ''): PackageJson {
  return GetJsonFile(host, join(basePath, 'package.json'));
}


export function UpdatePackageJson(
  updaterOrJsonFile: PackageJson | ((packageJson: PackageJson) => void | PromiseLike<void>),
  basePath: string = '',
  space: string | number = 2,
): Rule {
  return UpdateJsonFile(updaterOrJsonFile, join(basePath, 'package.json'), space);
}

export function AddPackageJsonScript(
  scriptName: string,
  script: string,
  basePath: string = '',
  space: string | number = 2,
): Rule {
  return UpdatePackageJson(
    packageJson => {
      CoerceProperty(packageJson, 'scripts', {});
      packageJson.scripts![scriptName] = script;
    },
    basePath,
    space
  );
}

export function GetLatestPackageVersion(packageName: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    exec(`npm view ${packageName} version`, (err, stdout, stderr) => {
      if(err) {
        reject(stderr);
      } else {
        resolve(stdout.trim());
      }
    });
  });
}

export async function AddPackageJsonDependency(
  packageName: string,
  packageVersion: string | 'latest',
  basePath: string = '',
  space: string | number = 2,
): Promise<Rule> {

  if (packageVersion === 'latest') {
    packageVersion = await GetLatestPackageVersion(packageName);
  }

  return UpdatePackageJson(
    packageJson => {
      CoerceProperty(packageJson, 'dependencies', {});
      packageJson.dependencies![packageName] = packageVersion;
    },
    basePath,
    space
  );

}

export async function AddPackageJsonDevDependency(
  packageName: string,
  packageVersion: string | 'latest',
  basePath: string = '',
  space: string | number = 2,
): Promise<Rule> {

  if (packageVersion === 'latest') {
    packageVersion = await GetLatestPackageVersion(packageName);
  }

  return UpdatePackageJson(
    packageJson => {
      CoerceProperty(packageJson, 'devDependencies', {});
      packageJson.devDependencies![packageName] = packageVersion;
    },
    basePath,
    space
  );

}
