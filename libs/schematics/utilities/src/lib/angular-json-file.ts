import { Tree } from '@angular-devkit/schematics';
import { AngularJson } from './angular-json';
import {
  GetJsonFile,
  UpdateJsonFile
} from './json-file';
import { PackageJson } from './package-json';

export function GetAngularJson(host: Tree): AngularJson {
  return GetJsonFile(host, 'angular.json');
}

export function UpdateAngularJson(
  updaterOrJsonFile: PackageJson | ((angularJson: PackageJson) => void | PromiseLike<void>),
  space: string | number = 2,
) {
  return UpdateJsonFile(updaterOrJsonFile, 'nx.json', space);
}
