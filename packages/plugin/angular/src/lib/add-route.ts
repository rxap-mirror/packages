import {
  CoerceArrayElement,
  FindArrayElementByObjectProperty,
} from '@rxap/ts-morph';
import {
  SourceFile,
  SyntaxKind,
} from 'ts-morph';
import {
  AngularRoute,
  BuildRouteObject,
} from './build-route-object';
import { FindParentRoute } from './find-parent-route';

export function AddRoute(sourceFile: SourceFile, route: AngularRoute, path?: string[]) {
  const routes = sourceFile.getVariableDeclaration('ROUTES');
  if (routes) {
    let initializer = routes.getInitializerIfKindOrThrow(SyntaxKind.ArrayLiteralExpression);
    if (path?.length) {
      initializer = FindParentRoute(initializer, path);
    }
    if (initializer) {
      CoerceArrayElement(
        initializer, BuildRouteObject(route), FindArrayElementByObjectProperty('path', route.path), () => 0);
    } else {
      console.warn('Initializer not found');
    }
  } else {
    console.warn('appRoutes variable not found');
  }
}
