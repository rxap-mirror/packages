import {
  equals,
  IsFunction,
  isPromise,
} from '@rxap/utilities';
import { CoerceFile } from './coerce-file';
import {
  TreeAdapter,
  TreeLike,
} from './tree';

export function HasJsonFile<Tree extends TreeLike>(tree: Tree, filePath: string): boolean {

  const treeAdapter = new TreeAdapter(tree);

  if (treeAdapter.exists(filePath)) {
    const content = treeAdapter.read(filePath)!.toString();

    try {
      JSON.parse(content);
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
export function GetJsonFile<T = any>(tree: TreeLike, filePath: string, create = false): T {

  const treeAdapter = new TreeAdapter(tree);

  if (!tree.exists(filePath)) {
    if (!create) {
      throw new Error(`A json file at path '${ filePath }' does not exists`);
    } else {
      treeAdapter.create(filePath, '{}');
    }
  }

  const content = treeAdapter.read(filePath)!.toString();

  try {
    return JSON.parse(content);
  } catch (e: any) {
    throw new Error(`Could not parse the json file '${ filePath }': ${ e.message }`);
  }

}

export interface UpdateJsonFileOptions {
  space?: string | number;
  /**
   * true - create the file if it does not exist
   */
  create?: boolean;
}

export function UpdateJsonFile<T extends Record<string, any> = Record<string, any>>(
  tree: TreeLike,
  updaterOrJsonFile: T | ((jsonFile: T) => void),
  filePath: string,
  options?: UpdateJsonFileOptions,
): void
export function UpdateJsonFile<T extends Record<string, any> = Record<string, any>>(
  tree: TreeLike,
  updaterOrJsonFile: T | ((jsonFile: T) => Promise<void>),
  filePath: string,
  options?: UpdateJsonFileOptions,
): Promise<void>
export function UpdateJsonFile<T extends Record<string, any> = Record<string, any>>(
  tree: TreeLike,
  updaterOrJsonFile: T | ((jsonFile: T) => void | Promise<void>),
  filePath: string,
  options?: UpdateJsonFileOptions,
): void | Promise<void> {
  let jsonFile: T;
  let promise: Promise<void> | void | undefined;

  if (IsFunction(updaterOrJsonFile)) {
    jsonFile = GetJsonFile<T>(tree, filePath, options?.create);
    promise = updaterOrJsonFile(jsonFile);
  } else if (typeof updaterOrJsonFile === 'function') {
    throw new Error('FATAL: the update function was not a function');
  } else {
    jsonFile = updaterOrJsonFile;
  }

  const currentJsonFile = GetJsonFile<T>(tree, filePath, options?.create);

  if (promise && isPromise(promise)) {
    return promise.then(() => {
      if (!equals(jsonFile, currentJsonFile)) {
        CoerceFile(tree, filePath, JSON.stringify(jsonFile, undefined, options?.space ?? 2) + '\n', true);
      }
    });
  }

  if (!equals(jsonFile, currentJsonFile)) {
    CoerceFile(tree, filePath, JSON.stringify(jsonFile, undefined, options?.space ?? 2) + '\n', true);
  }

}
