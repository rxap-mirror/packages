import {
  ClassDeclaration,
  ClassDeclarationStructure,
  OptionalKind,
  SourceFile
} from 'ts-morph';

export function CoerceClass(
  sourceFile: SourceFile,
  className: string,
  classStructure: Omit<OptionalKind<ClassDeclarationStructure>, 'name'> = {}
): ClassDeclaration {

  let classDeclaration = sourceFile.getClass(className);

  if (!classDeclaration) {
    classDeclaration = sourceFile.addClass({
      ...classStructure,
      name: className
    });
  }

  return classDeclaration;
}
