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

/**
 * Checks if a specified file within a tree-like structure is a valid YAML file.
 *
 * This function determines whether a file at a given path exists within the provided tree structure
 * and verifies if the content of the file is valid YAML. It utilizes a `TreeAdapter` to interact with
 * the tree structure, allowing file operations like checking existence and reading content.
 *
 * @param tree - An object representing a tree-like structure where files and directories are organized.
 * @param filePath - The path to the file within the tree structure to be checked.
 * @returns `true` if the file exists and contains valid YAML content, otherwise `false`.
 *
 * @typeparam Tree - A generic type that extends `TreeLike`, representing the structure containing the file.
 *
 * @example
 *
 * const fileTree = new FileTree();
 * const result = HasYamlFile(fileTree, 'config/settings.yaml');
 * console.log(result); // Outputs: true or false based on the file's validity as a YAML.
 * ```
 */
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
/**
 * Updates a YAML file within a given tree-like structure, either by directly setting the YAML content or by applying an update function.
 *
 * This function can handle both synchronous and asynchronous updates. If the updater is a function, it can optionally return a promise, which allows for asynchronous operations before finalizing the update.
 *
 * @param tree - The tree-like structure containing the YAML file to be updated.
 * @param updaterOrYamlFile - Either a direct YAML object or a function that takes a YAML object and optionally returns a void or a Promise. If a function is provided, it is used to modify the YAML file's content.
 * @param filePath - The path to the YAML file within the tree.
 * @param options - Optional. Configuration options for updating the YAML file. Available options include:
 * - `coerce`: A boolean to determine whether type coercion should be applied when retrieving the YAML file.
 * - `space`: The number of spaces to use for indentation in the resulting YAML string.
 *
 * @returns void or a Promise that resolves when the update is complete, particularly if the update operation is asynchronous.
 *
 * @throws Error - Throws an error if `updaterOrYamlFile` is expected to be a function but is not.
 *
 * @example
 * // Synchronously update a YAML file by directly setting the YAML content
 * UpdateYamlFile(tree, { key: 'value' }, '/path/to/file.yml');
 *
 * @example
 * // Asynchronously update a YAML file using an update function
 * UpdateYamlFile(tree, async (yaml) => {
 * yaml.key = await fetchNewValue();
 * }, '/path/to/file.yml');
 */
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
