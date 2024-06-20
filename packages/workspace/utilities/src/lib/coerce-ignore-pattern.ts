import { CoerceFile } from './coerce-file';
import { TreeLike } from './tree';

/**
 * Modifies the content of a file within a given tree structure by ensuring all specified patterns exist in the file.
 * If any pattern from the list is not found in the file's content, it appends that pattern at the end of the content.
 * Each appended pattern is placed on a new line. Additionally, ensures the file content ends with a newline character.
 *
 * @param {TreeLike} tree - The tree-like structure containing the file.
 * @param {string} filePath - The path to the file within the tree structure.
 * @param {string[]} patternList - An array of string patterns to be ensured in the file's content.
 */
export function CoerceIgnorePattern(tree: TreeLike, filePath: string, patternList: string[]) {
  let content = CoerceFile(tree, filePath);

  for (const pattern of patternList) {
    if (!content.includes(pattern)) {
      content += `\n${ pattern }`;
    }
  }

  if (!content.endsWith('\n')) {
    content += '\n';
  }

  CoerceFile(tree, filePath, content, true);
}
