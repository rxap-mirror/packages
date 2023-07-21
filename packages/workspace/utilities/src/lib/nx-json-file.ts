import {
  GetJsonFile,
  UpdateJsonFile,
  UpdateJsonFileOptions,
} from './json-file';
import { NxJson } from './nx-json';
import { TreeLike } from './tree';

export function GetNxJson<Tree extends TreeLike>(tree: Tree): NxJson {
  return GetJsonFile(tree, 'nx.json');
}

export type UpdateNxJsonOptions = UpdateJsonFileOptions

export function UpdateNxJson<Tree extends TreeLike>(
  tree: Tree,
  updaterOrJsonFile: NxJson | ((nxJson: NxJson) => void | PromiseLike<void>),
  options?: UpdateNxJsonOptions,
) {
  return UpdateJsonFile(tree, updaterOrJsonFile, 'nx.json', options);
}
