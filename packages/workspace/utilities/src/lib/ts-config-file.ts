import { join } from 'path';
import { GetProjectRoot } from './get-project';
import {
  GetJsonFile,
  UpdateJsonFile,
  UpdateJsonFileOptions,
} from './json-file';
import { TreeLike } from './tree';
import { TsConfigJson } from './ts-config';

/**
 * Retrieves a TypeScript configuration file (`tsconfig.json`) from a given tree structure.
 * The function can fetch a specific `tsconfig` file by using an optional infix to target variant configurations.
 *
 * @param tree - The tree-like structure containing the file(s).
 * @param infix - Optional. A string used to specify a variant of the tsconfig file (e.g., 'prod' for 'tsconfig.prod.json').
 * @returns The TypeScript configuration object (`TsConfigJson`) from the specified file.
 *
 * @template Tree - A generic type that must conform to a tree-like interface, allowing file retrieval.
 */
export function GetTsConfigJson<Tree extends TreeLike>(tree: Tree, infix?: string): TsConfigJson {
  return GetJsonFile(tree, infix ? `tsconfig.${ infix }.json` : 'tsconfig.json');
}

/**
 * Updates the `paths` property in the TypeScript configuration file (`tsconfig.json`) of a given project tree.
 *
 * This function allows for custom modifications to the `paths` property, which is used for module resolution aliases in TypeScript.
 * The modifications are made by passing an updater function that directly mutates the `paths` object.
 *
 * @param tree - The project tree structure which contains the `tsconfig.json` file.
 * @param updater - A function that receives the current `paths` object (from `tsconfig.json`) and mutates it to apply desired changes.
 * @param options - Optional configuration options for updating the `tsconfig.json` file. Defaults to an empty object if not provided.
 * If `options.basePath` is not set, it defaults to using an infix of 'base'.
 *
 * @typeParam Tree - A generic type that extends `TreeLike`, representing the structure of the project tree.
 *
 * @remarks
 * This function internally calls `UpdateTsConfigJson` to handle the reading and writing of the `tsconfig.json` file.
 * It ensures that the `compilerOptions` and `paths` properties exist before calling the updater function.
 */
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
/**
 * Updates a TypeScript configuration file (`tsconfig.json`) within a project tree.
 *
 * This function applies a specified update operation to the `tsconfig.json` file, which can be either synchronous or asynchronous.
 * It supports targeting specific `tsconfig.json` files by using an infix to distinguish between different configurations (e.g., `tsconfig.app.json`).
 *
 * @param tree - The project tree structure that contains the `tsconfig.json` file.
 * @param updater - A function that takes the current `TsConfigJson` object and modifies it. This function can perform operations synchronously or return a Promise for asynchronous operations.
 * @param options - Optional. Configuration options for updating the `tsconfig.json` file. Includes:
 * - `basePath`: A base path under which the `tsconfig.json` file is located. Defaults to the root if not specified.
 * - `infix`: A string to specify a particular `tsconfig` file using an infix (e.g., "app" for `tsconfig.app.json`). Defaults to the main `tsconfig.json` if not provided.
 *
 * @returns A void or Promise<void> depending on whether the updater function is synchronous or asynchronous.
 *
 * @example
 * // To update the main tsconfig.json file asynchronously
 * UpdateTsConfigJson(tree, async (config) => {
 * config.compilerOptions.noImplicitAny = true;
 * }, { basePath: './src' });
 *
 * @example
 * // To update a specific tsconfig.app.json file synchronously
 * UpdateTsConfigJson(tree, (config) => {
 * config.compilerOptions.strictNullChecks = true;
 * }, { infix: 'app' });
 */
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

export function HasTsConfigJson<Tree extends TreeLike>(tree: Tree, options?: UpdateTsConfigJsonOptions) {
  return tree.exists(join(options?.basePath ?? '', options?.infix ? `tsconfig.${ options.infix }.json` : 'tsconfig.json'));
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
/**
 * Updates the TypeScript configuration for a specific project within a workspace.
 *
 * This function retrieves the project root directory based on the provided project identifier and applies an update operation to the TypeScript configuration file (tsconfig.json) located within that project directory.
 *
 * @param tree - An abstraction representing the file structure, which can be manipulated.
 * @param updater - A function that defines how the tsconfig.json should be updated. This function can be asynchronous and should take the current tsconfig.json configuration as an argument.
 * @param options - Configuration options for updating the tsconfig.json, including the project identifier and other relevant settings.
 * @returns A Promise resolving to void if the updater is asynchronous, otherwise void.
 *
 * @template Tree - A generic type that extends TreeLike, representing the structure of the project files.
 *
 * @example
 * UpdateProjectTsConfigJson(tree, (config) => {
 * config.compilerOptions.outDir = './dist';
 * }, { project: 'my-app' });
 */
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
