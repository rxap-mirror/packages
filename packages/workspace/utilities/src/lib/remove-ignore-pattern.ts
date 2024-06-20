import {
  CoerceFile,
  TreeAdapter,
  TreeLike,
} from '@rxap/workspace-utilities';

/**
 * Removes specified patterns from a file within a given tree-like structure.
 *
 * This function iterates over a list of patterns and removes any line in the file that matches
 * a pattern exactly, after trimming whitespace. The function first checks if the file exists
 * in the tree. If the file does not exist, the function returns immediately. If the file does exist,
 * it reads the file content, processes it to remove lines matching any of the specified patterns,
 * and then writes the modified content back to the file.
 *
 * @param {TreeLike} tree - The tree-like structure containing the file.
 * @param {string} filePath - The path to the file within the tree.
 * @param {string[]} patternList - An array of string patterns to be removed from the file.
 */
export function RemoveIgnorePattern(tree: TreeLike, filePath: string, patternList: string[]) {
  if (!tree.exists(filePath)) {
    return;
  }

  let content = CoerceFile(tree, filePath);

  for (const pattern of patternList) {
    content = content.split('\n').filter((line) => line.trim() !== pattern).join('\n');
  }

  CoerceFile(tree, filePath, content, true);

}
