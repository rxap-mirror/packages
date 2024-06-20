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

/**
 * Checks if a specified file in a tree-like structure is a valid JSON file.
 *
 * This function determines whether a file at a given path within a tree-like structure
 * contains valid JSON content. It utilizes a `TreeAdapter` to interact with the tree structure,
 * allowing it to check for the existence of the file and to read its contents.
 *
 * @param tree - An object representing the tree-like structure. Must be compatible with the `TreeAdapter`.
 * @param filePath - The path to the file within the tree structure to be checked.
 * @returns `true` if the file exists and contains valid JSON content, otherwise `false`.
 *
 * @typeParam Tree - The type of the tree structure that extends `TreeLike`, ensuring compatibility with `TreeAdapter`.
 *
 * @example
 * // Assuming `projectFiles` is a tree-like structure that includes a file at 'data/config.json'
 * const isValidJson = HasJsonFile(projectFiles, 'data/config.json');
 * console.log(isValidJson); // Outputs: true or false based on the file's content validity as JSON.
 */
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
/**
 * Updates a JSON file within a given `TreeLike` structure, either by directly setting the JSON object or by applying an update function.
 *
 * This function can handle both synchronous and asynchronous updates. If the updater is asynchronous (returns a Promise), the function itself will return a Promise.
 *
 * @param tree - The `TreeLike` object representing the file structure where the JSON file resides.
 * @param updaterOrJsonFile - Either a JSON object that represents the new state of the file, or a function (synchronous or asynchronous) that takes the current JSON object as an argument and modifies it directly.
 * @param filePath - The path to the JSON file within the `TreeLike` structure.
 * @param options - Optional. Configuration options for updating the JSON file. Available options include:
 * - `create`: A boolean indicating whether to create the file if it does not already exist.
 * - `space`: A number or string used to insert white space into the output JSON string for readability purposes.
 *
 * @throws {Error} Throws an error if `updaterOrJsonFile` is expected to be a function but is not correctly provided as such.
 *
 * @returns {void | Promise<void>} If the updater function is asynchronous, returns a Promise that resolves when the update is complete. Otherwise, returns nothing.
 *
 * @example
 * // Synchronously update a JSON file
 * UpdateJsonFile(tree, { key: 'value' }, '/path/to/file.json');
 *
 * @example
 * // Asynchronously update a JSON file using an updater function
 * UpdateJsonJsonFile(tree, async (json) => {
 * json.key = await fetchNewValue();
 * }, '/path/to/file.json');
 */
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
