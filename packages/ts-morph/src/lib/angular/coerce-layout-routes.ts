import {
  SourceFile,
  WriterFunction,
  Writers,
} from 'ts-morph';
import { CoerceImports } from '../coerce-imports';
import {
  CoerceRoutes,
  CoerceRoutesOptions,
} from './coerce-routes';

export interface CoerceLayoutRoutesOptions extends CoerceRoutesOptions {
  component?: 'LayoutComponent' | 'MinimalLayoutComponent';
  withNavigation?: boolean;
  withDefaultHeader?: boolean;
  withStatusCheckGuard?: boolean;
}

export function CoerceLayoutRoutes(sourceFile: SourceFile, options: CoerceLayoutRoutesOptions = {}) {

  const {
    component = 'LayoutComponent',
    withNavigation = true,
    withDefaultHeader = true,
    withStatusCheckGuard = true,
  } = options;

  const obj: Record<string, string | WriterFunction> = {
    path: w => w.quote(''),
    component,
    children: w => {
      w.write('[');
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
        w.write('provideLayout(');
        if (withNavigation) {
          w.newLine();
          w.indent(() => {
            w.write('withNavigationConfig(APP_NAVIGATION)');
            w.write(',');
          });
        }
        if (withDefaultHeader) {
          w.newLine();
          w.indent(() => {
            w.write('widthDefaultHeaderComponent()');
            w.write(',');
          });
        }
        if (withDefaultHeader || withNavigation) {
          w.newLine();
        }
        w.write(')');
      });
      w.write(']');
    }
  };

  if (withStatusCheckGuard) {
    obj['canActivateChild'] = '[StatusCheckGuard]';
    CoerceImports(sourceFile, [
      {
        namedImports: [ 'StatusCheckGuard' ],
        moduleSpecifier: '@rxap/ngx-status-check'
      }
    ]);
  }

  if (withNavigation) {
    CoerceImports(sourceFile, [
      {
        namedImports: [ 'APP_NAVIGATION' ],
        moduleSpecifier: './app.navigation'
      },
      {
        namedImports: [ 'withNavigationConfig' ],
        moduleSpecifier: '@rxap/layout'
      }
    ]);
  }

  if (withDefaultHeader) {
    CoerceImports(sourceFile, {
      namedImports: [ 'widthDefaultHeaderComponent' ],
      moduleSpecifier: '@rxap/layout'
    });
  }

  CoerceImports(sourceFile, {
    namedImports: [ component ],
    moduleSpecifier: '@rxap/layout'
  });

  const variableDeclaration = CoerceRoutes(sourceFile, {
    ...options,
    initializer: options.initializer ?? (w => {
      w.writeLine('[');
      w.indent(() => {
        Writers.object(obj)(w);
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

  return variableDeclaration;

}
