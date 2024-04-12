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

export function UpdateTsConfigPaths<Tree extends TreeLike>(
  tree: Tree,
  updater: (paths: Record<string, Array<string>>) => void,
  options: UpdateTsConfigJsonOptions = {},
) {

  if (!options.basePath) {
    options.infix ??= 'base';
  }

  UpdateTsConfigJson(tree, tsConfig => {
    tsConfig.compilerOptions ??= {};
    tsConfig.compilerOptions.paths ??= {};
    updater(tsConfig.compilerOptions.paths);
  }, options);

}


export interface UpdateTsConfigJsonOptions extends UpdateJsonFileOptions {
  infix?: string;
  basePath?: string;
}

export function UpdateTsConfigJson<Tree extends TreeLike>(
  tree: Tree,
  updater: (tsConfig: TsConfigJson) => void,
  options?: UpdateTsConfigJsonOptions,
): void
export function UpdateTsConfigJson<Tree extends TreeLike>(
  tree: Tree,
  updater: (tsConfig: TsConfigJson) => Promise<void>,
  options?: UpdateTsConfigJsonOptions,
): Promise<void>
export function UpdateTsConfigJson<Tree extends TreeLike>(
  tree: Tree,
  updater: (tsConfig: TsConfigJson) => void | Promise<void>,
  options?: UpdateTsConfigJsonOptions,
): void | Promise<void> {
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
  updater: (tsConfig: TsConfigJson) => void,
  options: UpdateProjectTsConfigJsonOptions,
): void
export function UpdateProjectTsConfigJson<Tree extends TreeLike>(
  tree: Tree,
  updater: (tsConfig: TsConfigJson) => Promise<void>,
  options: UpdateProjectTsConfigJsonOptions,
): Promise<void>
export function UpdateProjectTsConfigJson<Tree extends TreeLike>(
  tree: Tree,
  updater: (tsConfig: TsConfigJson) => void | Promise<void>,
  options: UpdateProjectTsConfigJsonOptions,
): void | Promise<void> {
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
