import {
  SourceFile,
  SyntaxKind,
  WriterFunction,
} from 'ts-morph';
import { CoerceDefaultExport } from '../coerce-default-export';
import { CoerceImports } from '../coerce-imports';
import { CoerceVariableDeclaration } from '../coerce-variable-declaration';
import { AddRoute } from './add-route';
import { AngularRoute } from './build-route-object';

export interface CoerceRoutesOptions {
  name?: string;
  initializer?: string | WriterFunction;
  itemList?: Array<{ route: AngularRoute, path?: string[] }>
}

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

  for (const { route, path } of options.itemList ?? []) {
    AddRoute(sourceFile, route, path);
  }

  return variableDeclaration;

}
