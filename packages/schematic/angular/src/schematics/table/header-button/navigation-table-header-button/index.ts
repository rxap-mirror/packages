import {
  chain,
  Tree,
} from '@angular-devkit/schematics';
import { CoerceTableHeaderButtonMethodRule } from '@rxap/schematics-ts-morph';
import {
  CoerceSuffix,
  dasherize,
} from '@rxap/schematics-utilities';
import {
  CoerceDependencyInjection,
  CoerceImports,
  Module,
} from '@rxap/ts-morph';
import { Normalized } from '@rxap/utilities';
import { Scope } from 'ts-morph';
import {
  AngularOptions,
  NormalizeAngularOptions,
  NormalizedAngularOptions,

} from '../../../../lib/angular-options';
import { AssertTableComponentExists } from '../../../../lib/assert-table-component-exists';
import { PrintAngularOptions } from '../../../../lib/print-angular-options';
import {
  NavigationHeaderButton,
  NormalizedNavigationHeaderButton,
  NormalizeNavigationHeaderButton,
} from '../../../../lib/table/header-button/navigation-header-button';
import { NavigationTableHeaderButtonOptions } from './schema';

export type NormalizedNavigationTableHeaderButtonOptions = Readonly<Normalized<Omit<NavigationTableHeaderButtonOptions, keyof AngularOptions | keyof NavigationHeaderButton>> & NormalizedAngularOptions & NormalizedNavigationHeaderButton>

export function NormalizeNavigationTableHeaderButtonOptions(
  options: Readonly<NavigationTableHeaderButtonOptions>,
): NormalizedNavigationTableHeaderButtonOptions {
  const normalizedAngularOptions = NormalizeAngularOptions(options);
  const normalizedTableHeaderButton = NormalizeNavigationHeaderButton(options, options.tableName);
  if (!normalizedTableHeaderButton) {
    throw new Error('FATAL: should never happen');
  }
  const tableName = CoerceSuffix(dasherize(options.tableName), '-table');
  return Object.freeze({
    ...normalizedAngularOptions,
    ...normalizedTableHeaderButton,
    tableName,
  });
}

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
