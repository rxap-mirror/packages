import { join } from 'path';
import { GetProjectRoot } from './get-project';
import {
  GetJsonFile,
  UpdateJsonFile,
  UpdateJsonFileOptions,
} from './json-file';
import { TreeLike } from './tree';
import { TsConfigJson } from './ts-config';

export function GetTsConfigJson<Tree extends TreeLike>(tree: Tree, infix?: string): TsConfigJson {
  return GetJsonFile(tree, infix ? `tsconfig.${ infix }.json` : 'tsconfig.json');
}

export interface UpdateTsConfigJsonOptions extends UpdateJsonFileOptions {
  infix?: string;
  basePath?: string;
}

export function UpdateTsConfigJson<Tree extends TreeLike>(
  tree: Tree,
  updater: (tsConfig: TsConfigJson) => void | PromiseLike<void>,
  options?: UpdateTsConfigJsonOptions,
) {
  return UpdateJsonFile(
    tree,
    updater,
    join(options?.basePath ?? '', options?.infix ? `tsconfig.${ options.infix }.json` : 'tsconfig.json'),
    options,
  );
}

export interface UpdateProjectTsConfigJsonOptions extends UpdateJsonFileOptions {
  infix?: string;
  project: string;
}


export function UpdateProjectTsConfigJson<Tree extends TreeLike>(
  tree: Tree,
  updater: (tsConfig: TsConfigJson) => void | PromiseLike<void>,
  options: UpdateProjectTsConfigJsonOptions,
) {
  const projectRoot = GetProjectRoot(tree, options.project);
  return UpdateTsConfigJson(
    tree,
    updater,
    {
      ...options,
      basePath: projectRoot,
    },
  );
}
