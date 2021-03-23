import {
  Project,
  SourceFile
} from 'ts-morph';

export function CoerceSourceFile(
  project: Project,
  fileNameOrPath: string,
  content?: string
): SourceFile {

  let sourceFile = project.getSourceFile(fileNameOrPath);

  if (!sourceFile) {
    sourceFile = project.createSourceFile(fileNameOrPath, content);
  }

  return sourceFile;

}
