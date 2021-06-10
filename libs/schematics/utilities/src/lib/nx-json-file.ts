import { Tree } from '@angular-devkit/schematics';
import { NxJson } from './nx-json';
import { GetJsonFile, UpdateJsonFile } from './json-file';
import { PackageJson } from './package-json';

export function GetNxJson(host: Tree): NxJson {
  return GetJsonFile(host, 'nx.json');
}

export function UpdateNxJson(
  updaterOrJsonFile: NxJson | ((nxJson: NxJson) => void | PromiseLike<void>),
  space: string | number = 2
) {
  return UpdateJsonFile(updaterOrJsonFile, 'nx.json', space);
}
