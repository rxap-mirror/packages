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

export function YamlMergeFunction(currentContent: string, newContent: string, fileName: string, filePath: string) {
  const currentData = parse(currentContent);
  const newData = parse(newContent);
  const mergedData = deepMerge(currentData, newData);
  return stringify(mergedData);
}

export function JsonMergeFunction(currentContent: string, newContent: string, fileName: string, filePath: string) {
  const currentData = JSON.parse(currentContent);
  const newData = JSON.parse(newContent);
  const mergedData = deepMerge(currentData, newData);
  return JSON.stringify(mergedData);
}

export const YAML_MERGE_STRATEGY = {
  match: /\.ya?ml$/,
  fnc: YamlMergeFunction,
};

export const JSON_MERGE_STRATEGY = {
  match: /\.json$/,
  fnc: JsonMergeFunction,
};

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
    const fullFilePath = join(target, filePath);
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
      } else if (IsGeneratorTreeLike(tree)) {
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
