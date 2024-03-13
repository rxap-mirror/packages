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
