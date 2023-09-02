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

export function CoerceArrayElement(
  array: ArrayLiteralExpression,
  findExisting: (e: Expression) => boolean,
  element: string | WriterFunction,
): Expression {

  for (const e of array.getElements()) {
    if (findExisting(e)) {
      return e;
    }
  }

  return array.addElement(element);

}
