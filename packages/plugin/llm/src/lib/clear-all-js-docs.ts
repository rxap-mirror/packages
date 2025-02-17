import {
  ClassDeclaration,
  InterfaceDeclaration,
  Project,
  Scope,
  SourceFile,
  SyntaxKind,
} from 'ts-morph';
import { clearJsDoc } from './clear-js-doc';

export function clearAllJsDocs<T extends SourceFile | ClassDeclaration | InterfaceDeclaration>(input: T, inplace = false): T {
  switch (input.getKind()) {

    case SyntaxKind.SourceFile:
      return clearAllJsDocsInSourceFile(input as SourceFile, inplace) as T;

    case SyntaxKind.ClassDeclaration:
      return clearAllJsDocsInClass(input as ClassDeclaration, inplace) as T;

    case SyntaxKind.InterfaceDeclaration:
      return clearAllJsDocsInInterface(input as InterfaceDeclaration, inplace) as T;

  }
  throw new Error('Unrecognized source file');
}

function clearAllJsDocsInSourceFile(sourceFile: SourceFile, inplace = false) {
  const p = new Project({ useInMemoryFileSystem: true });
  const clone = inplace ? sourceFile : p.createSourceFile('clean.ts', sourceFile.getFullText());
  clone.getClasses().forEach(classD => {
    clearJsDoc(classD);
    classD.getProperties().filter(property => !property.getScope() || property.getScope() === Scope.Public).forEach(
      prop => clearJsDoc(prop));
    classD.getMethods().filter(method => !method.getScope() || method.getScope() === Scope.Public).forEach(
      method => clearJsDoc(method));
  });
  clone.getInterfaces().forEach(interfaceD => {
    clearJsDoc(interfaceD);
    interfaceD.getProperties().forEach(prop => clearJsDoc(prop));
    interfaceD.getMethods().forEach(method => clearJsDoc(method));
  });
  clone.getTypeAliases().forEach(alias => clearJsDoc(alias));
  clone.getFunctions().forEach(funcD => clearJsDoc(funcD));
  return clone;
}

function clearAllJsDocsInClass(classDeclaration: ClassDeclaration, inplace = false) {
  const p = new Project({ useInMemoryFileSystem: true });
  const clone = inplace ? classDeclaration :
                p.createSourceFile('clean.ts', classDeclaration.getFullText()).getClassOrThrow(
                  classDeclaration.getName());
  clearJsDoc(clone);
  clone.getProperties().filter(property => !property.getScope() || property.getScope() === Scope.Public).forEach(
    prop => clearJsDoc(prop));
  clone.getMethods().filter(method => !method.getScope() || method.getScope() === Scope.Public).forEach(
    method => clearJsDoc(method));
  return clone;
}

function clearAllJsDocsInInterface(interfaceDeclaration: InterfaceDeclaration, inplace = false) {
  const p = new Project({ useInMemoryFileSystem: true });
  const clone = inplace ? interfaceDeclaration :
                p.createSourceFile('clean.ts', interfaceDeclaration.getFullText()).getInterfaceOrThrow(
                  interfaceDeclaration.getName());
  clearJsDoc(clone);
  clone.getProperties().forEach(prop => clearJsDoc(prop));
  clone.getMethods().forEach(method => clearJsDoc(method));
  return clone;
}
