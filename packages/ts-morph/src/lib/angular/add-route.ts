import {
  ArrayLiteralExpression,
  SourceFile,
  SyntaxKind,
} from 'ts-morph';
import {
  CoerceArrayElement,
  FindArrayElementByObjectProperty,
} from '../coerce-array-element';
import {
  AngularRoute,
  BuildRouteObject,
} from './build-route-object';
import {
  FindParentRouteChildrenArrayByComponent,
  FindParentRouteChildrenArrayByPath,
} from './find-parent-route';
import 'colors';

/**
 * Factory function to create a default insertAt function for routes.
 * Determines the index to insert a new route based on the route path (e.g. wildcards go last).
 *
 * @param route - The route to insert.
 * @returns A function that takes an array literal expression and returns the index.
 */
export function DefaultInsertAtFactory(route: AngularRoute): (array: ArrayLiteralExpression) => number {
  return (array: ArrayLiteralExpression) => {
    const elementCount = array.getElements().length;
    if (route.path === '') {
      if (elementCount > 0) {
        const lastElement = array.getElements()[elementCount - 1];
        if (lastElement.isKind(SyntaxKind.ObjectLiteralExpression)) {
          if (lastElement.asKindOrThrow(SyntaxKind.ObjectLiteralExpression).getProperty('path')?.getText().match(/\*\*/)) {
            return elementCount - 2;
          }
        }
      }
      return array.getElements().length - 1;
    }
    let insertAt = 0;
    if (elementCount > 0) {
      // find the first object literal
      // this ensures that use of variables for route imports like STATUS_CHECK_ROUTE is always the first element
      for (const element of array.getElements()) {
        if (!element.isKind(SyntaxKind.ObjectLiteralExpression)) {
          insertAt++;
        } if (element.isKind(SyntaxKind.ObjectLiteralExpression)) {
          if (element.asKindOrThrow(SyntaxKind.ObjectLiteralExpression).getProperty('path')?.getText() === '') {
            insertAt++;
          } else {
            break;
          }
        } else {
          break;
        }
      }
    }
    return insertAt;
  };
}

export interface AddRouteOptions {
  /**
   * The route configuration to add.
   */
  route: AngularRoute;
  /**
   * The path to the parent route's children array where the new route should be added.
   * If not provided, it adds to the root routes array.
   */
  path?: string[];
  /**
   * The name of the component of the parent route to add the child route to.
   */
  component?: string;
  /**
   * The name of the routes variable (default: ROUTES).
   */
  name?: string,
  /**
   * A function to determine the index at which to insert the new route.
   */
  insertAt?: (array: ArrayLiteralExpression) => number;
}

/**
 * Adds a route to an Angular routes array.
 *
 * @param sourceFile - The source file containing the routes definition.
 * @param options - Options for adding the route.
 */
export function AddRoute(sourceFile: SourceFile, options: AddRouteOptions) {
  const { component, route, path, name = 'ROUTES', insertAt = DefaultInsertAtFactory(route) } = options;
  const routes = sourceFile.getVariableDeclaration(name);
  if (routes) {
    let initializer: ArrayLiteralExpression | null = routes.getInitializerIfKindOrThrow(SyntaxKind.ArrayLiteralExpression);
    if (path?.length) {
      initializer = FindParentRouteChildrenArrayByPath(initializer, path);
    }
    if (initializer) {
      if (component) {
        initializer = FindParentRouteChildrenArrayByComponent(initializer, component);
      }
      if (initializer) {
        CoerceArrayElement(
          initializer, BuildRouteObject(route), FindArrayElementByObjectProperty('path', route.path), insertAt);
      } else {
        console.log(`Could not find parent route by component for '${component}'`.yellow);
      }
    } else {
      console.log(`Could not find parent route by path for '${path}'`.yellow);
    }
  } else {
    console.log(`${name} variable not found`.red);
  }
}
