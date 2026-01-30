import {
  SourceFile,
  SyntaxKind,
  WriterFunction,
} from 'ts-morph';
import { CoerceDefaultExport } from '../coerce-default-export';
import { CoerceImports } from '../coerce-imports';
import { CoerceVariableDeclaration } from '../coerce-variable-declaration';
import {
  AddRoute,
  AddRouteOptions,
} from './add-route';

export interface CoerceRoutesOptions {
  /**
   * The name of the routes variable (default: ROUTES).
   */
  name?: string;
  /**
   * Initial value for the routes array if it needs to be created.
   */
  initializer?: string | WriterFunction;
  /**
   * List of routes to add to the array.
   */
  itemList?: Array<Omit<AddRouteOptions, 'name'>>
}

/**
 * Coerces the routes definition in a source file.
 * Creates or updates the ROUTES constant.
 *
 * @param sourceFile - The source file.
 * @param options - Options for the routes (name, initializer, itemList).
 * @returns The variable declaration for the routes.
 */
export function CoerceRoutes(sourceFile: SourceFile, options: CoerceRoutesOptions = {}) {

  const {
    name = 'ROUTES',
    initializer = `[{ path: '**', redirectTo: '' }]`
  } = options;

  // region remove a route declaration if the initializer is an empty array to ensure the initializer is set
  let variableDeclaration = CoerceVariableDeclaration(sourceFile, name, { initializer: '[]', type: 'Route[]' });
  if (variableDeclaration.getInitializerIfKindOrThrow(SyntaxKind.ArrayLiteralExpression).getElements().length === 0) {
    variableDeclaration.getVariableStatementOrThrow().remove();
  }
  // endregion
  variableDeclaration = CoerceVariableDeclaration(sourceFile, name, {
    initializer,
    type: 'Route[]'
  });
  CoerceDefaultExport(variableDeclaration);
  CoerceImports(sourceFile, [
    {
      namedImports: [ 'Route' ],
      moduleSpecifier: '@angular/router'
    },
  ]);
  if (options.itemList?.some(item => item.route.loadRemoteModule)) {
    CoerceImports(sourceFile, [
      {
        namedImports: [ 'loadRemoteModule' ],
        moduleSpecifier: '@nx/angular/mf'
      },
    ]);
  }

  for (const item of options.itemList ?? []) {
    AddRoute(sourceFile, { ...item, name });
  }

  return variableDeclaration;

}
