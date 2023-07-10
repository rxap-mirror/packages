import {Tree} from '@nx/devkit';
import {Project} from 'ts-morph';
import {join} from 'path';

/**
 * Adds all files recursively from a specify path to the project.
 * @param tree A nx Tree instance
 * @param directoryPath A directory path
 * @param project A ts-morph Project instance
 * @param filter A filter function base on the pathFragment and dirEntry
 */
export function AddDir(tree: Tree, directoryPath: string, project: Project, filter: ((fileName: string, dirPath: string) => boolean) = path => path.endsWith('.ts')) {
  if (tree.isFile(directoryPath)) {
    throw new Error(`The path '${directoryPath}' does not point to a dir entry`);
  }
  for (const fileName of tree.children(directoryPath)
    .filter(fileOrDirectoryName => tree.isFile(join(directoryPath, fileOrDirectoryName)))
    .filter(fileName => filter(fileName, directoryPath))) {
    const filePath = join(directoryPath, fileName);
    if (!project.getSourceFile(filePath)) {
      project.createSourceFile(filePath, tree.read(filePath)!.toString('utf-8'));
    }
  }
  for (const dirName of tree.children(directoryPath).filter(pf => !tree.isFile(join(directoryPath, pf)))) {
    AddDir(tree, join(directoryPath, dirName), project, filter);
  }
}
