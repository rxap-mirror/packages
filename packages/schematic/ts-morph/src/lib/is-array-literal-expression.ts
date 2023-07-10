import {
  ArrayLiteralExpression,
  Expression,
} from 'ts-morph';

export function IsArrayLiteralExpression(expression?: Expression): expression is ArrayLiteralExpression {
  return expression instanceof ArrayLiteralExpression;
}

export function AssertArrayLiteralExpression(
  expression: Expression | undefined,
  variableDeclarationName: string,
): asserts expression is ArrayLiteralExpression {
  if (!IsArrayLiteralExpression(expression)) {
    throw new Error(`The variable declaration '${ variableDeclarationName }' is not an array!`);
  }
}
