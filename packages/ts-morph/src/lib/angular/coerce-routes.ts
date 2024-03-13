import {
  AddRoute,
  AngularRoute,
  CoerceDefaultExport,
  CoerceImports,
} from '@rxap/ts-morph';
import {
  SourceFile,
  SyntaxKind,
  WriterFunction,
} from 'ts-morph';
import { CoerceVariableDeclaration } from '../coerce-variable-declaration';

export interface CoerceRoutesOptions {
  name?: string;
  initializer?: string | WriterFunction;
  itemList?: Array<{ route: AngularRoute, path?: string[] }>
}

export function CoerceRoutes(sourceFile: SourceFile, options: CoerceRoutesOptions = {}) {

  const {
    name = 'ROUTES',
    initializer = '[]'
  } = options;

  let variableDeclaration = CoerceVariableDeclaration(sourceFile, name, {});
  if (variableDeclaration.getInitializerIfKindOrThrow(SyntaxKind.ArrayLiteralExpression).getElements().length === 0) {
    variableDeclaration.getVariableStatementOrThrow().remove();
  }
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
