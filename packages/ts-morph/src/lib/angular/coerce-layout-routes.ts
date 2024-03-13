import {
  AddRoute,
  AngularRoute,
  CoerceDefaultExport,
  CoerceImports,
} from '@rxap/ts-morph';
import {
  SourceFile,
  Writers,
} from 'ts-morph';
import { CoerceVariableDeclaration } from '../coerce-variable-declaration';

export interface CoerceLayoutRoutesOptions {
  itemList?: Array<{ route: AngularRoute, path?: string[] }>
}

export function CoerceLayoutRoutes(sourceFile: SourceFile, options: CoerceLayoutRoutesOptions = {}) {

  const variableDeclaration = CoerceVariableDeclaration(sourceFile, 'ROUTES', {
    initializer: w => {
      w.writeLine('[');
      w.indent(() => {
        Writers.object({
          path: w => w.quote(''),
          component: 'LayoutComponent',
          canActivateChild: '[StatusCheckGuard]',
          children: w => {
            w.writeLine('[');
            w.indent(() => {
              Writers.object({
                path: w => w.quote('**'),
                redirectTo: w => w.quote('')
              })(w);
            });
            w.write(']');
          },
          providers: w => {
            w.write('[');
            w.indent(() => {
              w.write('APP_NAVIGATION_PROVIDER');
              w.write(',');
              w.newLine();
              w.write('NavigationService');
            });
            w.write(']');
          }
        })(w);
        w.write(',');
      });

      Writers.object({
        path: w => w.quote('**'),
        redirectTo: w => w.quote('')
      })(w);
      w.newLine();
      w.write(']');
    },
    type: 'Route[]'
  });
  CoerceDefaultExport(variableDeclaration);
  CoerceImports(sourceFile, [
    {
      namedImports: [ 'LayoutComponent', 'NavigationService' ],
      moduleSpecifier: '@rxap/layout'
    },
    {
      namedImports: [ 'StatusCheckGuard' ],
      moduleSpecifier: '@rxap/ngx-status-check'
    },
    {
      namedImports: [ 'Route' ],
      moduleSpecifier: '@angular/router'
    },
    {
      namedImports: [ 'APP_NAVIGATION_PROVIDER' ],
      moduleSpecifier: './app.navigation'
    }
  ]);

  for (const { route, path } of options.itemList ?? []) {
    AddRoute(sourceFile, route, path);
  }

}
