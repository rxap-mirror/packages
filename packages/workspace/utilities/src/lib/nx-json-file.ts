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
  updaterOrJsonFile: NxJson | ((nxJson: NxJson) => void),
  options?: UpdateNxJsonOptions,
): void
export function UpdateNxJson<Tree extends TreeLike>(
  tree: Tree,
  updaterOrJsonFile: NxJson | ((nxJson: NxJson) => Promise<void>),
  options?: UpdateNxJsonOptions,
): Promise<void>
export function UpdateNxJson<Tree extends TreeLike>(
  tree: Tree,
  updaterOrJsonFile: NxJson | ((nxJson: NxJson) => void | Promise<void>),
  options?: UpdateNxJsonOptions,
): void | Promise<void> {
  return UpdateJsonFile(tree, updaterOrJsonFile, 'nx.json', options);
}
