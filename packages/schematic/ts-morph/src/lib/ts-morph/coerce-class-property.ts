import {ClassDeclaration, OptionalKind, PropertyDeclarationStructure} from 'ts-morph';

export function CoerceClassProperty(
  classDeclaration: ClassDeclaration,
  propertyName: string,
  propertyStructure: Omit<OptionalKind<PropertyDeclarationStructure>, 'name'>,
) {

  let propertyDeclaration = classDeclaration.getProperty(propertyName);

  if (!propertyDeclaration) {
    propertyDeclaration = classDeclaration.addProperty({
      ...propertyStructure,
      name: propertyName,
    });
  }

  return propertyDeclaration;
}
