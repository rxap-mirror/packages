import { SourceFile, Scope, Project } from 'ts-morph';
import { clearJsDoc } from './clear-js-doc';

export function clearAllJsDocs(sourceFile: SourceFile, inplace = false) {
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
