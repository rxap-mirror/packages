import {
  ArrayLiteralExpression,
  Expression,
  ObjectLiteralExpression,
  PropertyAssignment,
  SyntaxKind,
  WriterFunction,
} from 'ts-morph';

export function FindArrayElementByObjectProperty(property: string, value: string) {
  return (e: Expression) => {
    if (e instanceof ObjectLiteralExpression) {
      const p = e.getProperty(property);
      if (p && p instanceof PropertyAssignment) {
        const i = p.getInitializerIfKind(SyntaxKind.StringLiteral);
        if (i) {
          return i.getLiteralText() === value;
        }
      }
    }
    return false;
  };
}

export function DefaultFindExistingElement(element: string) {
  return (e: Expression) => e.getText().trim() === element;
}

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
