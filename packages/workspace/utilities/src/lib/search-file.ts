import { join } from 'path';
import {
  DirEntryLike,
  FileEntryLike,
  IsGeneratorTreeLike,
  IsSchematicTreeLike,
  IsTreeLike,
  TreeLike,
} from './tree';

export function SearchFile<Tree extends TreeLike>(tree: Tree, path?: string): Generator<FileEntryLike>;
export function SearchFile(dir: DirEntryLike): Generator<FileEntryLike>;
export function* SearchFile(dirOrTree: DirEntryLike | TreeLike, path?: string): Generator<FileEntryLike> {

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

        if ([ 'node_modules' ].some(ignore => fullPath.includes(ignore))) {
          continue;
        }

        if (dirOrTree.isFile(fullPath)) {
          yield {
            path: fullPath,
            content: dirOrTree.read(fullPath)!,
          };
        } else {
          yield* SearchFile(dirOrTree, fullPath);
        }
      }
      return;

    } else if (IsSchematicTreeLike(dirOrTree)) {
      console.log('is schematic tree like');
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

  if ([ '/node_modules' ].some(ignore => dir.path.includes(ignore))) {
    return;
  }

  for (const file of dir.subfiles) {

    yield dir.file(file)!;

  }

  for (const subDir of dir.subdirs) {
    yield* SearchFile(dir.dir(subDir)!);
  }

}
