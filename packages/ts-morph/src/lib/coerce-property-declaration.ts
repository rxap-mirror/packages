import {
  ClassLikeDeclarationBase,
  OptionalKind,
  PropertyDeclaration,
  PropertyDeclarationStructure,
  PropertySignature,
  PropertySignatureStructure,
  TypeElementMemberedNode,
} from 'ts-morph';

export function CoercePropertyDeclaration(
  typeElementMemberedNode: TypeElementMemberedNode,
  name: string,
  structure?: Partial<PropertyDeclarationStructure>,
): PropertySignature
export function CoercePropertyDeclaration(
  classLikeDeclarationBase: ClassLikeDeclarationBase,
  name: string,
  structure?: Partial<PropertyDeclarationStructure>,
): PropertyDeclaration
export function CoercePropertyDeclaration(
  node: ClassLikeDeclarationBase | TypeElementMemberedNode,
  name: string,
  structure: Omit<OptionalKind<PropertyDeclarationStructure>, 'name'> | Omit<OptionalKind<PropertySignatureStructure>, 'name'> = {},
): PropertyDeclaration | PropertySignature {
  let property = node.getProperty(name);
  if (!property) {
    property = node.addProperty({ name });
    property.set(structure as any);
  }
  return property;
}
