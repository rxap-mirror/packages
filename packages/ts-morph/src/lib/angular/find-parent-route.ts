import {
  ArrayLiteralExpression,
  ObjectLiteralExpression,
  PropertyAssignment,
  StructureKind,
  SyntaxKind,
} from 'ts-morph';

export function FindParentRoute(ale: ArrayLiteralExpression, path: string[]): ArrayLiteralExpression | null {
  for (const e of ale.getElements()) {
    if (e instanceof ObjectLiteralExpression) {
      const pathProperty = e.getProperty('path');
      if (pathProperty && pathProperty instanceof PropertyAssignment) {
        const initializer = pathProperty.getInitializerIfKind(SyntaxKind.StringLiteral);
        if (initializer) {
          const fragment = path.pop();
          if (initializer.getLiteralText() === fragment) {
            const childrenProperty = e.getProperty('children') ?? e.addProperty({
              name: 'children',
              initializer: '[]',
              kind: StructureKind.PropertyAssignment,
            });
            if (childrenProperty instanceof PropertyAssignment) {
              const children = childrenProperty.getInitializerIfKindOrThrow(SyntaxKind.ArrayLiteralExpression);
              if (path.length) {
                // console.log('Continue search for parent route');
                return FindParentRoute(children, path);
              } else {
                // console.log('Found parent route');
                return children;
              }
            } else {
              // console.log('Children property is not a PropertyAssignment');
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
