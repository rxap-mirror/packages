import {
  SourceFile,
  Writers,
} from 'ts-morph';
import { CoerceImports } from '../coerce-imports';
import {
  CoerceRoutes,
  CoerceRoutesOptions,
} from './coerce-routes';

export type CoerceAppRoutesOptions = CoerceRoutesOptions;

/**
 * Coerces the application routes configuration.
 * Usually creates the root `appRoutes` or `ROUTES` constant.
 *
 * @param sourceFile - The source file containing the routes.
 * @param options - Options for the routes.
 * @returns The variable declaration for the routes.
 */
export function CoerceAppRoutes(sourceFile: SourceFile, options: CoerceAppRoutesOptions = {}) {

  const variableDeclaration = CoerceRoutes(sourceFile, {
    ...options,
    name: options.name ?? 'appRoutes',
    initializer: options.initializer ?? (w => {
      w.writeLine('[');
      w.write('STATUS_CHECK_ROUTE,');
      Writers.object({
        path: w => w.quote('**'),
        redirectTo: w => w.quote('')
      })(w);
      w.write(']');
    })
  });


  CoerceImports(sourceFile, [
    {
      namedImports: [ 'STATUS_CHECK_ROUTE' ],
      moduleSpecifier: '@rxap/ngx-status-check'
    },
  ]);

  return variableDeclaration;

}
