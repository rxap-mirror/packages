import { Project } from 'ts-morph';
import { join } from 'path';

/**
 * Copies all files from the source project to the target project.
 *
 * The rel path is used to prefix all file path in the source project
 *
 * @param target
 * @param source
 * @param relPath
 * @constructor
 */
export function MergeTsMorphProject(target: Project, source: Project, relPath: string) {

  for (const sourceFile of source.getSourceFiles()) {
    target.createSourceFile(
      join(relPath, sourceFile.getFilePath()),
      sourceFile.getFullText(),
      {overwrite: true},
    );
  }

}
