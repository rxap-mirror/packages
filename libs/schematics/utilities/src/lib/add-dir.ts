import { DirEntry } from '@angular-devkit/schematics';
import { Project } from 'ts-morph';
import { join } from 'path';

export function AddDir(dir: DirEntry, project: Project, parentPath: string = '', filter: ((pathFragment: string) => boolean) = () => true) {
  for (const pathFragment of dir.subfiles.filter(filter)) {
    const fileEntry = dir.file(pathFragment);
    if (fileEntry) {
      project.createSourceFile(join(parentPath, pathFragment), fileEntry.content.toString('utf-8'));
    } else {
      throw new Error('The path fragment does not point to a file entry');
    }
  }
  for (const pathFragment of dir.subdirs) {
    const dirEntry = dir.dir(pathFragment);
    if (dirEntry) {
      AddDir(dirEntry, project, join(parentPath, pathFragment), filter);
    } else {
      throw new Error('The path fragment does not point to a dir entry');
    }
  }
}
