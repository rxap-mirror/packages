import {
  chain,
  Tree,
} from '@angular-devkit/schematics';
import { CoerceTableHeaderButtonMethodRule } from '@rxap/schematics-ts-morph';
import {
  CoerceDependencyInjection,
  CoerceImports,
  Module,
} from '@rxap/ts-morph';
import { Scope } from 'ts-morph';
import { PrintAngularOptions } from '../../../../lib/print-angular-options';
import { AssertTableComponentExists } from '../../../../lib/rules/assert-table-component-exists';
import {
  NormalizedNavigationTableHeaderButtonOptions,
  NormalizeNavigationTableHeaderButtonOptions,
} from './normalize-navigation-table-header-button-options';
import { NavigationTableHeaderButtonOptions } from './schema';

function printOptions(options: NormalizedNavigationTableHeaderButtonOptions) {
  PrintAngularOptions('navigation-table-header-button', options);
}

export default function (options: NavigationTableHeaderButtonOptions) {
  const normalizedOptions = NormalizeNavigationTableHeaderButtonOptions(options);
  const {
    refresh,
    confirm,
    tooltip,
    errorMessage,
    successMessage,
    tableName,
    project,
    feature,
    shared,
    directory,
    overwrite,
    route,
    relativeTo,
  } = normalizedOptions;

  printOptions(normalizedOptions);

  return (host: Tree) => {

    AssertTableComponentExists(host, normalizedOptions);

    return chain([
      () => console.group('\x1b[32m[@rxap/schematics-angular:navigation-table-header-button]\x1b[0m'),
      () => console.log('Coerce table header button method ...'),
      CoerceTableHeaderButtonMethodRule({
        project,
        feature,
        shared,
        directory,
        overwrite,
        tableName,
        refresh,
        confirm,
        tooltip,
        errorMessage,
        successMessage,
        tsMorphTransform: (project, sourceFile, classDeclaration) => {
          if (relativeTo) {
            CoerceDependencyInjection(sourceFile, {
              injectionToken: 'ActivatedRoute',
              parameterName: 'route',
              scope: Scope.Private,
              module: Module.ANGULAR,
            });
            CoerceImports(sourceFile, [
              {
                moduleSpecifier: '@angular/router',
                namedImports: [ 'ActivatedRoute' ],
              },
            ]);
          }
          CoerceDependencyInjection(sourceFile, {
            injectionToken: 'Router',
            parameterName: 'router',
            scope: Scope.Private,
            module: Module.ANGULAR,
          });
          CoerceImports(sourceFile, [
            {
              moduleSpecifier: '@angular/router',
              namedImports: [ 'Router' ],
            },
          ]);
          if (relativeTo) {
            return {
              statements: [ `return this.router.navigate(['${ route }'], { relativeTo: this.route })` ],
            };
          } else {
            return {
              statements: [ `return this.router.navigate(['${ route }'])` ],
            };
          }
        },
      }),
      () => console.groupEnd(),
      () => console.log('\x1b[32m[/@rxap/schematics-angular:navigation-table-header-button]\x1b[0m'),
    ]);
  };
}
