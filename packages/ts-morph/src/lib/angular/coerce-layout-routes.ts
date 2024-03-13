import {
  SourceFile,
  Writers,
} from 'ts-morph';
import { CoerceImports } from '../coerce-imports';
import {
  CoerceRoutes,
  CoerceRoutesOptions,
} from './coerce-routes';

export type CoerceLayoutRoutesOptions = CoerceRoutesOptions;

export function CoerceLayoutRoutes(sourceFile: SourceFile, options: CoerceLayoutRoutesOptions = {}) {

  const variableDeclaration = CoerceRoutes(sourceFile, {
    ...options,
    initializer: options.initializer ?? (w => {
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
    })
  });

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
      namedImports: [ 'APP_NAVIGATION_PROVIDER' ],
      moduleSpecifier: './app.navigation'
    }
  ]);

  return variableDeclaration;

}
