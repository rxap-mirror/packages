import {
  ArrayLiteralExpression,
  ObjectLiteralExpression,
  PropertyAssignment,
  StructureKind,
  SyntaxKind,
} from 'ts-morph';

export function GetRouteChildrenArray(e: ObjectLiteralExpression): ArrayLiteralExpression {
  const childrenProperty = e.getProperty('children') ?? e.addProperty({
    name: 'children',
    initializer: '[]',
    kind: StructureKind.PropertyAssignment,
  });
  if (childrenProperty instanceof PropertyAssignment) {
    return childrenProperty.getInitializerIfKindOrThrow(SyntaxKind.ArrayLiteralExpression);
  }
  throw new Error('Children property is not a PropertyAssignment');
}

export function FindParentRoute(ale: ArrayLiteralExpression, path: string[]): ObjectLiteralExpression | null {
  const fragment = path.pop();
  for (const e of ale.getElements()) {
    if (e instanceof ObjectLiteralExpression) {
      const pathProperty = e.getProperty('path');
      if (pathProperty && pathProperty instanceof PropertyAssignment) {
        const initializer = pathProperty.getInitializerIfKind(SyntaxKind.StringLiteral);
        if (initializer) {
          if (initializer.getLiteralText() === fragment) {
            if (path.length) {
              const children = GetRouteChildrenArray(e);
              // console.log('Continue search for parent route');
              return FindParentRoute(children, path);
            } else {
              // console.log('Found parent route');
              return e;
            }
          } else {
            // console.log('Path property does not match', initializer.getLiteralText(), fragment);
          }
        } else {
          // console.log('Path property has no StringLiteral initializer');
        }
      } else {
        // console.log('Element has no path property');
      }
    } else {
      // console.log('Element is not an ObjectLiteralExpression');
    }
  }
  return null;
}

export function FindParentRouteChildrenArray(ale: ArrayLiteralExpression, path: string[]) {
  const parent = FindParentRoute(ale, path);
  return parent ? GetRouteChildrenArray(parent) : null;
}
