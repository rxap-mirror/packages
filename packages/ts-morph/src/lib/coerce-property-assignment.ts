import {
  ClassLikeDeclarationBase,
  ObjectLiteralExpression,
  OptionalKind,
  PropertyAssignment,
  PropertyAssignmentStructure,
  PropertyDeclaration,
  PropertyDeclarationStructure,
  PropertySignature,
  PropertySignatureStructure,
  SyntaxKind,
  TypeElementMemberedNode,
  WriterFunction,
} from 'ts-morph';

/**
 * Coerces a property assignment in an object literal expression.
 * If the property exists, it returns it. Otherwise, it adds it.
 *
 * @param node - The object literal expression.
 * @param name - The name of the property.
 * @param initializer - The initializer for the property.
 * @param structure - Optional structure to apply to the property assignment.
 * @returns The existing or created property assignment.
 */
export function CoercePropertyAssignment(
  node: ObjectLiteralExpression,
  name: string,
  initializer: string | WriterFunction,
  structure: Omit<OptionalKind<PropertyAssignmentStructure>, 'name' | 'initializer'> = {},
): PropertyAssignment {
  let property = node.getProperty(name);
  if (!property) {
    property = node.addPropertyAssignment({ initializer, name });
    property.set(structure);
  }
  if (!property.isKind(SyntaxKind.PropertyAssignment)) {
    throw new Error(`Property ${name} is not a PropertyAssignment`);
  }
  return property;
}
