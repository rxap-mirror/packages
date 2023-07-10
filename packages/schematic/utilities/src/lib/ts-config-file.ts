import {
  Rule,
  Tree,
} from '@angular-devkit/schematics';
import { TsConfigJson } from './ts-config';
import { join } from 'path';
import {
  GetJsonFile,
  UpdateJsonFile,
  UpdateJsonFileOptions,
} from './json-file';
import { GetProjectRoot } from './get-project';

export function GetTsConfigJson(host: Tree, infix?: string): TsConfigJson {
  return GetJsonFile(host, infix ? `tsconfig.${ infix }.json` : 'tsconfig.json');
}

export interface UpdateTsConfigJsonOptions extends UpdateJsonFileOptions {
  infix?: string;
  basePath?: string;
}

export function UpdateTsConfigJson(
  updater: (tsConfig: TsConfigJson) => void | PromiseLike<void>,
  options?: UpdateTsConfigJsonOptions,
): Rule {
  return UpdateJsonFile(updater, join(options?.basePath ?? '', options?.infix ? `tsconfig.${options.infix}.json` : 'tsconfig.json'), options);
}

export interface UpdateProjectTsConfigJsonOptions extends UpdateJsonFileOptions {
  infix?: string;
  project: string;
}


export function UpdateProjectTsConfigJson(
  updater: (tsConfig: TsConfigJson) => void | PromiseLike<void>,
  options: UpdateProjectTsConfigJsonOptions,
): Rule {
  return tree => {
    const projectRoot = GetProjectRoot(tree, options.project);
    return UpdateTsConfigJson(updater, {
      ...options,
      basePath: projectRoot,
    })
  };
}
