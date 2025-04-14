import { EachDirSync } from '@rxap/node-utilities';
import { deepMerge } from '@rxap/utilities';
import { readFileSync } from 'fs';
import {
  join,
  relative,
} from 'path';
import {
  parse,
  stringify,
} from 'yaml';
import {
  IsFsTreeLike,
  IsGeneratorTreeLike,
  IsSchematicTreeLike,
  TreeLike,
} from './tree';

export type FileMergeFunction = (
  currentContent: string, newContent: string, fileName: string, filePath: string) => string;

export interface FileMergeStrategy {
  match: RegExp;
  fnc: FileMergeFunction;
}

export interface CoerceFilesStructureOptions {
  srcFolder: string;
  target: string;
  overwrite?: boolean;
  mergeStrategies?: FileMergeStrategy[];
}

/**
 * Merges two YAML contents into a single YAML string. If the current content is not provided, it directly returns the new content.
 *
 * @param {string | undefined} currentContent - The existing YAML content as a string. If undefined, the function will return `newContent`.
 * @param {string} newContent - The new YAML content to be merged with the current content.
 * @param {string} fileName - The name of the file that is being processed. This parameter is currently not used in the function logic.
 * @param {string} filePath - The path of the file that is being processed. This parameter is currently not used in the function logic.
 * @returns {string} - The merged YAML content as a string.
 *
 * @remarks
 * This function uses `parse` to convert YAML string content into JavaScript objects and `deepMerge` to merge these objects. After merging, `stringify` is used to convert the JavaScript object back into a YAML string.
 */
export function YamlMergeFunction(currentContent: string | undefined, newContent: string, fileName: string, filePath: string) {
  if (!currentContent) {
    return newContent;
  }
  const currentData = parse(currentContent);
  const newData = parse(newContent);
  const mergedData = deepMerge(currentData, newData);
  return stringify(mergedData);
}

/**
 * Merges two JSON strings into one, combining their content deeply.
 *
 * This function takes two JSON strings, parses them into objects, and deeply merges the second
 * JSON object into the first. The result is a single JSON string that represents the merged
 * state of both inputs. This function is useful for updating JSON configurations or combining
 * JSON data in a structured way.
 *
 * @param currentContent - The JSON string representing the initial state.
 * @param newContent - The JSON string representing the new data to be merged into the initial state.
 * @param fileName - The name of the file associated with the JSON content. This parameter is currently not used in the function logic but can be useful for logging or error messages.
 * @param filePath - The path of the file associated with the JSON content. Like fileName, this parameter is not used in the function logic but can be useful for context.
 * @returns A stringified JSON representing the deeply merged result of the input JSON content, formatted with a 2-space indentation.
 */
export function JsonMergeFunction(currentContent: string, newContent: string, fileName: string, filePath: string) {
  const currentData = JSON.parse(currentContent);
  const newData = JSON.parse(newContent);
  const mergedData = deepMerge(currentData, newData);
  return JSON.stringify(mergedData, undefined, 2);
}

export const YAML_MERGE_STRATEGY = {
  match: /\.ya?ml$/,
  fnc: YamlMergeFunction,
};

export const JSON_MERGE_STRATEGY = {
  match: /\.json$/,
  fnc: JsonMergeFunction,
};

/**
 * Transfers files from a source folder to a target directory within a given tree structure, applying specific file merging strategies.
 *
 * This function iterates over each file in the specified source directory, processes it according to the provided options, and integrates it into the target directory within the tree. Files are optionally transformed by removing the `.template` suffix in their names. The function supports conditional overwriting and custom merge strategies based on regex matching of file paths.
 *
 * @param {TreeLike} tree - The tree structure where files will be manipulated. This can be any object that conforms to the TreeLike interface, supporting operations like `exists`, `read`, `create`, and `overwrite`.
 * @param {CoerceFilesStructureOptions} options - Configuration options for file processing, including:
 * @param {string} srcFolder - The source directory from which files are read.
 * @param {string} target - The target directory within the tree where files will be placed.
 * @param {boolean} overwrite - Flag to determine if existing files at the target location should be overwritten.
 * @param {Array<{match: RegExp, fnc: FileMergeFunction}>} mergeStrategies - Optional array of objects defining custom merge functions and the file patterns they apply to.
 *
 * The function supports two types of tree structures identified by `IsSchematicTreeLike` and `IsGeneratorTreeLike` checks, each requiring specific methods for file manipulation.
 *
 * Throws:
 * - `Error` if the tree type is neither schematic-like nor generator-like, as these are the only supported types.
 *
 * Note:
 * - The function reads files synchronously and expects the tree to handle both text and binary files as needed.
 * - Merge functions are applied only if a file already exists at the target location and a matching strategy is found.
 */
export function CoerceFilesStructure(tree: TreeLike,
                                     {
                                       srcFolder,
                                       target,
                                       overwrite,
                                       mergeStrategies,
                                     }: CoerceFilesStructureOptions,
) {
  for (const file of EachDirSync(srcFolder)) {
    const filePath = relative(srcFolder, file);
    const fullFilePath = join(target, filePath).replace(/\.template$/, '');
    if (!tree.exists(fullFilePath) || overwrite || mergeStrategies?.some(({ match }) => match.test(filePath))) {
      const mergeFunction: FileMergeFunction | undefined = mergeStrategies?.find(
        ({ match }) => match.test(filePath))?.fnc;
      if (IsSchematicTreeLike(tree)) {
        if (tree.exists(fullFilePath)) {
          if (mergeFunction) {
            let content = tree.readText(fullFilePath);
            content = mergeFunction(content, readFileSync(file, 'utf-8'), file, filePath);
            tree.overwrite(fullFilePath, content);
          } else {
            tree.overwrite(fullFilePath, readFileSync(file));
          }
        } else {
          tree.create(fullFilePath, readFileSync(file));
        }
      } else if (IsGeneratorTreeLike(tree) || IsFsTreeLike(tree)) {
        if (mergeFunction && tree.exists(fullFilePath)) {
          let content = tree.read(fullFilePath, 'utf-8')!;
          content = mergeFunction(content, readFileSync(file, 'utf-8'), file, filePath);
          tree.write(fullFilePath, content);
        } else {
          tree.write(fullFilePath, readFileSync(file));
        }
      } else {
        throw new Error('Invalid tree type');
      }
    }
  }
}
