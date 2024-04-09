import { CoerceVariableDeclaration } from '@rxap/ts-morph';
import {
  SourceFile,
  SyntaxKind,
} from 'ts-morph';
import 'colors';

export interface RemoveRouteOptions {
  path?: string[];
  component?: string;
  name?: string;
}

export function RemoveRoute(sourceFile: SourceFile, options: RemoveRouteOptions) {

  const {
    path,
    component,
    name = 'ROUTES'
  } = options;

  if (!path && !component) {
    throw new Error('You must provide a path or a component to remove a route');
  }

  if (path) {
    throw new Error('Not implemented');
  }

  const variableDeclaration = CoerceVariableDeclaration(sourceFile, name, { initializer: '[]', type: 'Route[]' });

  const arrayLiteralExpression = variableDeclaration.getInitializerIfKindOrThrow(SyntaxKind.ArrayLiteralExpression);
  const items = arrayLiteralExpression.getElements();

  for (const item of items) {
    if (component) {
      if (item.isKind(SyntaxKind.ObjectLiteralExpression)) {
        const obj = item.asKindOrThrow(SyntaxKind.ObjectLiteralExpression);
        const componentProperty = obj.getProperty('component');
        if (componentProperty) {
          const value = componentProperty.asKindOrThrow(SyntaxKind.PropertyAssignment).getInitializer()!;
          if (value.getText() === component) {
            arrayLiteralExpression.removeElement(item);
            return;
          }
        }
      }
    }
  }

  console.log('No route found to remove'.yellow);


}
