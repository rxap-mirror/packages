import {
  ClassDeclaration,
  OptionalKind,
  PropertyDeclarationStructure,
} from 'ts-morph';

export function CoerceClassProperty(
  classDeclaration: ClassDeclaration,
  propertyName: string,
  propertyStructure: Omit<OptionalKind<PropertyDeclarationStructure>, 'name'>,
) {

  if (!classDeclaration.getProperty(propertyName)) {
    classDeclaration.addProperty({
      ...propertyStructure,
      name: propertyName,
    });
  }

}
