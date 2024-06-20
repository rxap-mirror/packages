import { join } from 'path';
import {
  DirEntryLike,
  IsGeneratorTreeLike,
  IsSchematicTreeLike,
  TreeLike,
} from './tree';

/**
 * Recursively deletes directories and files from a specified path within a tree-like structure.
 *
 * This function supports two types of tree structures: SchematicTreeLike and GeneratorTreeLike.
 * It traverses the tree starting from the given path, deleting all files and subdirectories.
 *
 * @param tree - The tree-like structure from which elements will be deleted. This can be either a SchematicTreeLike or GeneratorTreeLike.
 * @param path - The starting directory path or directory entry from which deletion will begin. For SchematicTreeLike, this can be a string or DirEntryLike object. For GeneratorTreeLike, this must be a string.
 *
 * @throws {Error} - Throws an error if the tree type is not supported or if the required path type for GeneratorTreeLike is not a string.
 *
 * @remarks
 * - In the case of SchematicTreeLike, if `path` is a string, it retrieves the directory at the specified path. If `path` is a DirEntryLike, it uses it directly.
 * - In the case of GeneratorTreeLike, it only accepts a string for the `path` parameter and will throw an error if a DirEntryLike is provided.
 * - The function recursively deletes all subdirectories and files, ensuring that the entire directory tree starting from the specified path is removed.
 */
export function DeleteRecursive(tree: TreeLike, path: string | DirEntryLike) {

  if (IsSchematicTreeLike(tree)) {
    const dir = typeof path === 'string' ? tree.getDir(path) : path;
    for (const subDir of dir.subdirs) {
      DeleteRecursive(tree, dir.dir(subDir));
    }

    for (const subFile of dir.subfiles) {
      tree.delete(join(dir.path, subFile));
    }
  } else if (IsGeneratorTreeLike(tree)) {
    if (typeof path !== 'string') {
      throw new Error('GeneratorTreeLike requires path to be a string');
    }
    for (const sub of tree.children(path)) {
      if (tree.isFile(join(path, sub))) {
        tree.delete(join(path, sub));
      } else {
        DeleteRecursive(tree, join(path, sub));
      }
    }
  } else {
    throw new Error('Unknown tree type');
  }

}
