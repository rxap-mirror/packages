import {
  CoerceArrayElement,
  FindParentRoute,
} from '@rxap/ts-morph';
import {
  PropertyAssignment,
  SourceFile,
  SyntaxKind,
} from 'ts-morph';

export interface CoerceRouteGuardOptions {
  routeArrayName?: string;
  type?: 'canActivate' | 'canActivateChild';
}

export function CoerceRouteGuard(sourceFile: SourceFile, path: string[], guard: string, options: CoerceRouteGuardOptions = {}): void {
  const { routeArrayName = 'ROUTES', type = 'canActivate' } = options;
  const routes = sourceFile.getVariableDeclaration(routeArrayName);
  if (routes) {
    const initializer = FindParentRoute(routes.getInitializerIfKindOrThrow(SyntaxKind.ArrayLiteralExpression), path);
    if (initializer) {
      const guardArray = initializer.getProperty(type) ?? initializer.addPropertyAssignment({
        name: type,
        initializer: '[]',
      });
      if (guardArray instanceof PropertyAssignment) {
        const guardArrayInitializer = guardArray.getInitializerIfKindOrThrow(SyntaxKind.ArrayLiteralExpression);
        CoerceArrayElement(guardArrayInitializer, guard);
      } else {
        throw new Error('Guard array is not a PropertyAssignment');
      }
    } else {
      throw new Error('Initializer not found');
    }
  } else {
    throw new Error(`${routeArrayName} variable not found`);
  }
}
