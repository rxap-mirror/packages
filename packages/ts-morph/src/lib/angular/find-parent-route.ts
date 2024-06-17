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
  if (childrenProperty.isKind(SyntaxKind.PropertyAssignment)) {
    return childrenProperty.getInitializerIfKindOrThrow(SyntaxKind.ArrayLiteralExpression);
  }
  throw new Error('Children property is not a PropertyAssignment');
}

export function FindParentRouteByPath(ale: ArrayLiteralExpression, path: string[]): ObjectLiteralExpression | null {
  const fragment = path.pop();
  for (const e of ale.getElements()) {
    if (e.isKind(SyntaxKind.ObjectLiteralExpression)) {
      const pathProperty = e.getProperty('path');
      if (pathProperty?.isKind(SyntaxKind.PropertyAssignment)) {
        const initializer = pathProperty.getInitializerIfKind(SyntaxKind.StringLiteral);
        if (initializer?.getLiteralText() === fragment) {
          if (path.length) {
            const children = GetRouteChildrenArray(e);
            // console.log('Continue search for parent route');
            return FindParentRouteByPath(children, path);
          } else {
            // console.log('Found parent route');
            return e;
          }
        } else {
          // console.log('Path property does not match', initializer.getLiteralText(), fragment);
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

export function FindParentRouteByComponent(ale: ArrayLiteralExpression, component: string): ObjectLiteralExpression | null {
  for (const e of ale.getElements()) {
    if (e.isKind(SyntaxKind.ObjectLiteralExpression)) {
      const componentProperty = e.getProperty('component');
      if (componentProperty?.isKind(SyntaxKind.PropertyAssignment)) {
        const initializer = componentProperty.getInitializer();
        if (initializer?.getText() === component) {
          return e;
        }
      }
    }
  }
  return null;
}

export function FindParentRouteChildrenArrayByPath(ale: ArrayLiteralExpression, path: string[]) {
  const parent = FindParentRouteByPath(ale, path);
  return parent ? GetRouteChildrenArray(parent) : null;
}

export function FindParentRouteChildrenArrayByComponent(ale: ArrayLiteralExpression, component: string) {
  const parent = FindParentRouteByComponent(ale, component);
  return parent ? GetRouteChildrenArray(parent) : null;
}
