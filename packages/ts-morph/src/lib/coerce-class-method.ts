import {
  ClassDeclaration,
  MethodDeclarationStructure,
  OptionalKind,
} from 'ts-morph';

/**
 * Coerces a method declaration in a class.
 * If the method exists, it returns it. Otherwise, it creates it.
 *
 * @param classDeclaration - The class declaration to add the method to.
 * @param name - The name of the method.
 * @param structure - Optional structure to apply to the method.
 * @returns The existing or created method declaration.
 */
export function CoerceClassMethod(
  classDeclaration: ClassDeclaration,
  name: string,
  structure: Omit<OptionalKind<MethodDeclarationStructure>, 'name'> = {},
) {

  let methodDeclaration = classDeclaration.getMethod(name);

  if (!methodDeclaration) {

    methodDeclaration = classDeclaration.addMethod({ name });

    methodDeclaration.set(structure);

  }

  return methodDeclaration;

}
