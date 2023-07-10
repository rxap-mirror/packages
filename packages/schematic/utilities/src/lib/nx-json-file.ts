import { Tree } from '@angular-devkit/schematics';
import { NxJson } from './nx-json';
import {
  GetJsonFile,
  UpdateJsonFile,
  UpdateJsonFileOptions,
} from './json-file';

export function GetNxJson(host: Tree): NxJson {
  return GetJsonFile(host, 'nx.json');
}

export type UpdateNxJsonOptions = UpdateJsonFileOptions

export function UpdateNxJson(
  updaterOrJsonFile: NxJson | ((nxJson: NxJson) => void | PromiseLike<void>),
  options?: UpdateNxJsonOptions,
) {
  return UpdateJsonFile(updaterOrJsonFile, 'nx.json', options);
}
