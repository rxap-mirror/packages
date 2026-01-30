import { ClassDeclaration } from 'ts-morph';

/**
 * Coerces a constructor declaration for a class.
 * If a constructor already exists, it returns it. Otherwise, it adds a new one.
 *
 * @param classDeclaration - The class declaration to check/add the constructor to.
 * @returns An array of constructor declarations (should ideally be one).
 */
export function CoerceClassConstructor(classDeclaration: ClassDeclaration) {
  const constructorDeclarations = classDeclaration.getConstructors();
  if (constructorDeclarations.length === 0) {
    constructorDeclarations.push(
      classDeclaration.addConstructor({
        parameters: [],
      }),
    );
  }
  return constructorDeclarations;
}
