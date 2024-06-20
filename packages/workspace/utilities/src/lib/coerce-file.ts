import {
  TreeAdapter,
  TreeLike,
} from './tree';

/**
 * Coerces the content of a file within a tree-like structure, optionally overwriting existing content.
 *
 * This function ensures that a file at a specified path either is created or has its content updated
 * within a hierarchical file system represented by a `TreeLike` object. The function can handle both
 * string and Buffer content types, and it supports specifying whether to overwrite existing files.
 *
 * @param {TreeLike} tree - The tree-like structure where the file is located or to be created.
 * @param {string} filePath - The path to the file within the tree structure.
 * @param {string | Buffer} content - The new content to be written to the file. Defaults to an empty string.
 * @param {boolean} overwrite - A flag indicating whether to overwrite the file if it already exists. Defaults to false.
 * @param {BufferEncoding} encoding - The character encoding to use when reading and writing to the file. Defaults to 'utf-8'.
 * @returns {string} The current (new or existing) content of the file after any modifications, as a string.
 *
 * @example
 * // Define a tree-like structure (assuming TreeLike and TreeAdapter are implemented elsewhere)
 * const myTree = new MyTree();
 * // Create or update a file
 * const fileContent = CoerceFile(myTree, '/path/to/file.txt', 'Hello, World!', true);
 * console.log(fileContent); // Outputs the content of the file
 */
export function CoerceFile(
  tree: TreeLike,
  filePath: string,
  content: string | Buffer = '',
  overwrite = false,
  encoding: BufferEncoding = 'utf-8',
): string {
  const treeAdapter = new TreeAdapter(tree);
  if (tree.exists(filePath)) {
    const currentContent = treeAdapter.read(filePath, encoding);
    if (currentContent !== content && overwrite) {
      treeAdapter.overwrite(filePath, content);
    }
  } else {
    treeAdapter.create(filePath, content);
  }
  return treeAdapter.read(filePath)!.toString(encoding);
}
