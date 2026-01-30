import { CoerceVariableDeclaration } from '@rxap/ts-morph';
import {
  SourceFile,
  SyntaxKind,
} from 'ts-morph';
import 'colors';

export interface RemoveRouteOptions {
  /**
   * Path to remove (NOT IMPLEMENTED).
   */
  path?: string[];
  /**
   * Index of the route to remove.
   */
  index?: number;
  /**
   * Remove route that loads this remote module.
   */
  loadRemoteModule?: string | { name: string, entry?: string };
  /**
   * Remove route that uses this component.
   */
  component?: string;
  /**
   * The name of the routes variable.
   */
  name?: string;
}

/**
 * Removes a route from the routes array.
 * Can remove by index, component name, or remote module config.
 *
 * @param sourceFile - The source file containing the routes.
 * @param options - Options for removing the route (index, component, loadRemoteModule).
 */
export function RemoveRoute(sourceFile: SourceFile, options: RemoveRouteOptions) {

  const {
    path,
    component,
    index,
    loadRemoteModule,
    name = 'ROUTES'
  } = options;

  if (!path && !component && index === undefined && !loadRemoteModule) {
    throw new Error('You must provide a path or a component or a index or a loadRemoteModule to remove a route');
  }

  if (path) {
    throw new Error('Not implemented');
  }

  const variableDeclaration = CoerceVariableDeclaration(sourceFile, name, { initializer: '[]', type: 'Route[]' });

  const arrayLiteralExpression = variableDeclaration.getInitializerIfKindOrThrow(SyntaxKind.ArrayLiteralExpression);

  if (index !== undefined) {
    arrayLiteralExpression.removeElement(index);
    return;
  }

  const items = arrayLiteralExpression.getElements();

  for (const item of items) {
    if (item.isKind(SyntaxKind.ObjectLiteralExpression)) {
      const obj = item.asKindOrThrow(SyntaxKind.ObjectLiteralExpression);
      if (component) {
        const componentProperty = obj.getProperty('component');
        if (componentProperty) {
          const value = componentProperty.asKindOrThrow(SyntaxKind.PropertyAssignment).getInitializer()!;
          if (value.getText() === component) {
            arrayLiteralExpression.removeElement(item);
            return;
          }
        }
      }
      if (loadRemoteModule) {
        const loadChildrenProperty = obj.getProperty('loadChildren');
        if (loadChildrenProperty) {
          const value = loadChildrenProperty.asKindOrThrow(SyntaxKind.PropertyAssignment).getInitializer()!;
          let regex: RegExp;
          if (typeof loadRemoteModule === 'string') {
            regex = new RegExp(`^\\(\\) =>[\\s\\S]+loadRemoteModule\\('${loadRemoteModule}'`);
          } else {
            regex = new RegExp(`^\\(\\) =>[\\s\\S]+loadRemoteModule\\('${loadRemoteModule.name}',\\s*'${loadRemoteModule.entry ?? './routes'}'\\)`);
          }
          if (value.getText().match(regex)) {
            arrayLiteralExpression.removeElement(item);
            return;
          }
        }
      }
    }
  }

  console.log('No route found to remove'.yellow);


}
