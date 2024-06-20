import { GetNxJson } from './nx-json-file';
import { TreeLike } from './tree';

/**
 * Retrieves the default configuration options for a specified generator from the Nx workspace configuration.
 *
 * This function fetches the Nx workspace configuration (`nx.json`) and extracts the default options for a given generator.
 * If the specified generator does not have any default options set, an empty object is returned.
 *
 * @template T - The expected type of the configuration options, extending a record of string keys to unknown values.
 * @param {TreeLike} tree - An abstraction representing the file system tree, used to access and manipulate files.
 * @param {string} generatorName - The name of the generator for which to retrieve the default options.
 * @returns {T} - The default configuration options for the specified generator as an object of type T. Returns an empty object if no options are set.
 */
export function GetDefaultGeneratorOptions<T extends Record<string, unknown> = Record<string, unknown>>(tree: TreeLike, generatorName: string): T {
  const nxJson = GetNxJson(tree);
  return (nxJson.generators?.[generatorName] ?? {}) as T;
}
