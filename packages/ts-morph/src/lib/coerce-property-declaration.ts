import {
  ClassLikeDeclarationBase,
  OptionalKind,
  PropertyDeclaration,
  PropertyDeclarationStructure,
  PropertySignature,
  PropertySignatureStructure,
  TypeElementMemberedNode,
} from 'ts-morph';

/**
 * Coerces a property declaration in a class or interface.
 * If the property exists, it returns it. Otherwise, it adds it.
 *
 * @param typeElementMemberedNode - The type element membered node (e.g. Interface).
 * @param name - The name of the property.
 * @param structure - Optional structure to apply to the property.
 * @returns The existing or created property signature.
 */
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
