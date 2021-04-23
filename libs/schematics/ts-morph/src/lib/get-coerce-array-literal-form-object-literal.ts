import {
  ObjectLiteralExpression,
  PropertyAssignment,
  ArrayLiteralExpression
} from 'ts-morph';

export function GetCoerceArrayLiteralFromObjectLiteral(objectLiteral: ObjectLiteralExpression, propertyKey: string): ArrayLiteralExpression {

  let arrayLiteralAssignment = objectLiteral.getProperty(propertyKey);

  if (!arrayLiteralAssignment) {
    arrayLiteralAssignment = objectLiteral.addPropertyAssignment({
      name:        propertyKey,
      initializer: '[]'
    });
  }

  if (!(arrayLiteralAssignment instanceof PropertyAssignment)) {
    throw new Error('The imports property is not type of Property Assignment!');
  }

  const arrayLiteral = arrayLiteralAssignment.getInitializer();

  if (!arrayLiteral) {
    throw new Error('The imports property a not a initializer');
  }

  if (!(arrayLiteral instanceof ArrayLiteralExpression)) {
    throw new Error('The imports property initializer is not an array');
  }

  return arrayLiteral;

}
