import { Tree } from '@angular-devkit/schematics';
import { NxJson } from '@rxap/workspace-utilities';
import {
  GetJsonFile,
  UpdateJsonFileOptions,
  UpdateJsonFileRule,
} from './json-file';

export function GetNxJson(host: Tree): NxJson {
  return GetJsonFile(host, 'nx.json');
}

export type UpdateNxJsonOptions = UpdateJsonFileOptions

export function UpdateNxJsonRule(
  updaterOrJsonFile: NxJson | ((nxJson: NxJson) => void | PromiseLike<void>),
  options?: UpdateNxJsonOptions,
) {
  return UpdateJsonFileRule(updaterOrJsonFile, 'nx.json', options);
}
