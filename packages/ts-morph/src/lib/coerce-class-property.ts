import {
  ClassDeclaration,
  OptionalKind,
  PropertyDeclaration,
  PropertyDeclarationStructure,
} from 'ts-morph';

/**
 * @deprecated instead use the CoercePropertyDeclaration function from @rxap/ts-morph
 */
/**
 * Coerces a property declaration in a class.
 * If the property exists, it returns it. Otherwise, it adds it at index 0.
 * @deprecated Use CoercePropertyDeclaration instead.
 *
 * @param classDeclaration - The class declaration.
 * @param propertyName - The name of the property.
 * @param propertyStructure - The structure of the property.
 * @returns The property declaration.
 */
export function CoerceClassProperty(
  classDeclaration: ClassDeclaration,
  propertyName: string,
  propertyStructure: Omit<OptionalKind<PropertyDeclarationStructure>, 'name'>,
): PropertyDeclaration {

  let propertyDeclaration = classDeclaration.getProperty(propertyName);

  if (!propertyDeclaration) {
    propertyDeclaration = classDeclaration.insertProperty(0, {
      ...propertyStructure,
      name: propertyName,
    });
  }

  return propertyDeclaration;
}
