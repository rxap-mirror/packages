import {
  GetJsonFile,
  UpdateJsonFile,
  UpdateJsonFileOptions,
} from './json-file';
import { NxJson } from './nx-json';
import { TreeLike } from './tree';

/**
 * Retrieves the `nx.json` configuration file from a given project tree.
 *
 * This function specifically fetches the `nx.json` file, which is a configuration file used in Nx workspaces.
 * It utilizes a generic helper function `GetJsonFile` to read the JSON file from the provided tree structure.
 *
 * @param tree - The project tree structure from which to retrieve the `nx.json` file. This tree must conform to the `TreeLike` interface.
 * @returns An instance of `NxJson` containing the parsed contents of the `nx.json` file.
 * @template Tree - A generic type that extends `TreeLike`, representing the structure of the project tree.
 */
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
/**
 * Updates the `nx.json` configuration file in a project workspace.
 *
 * This function delegates the update process to `UpdateJsonFile`, specifically targeting the `nx.json` file.
 * It can handle both synchronous and asynchronous updates depending on the updater function provided.
 *
 * @param tree - The abstract representation of the file system to apply the updates.
 * @param updaterOrJsonFile - Either a direct `NxJson` object or a function that takes an `NxJson` object
 * and optionally returns a void or a Promise for asynchronous operations.
 * @param options - Optional configuration options for updating the JSON file, such as formatting options.
 * @returns A void or a Promise that resolves when the update operation is complete, depending on the nature of the updater.
 *
 * @template Tree - A generic type that extends `TreeLike`, representing the file system structure.
 *
 * @example
 * // Synchronous update example
 * UpdateNxJson(tree, (nxJson) => {
 * nxJson.projects.myApp = { tags: ['angular', 'frontend'] };
 * });
 *
 * @example
 * // Asynchronous update example
 * UpdateNxJson(tree, async (nxJson) => {
 * await someAsyncFunction();
 * nxJson.projects.myApp = { tags: ['react', 'frontend'] };
 * });
 */
export function UpdateNxJson<Tree extends TreeLike>(
  tree: Tree,
  updaterOrJsonFile: NxJson | ((nxJson: NxJson) => void | Promise<void>),
  options?: UpdateNxJsonOptions,
): void | Promise<void> {
  return UpdateJsonFile(tree, updaterOrJsonFile, 'nx.json', options);
}
