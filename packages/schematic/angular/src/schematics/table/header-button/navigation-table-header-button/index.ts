import {
  chain,
  Tree,
} from '@angular-devkit/schematics';
import {
  CoerceClassConstructor,
  CoerceImports,
  CoerceParameterDeclaration,
  CoerceTableHeaderButtonMethodRule,
} from '@rxap/schematics-ts-morph';
import { Normalized } from '@rxap/utilities';
import { Scope } from 'ts-morph';
import {
  NormalizedAngularOptions,
  PrintAngularOptions,
} from '../../../../lib/angular-options';
import { AssertTableComponentExists } from '../../../../lib/assert-table-component-exists';
import { NormalizedTableHeaderButton } from '../../../../lib/table-header-button';
import { NormalizeTableHeaderButtonOptions } from '../../table-header-button/index';
import { NavigationTableHeaderButtonOptions } from './schema';

export type NormalizedNavigationTableHeaderButtonOptions = Readonly<Normalized<NavigationTableHeaderButtonOptions> & NormalizedAngularOptions & NormalizedTableHeaderButton>

export function NormalizeNavigationTableHeaderButtonOptions(
  options: Readonly<NavigationTableHeaderButtonOptions>,
): NormalizedNavigationTableHeaderButtonOptions {
  const normalizedTableHeaderButtonOptions = NormalizeTableHeaderButtonOptions(options);
  return Object.seal({
    ...normalizedTableHeaderButtonOptions,
    route: options.route,
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
          const [ constructorDeclaration ] = CoerceClassConstructor(classDeclaration);
          CoerceParameterDeclaration(constructorDeclaration, 'route', {
            isReadonly: true,
            scope: Scope.Private,
            type: 'ActivatedRoute',
          });
          CoerceImports(sourceFile, [
            {
              moduleSpecifier: '@angular/router',
              namedImports: [ 'ActivatedRoute' ],
            },
          ]);
          return {
            statements: [ `return this.router.navigate('${ route }', { route: this.route })` ],
          };
        },
      }),
      () => console.groupEnd(),
    ]);
  };
}
