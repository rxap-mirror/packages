import { ClassDeclaration } from 'ts-morph';

/**
 * @deprecated import from @rxap/sts-morph
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
