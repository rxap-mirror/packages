import {
  equals,
  IsFunction,
  isPromise,
} from '@rxap/utilities';
import {
  parse,
  stringify,
} from 'yaml';
import { CoerceFile } from './coerce-file';
import {
  TreeAdapter,
  TreeLike,
} from './tree';

export function HasYamlFile<Tree extends TreeLike>(tree: Tree, filePath: string): boolean {

  const treeAdapter = new TreeAdapter(tree);

  if (treeAdapter.exists(filePath)) {
    const content = treeAdapter.read(filePath)!.toString();

    try {
      parse(content);
    } catch (e: any) {
      return false;
    }
    return true;
  }
  return false;
}

/**
 * Retrieves the contents of a JSON file and returns it as an object.
 * If the file does not exist and `create` flag is set to `true`, an empty JSON file will be created.
 *
 * @template T - The type of the returned JSON object.
 * @param tree - The file system tree-like object.
 * @param filePath - The path to the JSON file.
 * @param [create=false] - Flag indicating whether to create the file if it does not exist (default: false).
 * @throws If the JSON file does not exist and `create` flag is set to `false`.
 * @throws If the content of the JSON file could not be parsed.
 * @returns {T} The parsed JSON object.
 */
export function GetYamlFile<T = any>(tree: TreeLike, filePath: string, create = false): T {

  const treeAdapter = new TreeAdapter(tree);

  if (!tree.exists(filePath)) {
    if (!create) {
      throw new Error(`A yaml file at path '${ filePath }' does not exists`);
    } else {
      treeAdapter.create(filePath, '{}');
    }
  }

  const content = treeAdapter.read(filePath)!.toString();

  try {
    return parse(content);
  } catch (e: any) {
    throw new Error(`Could not parse the yaml file '${ filePath }': ${ e.message }`);
  }

}

export interface UpdateYamlFileOptions {
  space?: string | number;
  /**
   * true - create the file if it does not exist
   */
  coerce?: boolean;
}

export function UpdateYamlFile<T extends Record<string, any> = Record<string, any>>(
  tree: TreeLike,
  updaterOrYamlFile: T | ((yamlFile: T) => void),
  filePath: string,
  options?: UpdateYamlFileOptions,
): void
export function UpdateYamlFile<T extends Record<string, any> = Record<string, any>>(
  tree: TreeLike,
  updaterOrYamlFile: T | ((yamlFile: T) => Promise<void>),
  filePath: string,
  options?: UpdateYamlFileOptions,
): Promise<void>
export function UpdateYamlFile<T extends Record<string, any> = Record<string, any>>(
  tree: TreeLike,
  updaterOrYamlFile: T | ((yamlFile: T) => void | Promise<void>),
  filePath: string,
  options?: UpdateYamlFileOptions,
): void | Promise<void> {
  let yamlFile: T;
  let promise: Promise<void> | void | undefined;

  if (IsFunction(updaterOrYamlFile)) {
    yamlFile = GetYamlFile<T>(tree, filePath, options?.coerce);
    promise = updaterOrYamlFile(yamlFile);
  } else if (typeof updaterOrYamlFile === 'function') {
    throw new Error('FATAL: the update function was not a function');
  } else {
    yamlFile = updaterOrYamlFile;
  }

  const currentYamlFile = GetYamlFile<T>(tree, filePath, options?.coerce);

  if (promise && isPromise(promise)) {
    return promise.then(() => {
      if (!equals(yamlFile, currentYamlFile)) {
        CoerceFile(tree, filePath, stringify(yamlFile, undefined, options?.space ?? 2) + '\n', true);
      }
    });
  }

  if (!equals(yamlFile, currentYamlFile)) {
    CoerceFile(tree, filePath, stringify(yamlFile, undefined, options?.space ?? 2) + '\n', true);
  }

}
