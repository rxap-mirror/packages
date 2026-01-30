import {
  Project,
  SourceFile,
} from 'ts-morph';

/**
 * Coerces a source file in a project.
 * If the file exists, it returns it. Otherwise, it creates it.
 *
 * @param project - The ts-morph project.
 * @param fileNameOrPath - The file name or path.
 * @param content - Optional initial content for the file.
 * @returns The existing or created source file.
 */
export function CoerceSourceFile(
  project: Project,
  fileNameOrPath: string,
  content?: string,
): SourceFile {

  let sourceFile = project.getSourceFile(fileNameOrPath);

  if (!sourceFile) {
    sourceFile = project.createSourceFile(fileNameOrPath, content);
  }

  return sourceFile;

}
