import {
  ArrayLiteralExpression,
  ObjectLiteralExpression,
  PropertyAssignment,
  SyntaxKind,
} from 'ts-morph';

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
