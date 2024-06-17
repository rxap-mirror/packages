import {
  ClassDeclaration,
  SourceFile,
  SyntaxKind,
} from 'ts-morph';
import { CoerceDefaultExport } from './coerce-default-export';

export function CoerceDefaultClassExport(sourceFileOrClassDeclaration: SourceFile | ClassDeclaration) {

  const classDeclaration = sourceFileOrClassDeclaration.isKind(SyntaxKind.SourceFile) ? sourceFileOrClassDeclaration.getClasses().filter(cd => !cd.isDefaultExport())[0] : sourceFileOrClassDeclaration;

  if (!ClassDeclaration) {
    throw new Error('No class declaration');
  }

  CoerceDefaultExport(classDeclaration);

}
