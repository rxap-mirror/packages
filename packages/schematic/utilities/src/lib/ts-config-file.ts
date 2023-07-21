import {
  Rule,
  Tree,
} from '@angular-devkit/schematics';
import {
  TsConfigJson,
  UpdateProjectTsConfigJson,
  UpdateTsConfigJson,
} from '@rxap/workspace-utilities';
import {
  GetJsonFile,
  UpdateJsonFileOptions,
} from './json-file';

export function GetTsConfigJson(host: Tree, infix?: string): TsConfigJson {
  return GetJsonFile(host, infix ? `tsconfig.${ infix }.json` : 'tsconfig.json');
}

export interface UpdateTsConfigJsonOptions extends UpdateJsonFileOptions {
  infix?: string;
  basePath?: string;
}

export function UpdateTsConfigJsonRule(
  updater: (tsConfig: TsConfigJson) => void | PromiseLike<void>,
  options?: UpdateTsConfigJsonOptions,
): Rule {
  return tree => UpdateTsConfigJson(tree, updater, options);
}

export interface UpdateProjectTsConfigJsonOptions extends UpdateJsonFileOptions {
  infix?: string;
  project: string;
}


export function UpdateProjectTsConfigJsonRule(
  updater: (tsConfig: TsConfigJson) => void | PromiseLike<void>,
  options: UpdateProjectTsConfigJsonOptions,
): Rule {
  return tree => UpdateProjectTsConfigJson(tree, updater, options);
}
