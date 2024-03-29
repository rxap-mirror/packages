import {
  ClassDeclaration,
  OptionalKind,
  PropertyDeclarationStructure,
} from 'ts-morph';

/**
 * @deprecated import from @rxap/ts-morph
 */
export function CoerceClassProperty(
  classDeclaration: ClassDeclaration,
  propertyName: string,
  propertyStructure: Omit<OptionalKind<PropertyDeclarationStructure>, 'name'>,
) {

  let propertyDeclaration = classDeclaration.getProperty(propertyName);

  if (!propertyDeclaration) {
    propertyDeclaration = classDeclaration.insertProperty(0, {
      ...propertyStructure,
      name: propertyName,
    });
  }

  return propertyDeclaration;
}
