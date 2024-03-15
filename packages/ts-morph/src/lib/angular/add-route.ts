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
import { FindParentRoute } from './find-parent-route';

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
        } else {
          break;
        }
      }
    }
    return insertAt;
  };
}

export function AddRoute(sourceFile: SourceFile, route: AngularRoute, path?: string[], name = 'ROUTES', insertAt: (array: ArrayLiteralExpression) => number = DefaultInsertAtFactory(route)) {
  const routes = sourceFile.getVariableDeclaration(name);
  if (routes) {
    let initializer: ArrayLiteralExpression | null = routes.getInitializerIfKindOrThrow(SyntaxKind.ArrayLiteralExpression);
    if (path?.length) {
      initializer = FindParentRoute(initializer, path);
    }
    if (initializer) {
      CoerceArrayElement(
        initializer, BuildRouteObject(route), FindArrayElementByObjectProperty('path', route.path), insertAt);
    } else {
      console.warn('Initializer not found');
    }
  } else {
    console.warn(`${name} variable not found`);
  }
}
