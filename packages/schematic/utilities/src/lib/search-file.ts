import {
  DirEntry,
  FileEntry,
} from '@angular-devkit/schematics';

export function* SearchFile(dir: DirEntry): Generator<FileEntry> {

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
