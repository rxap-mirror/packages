import {
  ClassDeclaration,
  ClassDeclarationStructure,
  OptionalKind,
  SourceFile,
} from 'ts-morph';

/**
 * Coerces a class declaration in a source file.
 * If the class exists, it returns it. Otherwise, it creates it.
 *
 * @param sourceFile - The source file to look in or add to.
 * @param className - The name of the class.
 * @param classStructure - Optional structure to apply to the class if it is created.
 * @returns The existing or created class declaration.
 */
export function CoerceClass(
  sourceFile: SourceFile,
  className: string,
  classStructure: Omit<OptionalKind<ClassDeclarationStructure>, 'name'> = {},
): ClassDeclaration {

  let classDeclaration = sourceFile.getClass(className);

  if (!classDeclaration) {
    classDeclaration = sourceFile.addClass({
      ...classStructure,
      name: className,
    });
  }

  return classDeclaration;
}
