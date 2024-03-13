import {
  ClassDeclaration,
  SourceFile,
} from 'ts-morph';
import { CoerceDefaultExport } from './coerce-default-export';

export function CoerceDefaultClassExport(sourceFileOrClassDeclaration: SourceFile | ClassDeclaration) {

  const classDeclaration = sourceFileOrClassDeclaration instanceof SourceFile ? sourceFileOrClassDeclaration.getClasses().filter(cd => !cd.isDefaultExport())[0] : sourceFileOrClassDeclaration;

  if (!ClassDeclaration) {
    throw new Error('No class declaration');
  }

  CoerceDefaultExport(classDeclaration);

}
