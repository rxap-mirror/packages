import {
  ClassDeclaration,
  SourceFile,
  SyntaxKind,
} from 'ts-morph';
import { CoerceDefaultExport } from './coerce-default-export';
import 'colors';

/**
 * Ensures that the class declaration in the source file is the default export.
 *
 * @param sourceFileOrClassDeclaration - The source file or class declaration.
 */
export function CoerceDefaultClassExport(sourceFileOrClassDeclaration: SourceFile | ClassDeclaration) {

  const sourceFile = sourceFileOrClassDeclaration.isKind(SyntaxKind.SourceFile) ? sourceFileOrClassDeclaration : sourceFileOrClassDeclaration.getSourceFile();
  const classDeclaration = sourceFileOrClassDeclaration.isKind(SyntaxKind.SourceFile) ?
                           sourceFileOrClassDeclaration.getClasses()[0] :
                           sourceFileOrClassDeclaration;

  if (!classDeclaration) {
    console.log(`No class declaration in source file: ${ sourceFile.getFilePath() }`.red);
  } else {
    CoerceDefaultExport(classDeclaration);
  }

}
