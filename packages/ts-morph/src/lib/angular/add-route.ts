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

export function AddRoute(sourceFile: SourceFile, route: AngularRoute, path?: string[], name = 'ROUTES', insertAt = 0) {
  const routes = sourceFile.getVariableDeclaration(name);
  if (routes) {
    let initializer: ArrayLiteralExpression | null = routes.getInitializerIfKindOrThrow(SyntaxKind.ArrayLiteralExpression);
    if (path?.length) {
      initializer = FindParentRoute(initializer, path);
    }
    if (initializer) {
      CoerceArrayElement(
        initializer, BuildRouteObject(route), FindArrayElementByObjectProperty('path', route.path), () => insertAt);
    } else {
      console.warn('Initializer not found');
    }
  } else {
    console.warn(`${name} variable not found`);
  }
}
