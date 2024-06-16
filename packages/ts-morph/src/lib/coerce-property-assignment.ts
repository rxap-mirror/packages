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
