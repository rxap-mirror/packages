import {
  ArrayLiteralExpression,
  Expression,
  ObjectLiteralExpression,
  PropertyAssignment,
  SyntaxKind,
  WriterFunction,
} from 'ts-morph';

/**
 * Finds an element in an array by a property value of an object literal.
 *
 * @param property - The property name to check.
 * @param value - The value to match.
 * @returns A function that takes an expression and returns true if it matches.
 */
export function FindArrayElementByObjectProperty(property: string, value: string) {
  return (e: Expression) => {
    if (e.isKind(SyntaxKind.ObjectLiteralExpression)) {
      const p = e.getProperty(property);
      if (p && p.isKind(SyntaxKind.PropertyAssignment)) {
        const i = p.getInitializerIfKind(SyntaxKind.StringLiteral);
        if (i) {
          return i.getLiteralText() === value;
        }
      }
    }
    return false;
  };
}

/**
 * Default function to find an existing element in an array.
 * Checks if the text of the element matches the given string.
 *
 * @param element - The string representation of the element to find.
 * @returns A function that takes an expression and returns true if it matches.
 */
export function DefaultFindExistingElement(element: string) {
  return (e: Expression) => e.getText().trim() === element;
}

/**
 * Coerces an element in an array literal expression.
 * If the element exists, it returns it. Otherwise, it adds it.
 *
 * @param array - The array literal expression.
 * @param element - The element to add (string or WriterFunction).
 * @param findExisting - A function to check if the element already exists. Defaults to comparing text.
 * @param insertAt - A function to determine the index to insert the element at.
 * @returns The existing or added expression.
 */
export function CoerceArrayElement(
  array: ArrayLiteralExpression,
  element: string | WriterFunction,
  findExisting?: (e: Expression) => boolean,
  insertAt?: (array: ArrayLiteralExpression) => number,
): Expression {

  if (!findExisting) {
    if (typeof element === 'string') {
      findExisting = DefaultFindExistingElement(element);
    } else {
      throw new Error('The findExisting function is required or the element must be a string!');
    }
  }

  for (const e of array.getElements()) {
    if (findExisting(e)) {
      return e;
    }
  }

  if (insertAt) {
    const index = insertAt(array);
    if (index < 0) {
      console.warn('The insertAt function returned a negative index - normalizing to 0');
      return array.insertElement(0, element);
    }
    return array.insertElement(index, element);
  }

  return array.addElement(element);

}
