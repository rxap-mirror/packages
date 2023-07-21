import { DirEntry } from '@angular-devkit/schematics';
import { join } from 'path';
import { Project } from 'ts-morph';

/**
 * Adds all files recursively from a specify DirEntry to the project.
 * @param dir A schematic DirEntry instance
 * @param project A ts-morph Project instance
 * @param parentPath The base dir for the sourceFiles in the ts-morph Project
 * @param filter A filter function base on the pathFragment and dirEntry
 */
export function AddDir(
  dir: DirEntry,
  project: Project,
  parentPath = '',
  filter: ((
    pathFragment: string,
    dirEntry: DirEntry,
  ) => boolean) = pathFragment => !!pathFragment.match(/\.ts$/),
) {
  for (const pathFragment of dir.subfiles.filter(pf => filter(pf, dir))) {
    const fileEntry = dir.file(pathFragment);
    if (fileEntry) {
      const filePath = join(parentPath, pathFragment);
      if (!project.getSourceFile(filePath)) {
        project.createSourceFile(filePath, fileEntry.content.toString('utf-8'));
      }
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
