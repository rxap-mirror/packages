import {
  ArrayLiteralExpression,
  ObjectLiteralExpression,
  PropertyAssignment,
  SyntaxKind,
} from 'ts-morph';

/**
 * Gets an array literal expression from a property assignment in an object literal.
 * Returns null if the property does not exist.
 * Throws if the property is not an array literal assignment.
 *
 * @param objectLiteral - The object literal expression.
 * @param propertyKey - The name of the property.
 * @returns The array literal expression or null.
 */
export function GetArrayLiteralFromObjectLiteral(
  objectLiteral: ObjectLiteralExpression,
  propertyKey: string,
): ArrayLiteralExpression | null {

  const arrayLiteralAssignment = objectLiteral.getProperty(propertyKey);

  if (!arrayLiteralAssignment) {
    return null;
  }

  if (!(arrayLiteralAssignment.isKind(SyntaxKind.PropertyAssignment))) {
    throw new Error('The imports property is not type of Property Assignment!');
  }

  const arrayLiteral = arrayLiteralAssignment.getInitializer();

  if (!arrayLiteral) {
    throw new Error('The imports property a not a initializer');
  }

  if (!(arrayLiteral.isKind(SyntaxKind.ArrayLiteralExpression))) {
    throw new Error('The imports property initializer is not an array');
  }

  return arrayLiteral;

}

/**
 * Gets or creates an array literal expression from a property assignment in an object literal.
 * If the property does not exist, it creates it with an empty array initializer.
 *
 * @param objectLiteral - The object literal expression.
 * @param propertyKey - The name of the property.
 * @returns The array literal expression.
 */
export function GetCoerceArrayLiteralFromObjectLiteral(
  objectLiteral: ObjectLiteralExpression,
  propertyKey: string,
): ArrayLiteralExpression {

  let arrayLiteralAssignment = objectLiteral.getProperty(propertyKey);

  if (!arrayLiteralAssignment) {
    arrayLiteralAssignment = objectLiteral.addPropertyAssignment({
      name: propertyKey,
      initializer: '[]',
    });
  }

  if (!(arrayLiteralAssignment.isKind(SyntaxKind.PropertyAssignment))) {
    throw new Error('The imports property is not type of Property Assignment!');
  }

  const arrayLiteral = arrayLiteralAssignment.getInitializer();

  if (!arrayLiteral) {
    throw new Error('The imports property a not a initializer');
  }

  if (!(arrayLiteral.isKind(SyntaxKind.ArrayLiteralExpression))) {
    throw new Error('The imports property initializer is not an array');
  }

  return arrayLiteral;

}
