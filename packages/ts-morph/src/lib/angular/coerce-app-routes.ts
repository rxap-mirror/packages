import {
  AddRoute,
  AngularRoute,
  CoerceDefaultExport,
  CoerceImports,
  CoerceVariableDeclaration,
} from '@rxap/ts-morph';
import {
  SourceFile,
  Writers,
} from 'ts-morph';

export interface CoerceAppRoutesOptions {
  itemList?: Array<{ route: AngularRoute, path?: string[] }>
}

export function CoerceAppRoutes(sourceFile: SourceFile, options: CoerceAppRoutesOptions = {}) {

  const variableDeclaration = CoerceVariableDeclaration(sourceFile, 'appRoutes', {
    initializer: w => {
      w.writeLine('[');
      w.write('STATUS_CHECK_ROUTE,');
      Writers.object({
        path: w => w.quote('**'),
        redirectTo: w => w.quote()
      })(w);
      w.write('];');
    },
    type: 'Route[]'
  });
  CoerceImports(sourceFile, [
    {
      namedImports: [ 'STATUS_CHECK_ROUTE' ],
      moduleSpecifier: '@rxap/ngx-status-check'
    },
    {
      namedImports: [ 'Route' ],
      moduleSpecifier: '@angular/router'
    }
  ]);
  CoerceDefaultExport(variableDeclaration);

  for (const { route, path } of options.itemList ?? []) {
    AddRoute(sourceFile, route, path);
  }

}
