import {
  ArrayLiteralExpression,
  ObjectLiteralExpression,
  PropertyAssignment,
  StructureKind,
  SyntaxKind,
} from 'ts-morph';

/**
 * Gets the `children` array literal expression from a route object.
 * If the `children` property does not exist, it adds it.
 *
 * @param e - The route object literal expression.
 * @returns The children array literal expression.
 */
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

/**
 * Finds a route object in an array of routes by traversing a path.
 *
 * @param ale - The routes array literal expression.
 * @param path - The path segments to traverse.
 * @returns The found route object or null.
 */
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

/**
 * Finds a route object in an array of routes by its component property.
 *
 * @param ale - The routes array literal expression.
 * @param component - The name of the component to search for.
 * @returns The found route object or null.
 */
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

/**
 * Finds the `children` array of a route found by path.
 *
 * @param ale - The routes array literal expression.
 * @param path - The path segments.
 * @returns The children array literal expression or null.
 */
export function FindParentRouteChildrenArrayByPath(ale: ArrayLiteralExpression, path: string[]) {
  const parent = FindParentRouteByPath(ale, path);
  return parent ? GetRouteChildrenArray(parent) : null;
}

/**
 * Finds the `children` array of a route found by component.
 *
 * @param ale - The routes array literal expression.
 * @param component - The component name.
 * @returns The children array literal expression or null.
 */
export function FindParentRouteChildrenArrayByComponent(ale: ArrayLiteralExpression, component: string) {
  const parent = FindParentRouteByComponent(ale, component);
  return parent ? GetRouteChildrenArray(parent) : null;
}
