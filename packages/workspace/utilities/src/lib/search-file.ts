import { join } from 'path';
import {
  DirEntryLike,
  FileEntryLike,
  IsGeneratorTreeLike,
  IsSchematicTreeLike,
  IsTreeLike,
  TreeLike,
} from './tree';

export function SearchFile<Tree extends TreeLike>(tree: Tree, path?: string, include?: (path: string) => boolean, exclude?: (path: string) => boolean): Generator<FileEntryLike>;
export function SearchFile(dir: DirEntryLike): Generator<FileEntryLike>;
/**
 * Recursively searches through directories and trees to find and yield file entries.
 * This generator function can handle different types of directory or tree structures,
 * yielding each file entry that matches the specified path or the entire structure if no path is provided.
 *
 * @param {DirEntryLike | TreeLike} dirOrTree - The directory or tree-like structure to search within.
 * This can be a simple directory structure or a more complex tree that may require specific handling.
 * @param {string} [path] - Optional path to start the search from. If not provided, the search starts from the root.
 *
 * @yields {FileEntryLike} - Yields file entries that are found within the specified directory or tree.
 * Each yielded file entry contains the path and content of the file.
 *
 * @throws {Error} Throws an error if an unknown tree type is encountered.
 *
 * @example
 * // To use this function, you might pass in a directory-like object and an optional path:
 * for (const file of SearchFile(directoryTree, 'src')) {
 * console.log(file.path, file.content);
 * }
 *
 * @remarks
 * - The function skips over directories or paths that start with '.' or contain 'node_modules'.
 * - This is designed to be used in environments where file systems or virtual file structures are represented
 * in a tree-like format, such as in certain JavaScript/TypeScript projects or schematics.
 */
export function* SearchFile(dirOrTree: DirEntryLike | TreeLike, path?: string, include?: (path: string) => boolean, exclude?: (path: string) => boolean): Generator<FileEntryLike> {

  let dir: DirEntryLike;

  if (IsTreeLike(dirOrTree)) {
    if (IsGeneratorTreeLike(dirOrTree)) {

      path ??= '';

      const children = dirOrTree.children(path);

      for (const child of children) {
        const fullPath = join(path, child);

        if ([ '.', 'node_modules' ].some(ignore => fullPath.startsWith(ignore))) {
          continue;
        }

        if ([ 'node_modules', 'dist', 'docs', 'coverage' ].some(ignore => fullPath.includes(ignore))) {
          continue;
        }

        if (exclude && exclude(fullPath)) {
          continue;
        }

        if (dirOrTree.isFile(fullPath)) {
          if (!include || include(fullPath)) {
            yield {
              path: fullPath,
              content: dirOrTree.read(fullPath)!,
            };
          }
        } else {
          yield* SearchFile(dirOrTree, fullPath, include, exclude);
        }
      }
      return;

    } else if (IsSchematicTreeLike(dirOrTree)) {
      dir = dirOrTree.getDir(path ?? dirOrTree.root.path);
    } else {
      throw new Error('Unknown tree type');
    }
  } else {
    dir = dirOrTree;
  }

  if ([ '/.', '/node_modules' ].some(ignore => dir.path.startsWith(ignore))) {
    return;
  }

  if ([ '/node_modules', '/dist', '/docs', '/coverage' ].some(ignore => dir.path.includes(ignore))) {
    return;
  }

  for (const file of dir.subfiles) {

    yield dir.file(file)!;

  }

  for (const subDir of dir.subdirs) {
    yield* SearchFile(dir.dir(subDir)!);
  }

}
