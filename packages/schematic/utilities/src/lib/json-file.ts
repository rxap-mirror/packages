import {
  Rule,
  SchematicsException,
  Tree,
} from '@angular-devkit/schematics';
import { CoerceFile } from './coerce-file';
import { IsFunction } from './function/is-function';
import { equals } from './equals';

export function HasJsonFile(host: Tree, filePath: string): boolean {
  if (host.exists(filePath)) {
    const content = host.read(filePath)!.toString();

    try {
      JSON.parse(content);
    } catch (e: any) {
      return false;
    }
    return true;
  }
  return false;
}

export function GetJsonFile<T = any>(host: Tree, filePath: string, create = false): T {

  if (!host.exists(filePath)) {
    if (!create) {
      throw new Error(`A json file at path '${filePath}' does not exists`);
    } else {
      host.create(filePath, '{}');
    }
  }

  const content = host.read(filePath)!.toString();

  try {
    return JSON.parse(content);
  } catch (e: any) {
    throw new SchematicsException(`Could not parse the json file '${filePath}': ${e.message}`);
  }

}

export interface UpdateJsonFileOptions {
  space?: string | number;
  create?: boolean;
}

export function UpdateJsonFile<T extends Record<string, any> = Record<string, any>>(
  updaterOrJsonFile: T | ((jsonFile: T) => void | PromiseLike<void>),
  filePath: string,
  options?: UpdateJsonFileOptions,
): Rule {
  return async tree => {

    let jsonFile: T;

    if (IsFunction(updaterOrJsonFile)) {
      jsonFile = GetJsonFile<T>(tree, filePath, options?.create);
      await updaterOrJsonFile(jsonFile);
    } else if (typeof updaterOrJsonFile === 'function') {
      throw new Error('FATAL: the update function was not a function');
    } else {
      jsonFile = updaterOrJsonFile;
    }

    const currentJsonFile = GetJsonFile<T>(tree, filePath, options?.create);

    if (!equals(jsonFile, currentJsonFile)) {
      CoerceFile(tree, filePath, JSON.stringify(jsonFile, undefined, options?.space ?? 2));
    }

  }
}
