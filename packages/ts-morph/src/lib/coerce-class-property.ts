import {
  ClassDeclaration,
  OptionalKind,
  PropertyDeclaration,
  PropertyDeclarationStructure,
} from 'ts-morph';

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
