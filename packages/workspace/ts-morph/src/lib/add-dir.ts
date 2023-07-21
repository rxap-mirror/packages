import {
  DirEntryLike,
  IsGeneratorTreeLike,
  IsSchematicTreeLike,
  TreeLike,
} from '@rxap/workspace-utilities';
import {
  join,
  relative,
} from 'path';
import { Project } from 'ts-morph';

/**
 * Adds all files recursively from a specify path to the project.
 * @param tree A nx Tree instance
 * @param directoryPath A directory path
 * @param project A ts-morph Project instance
 * @param filter A filter function base on the pathFragment and dirEntry
 */
export function AddDir(
  tree: TreeLike,
  directoryPath: string,
  project: Project,
  filter: ((fileName: string, dirPath: string) => boolean) = path => path.endsWith('.ts'),
  basePath = directoryPath,
) {
  if (IsSchematicTreeLike(tree)) {
    return SchematicAddDir(tree.getDir(directoryPath), project, '', (
      pathFragment: string,
      dirEntry: DirEntryLike,
    ) => filter(pathFragment, dirEntry.path));
  }
  if (IsGeneratorTreeLike(tree)) {
    if (tree.isFile(directoryPath)) {
      throw new Error(`The path '${ directoryPath }' does not point to a dir entry`);
    }

    const children = tree.children(directoryPath);

    const files = children.filter(fileOrDirectoryName => tree.isFile(join(directoryPath, fileOrDirectoryName)));

    const includeFiles = files.filter(fileName => filter(fileName, directoryPath));

    for (const fileName of includeFiles) {
      const filePath = join(directoryPath, fileName);
      const projectFilePath = relative(basePath, filePath);
      if (!project.getSourceFile(projectFilePath)) {
        project.createSourceFile(projectFilePath, tree.read(filePath)!.toString('utf-8'));
      }
    }
    for (const dirName of
      tree.children(directoryPath).filter(pf => !tree.isFile(join(directoryPath, pf)))) {
      AddDir(tree, join(directoryPath, dirName), project, filter, basePath);
    }
    return;
  }
  throw new Error('The tree is not a valid nx or angular schematic tree');
}

/**
 * Adds all files recursively from a specify DirEntry to the project.
 * @param dir A schematic DirEntry instance
 * @param project A ts-morph Project instance
 * @param parentPath The base dir for the sourceFiles in the ts-morph Project
 * @param filter A filter function base on the pathFragment and dirEntry
 */
function SchematicAddDir(
  dir: DirEntryLike,
  project: Project,
  parentPath = '',
  filter: ((
    pathFragment: string,
    dirEntry: DirEntryLike,
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
      SchematicAddDir(dirEntry, project, join(parentPath, pathFragment), filter);
    } else {
      throw new Error('The path fragment does not point to a dir entry');
    }
  }
}
