import {
  CoerceComponentOptions,
  CoerceComponentRule,
} from '@rxap/schematics-ts-morph';
import {
  CoerceComponentImport,
  CoerceImports,
  CoercePropertyDeclaration,
} from '@rxap/ts-morph';
import {
  classify,
  dasherize,
  noop,
} from '@rxap/utilities';
import { Scope } from 'ts-morph';
import { NormalizedAngularOptions } from './angular-options';

export interface CoerceAccordionItemTableComponentOptions extends CoerceComponentOptions {
  accordionItem: NormalizedAngularOptions;
  tableComponentSuffix?: string;
}

export function CoerceAccordionItemTableComponentRule(options: CoerceAccordionItemTableComponentOptions) {

  const {
    accordionItem: { name },
    tsMorphTransform = noop,
    tableComponentSuffix = 'table',
  } = options;

  return CoerceComponentRule({
    ...options,
    tsMorphTransform: (project, [ sourceFile ], [ classDeclaration ]) => {

      const tableComponentName = `${classify(name!)}${classify(tableComponentSuffix)}Component`;
      const tableComponentImportPath = `./${dasherize(name!)}-${dasherize(tableComponentSuffix)}/${dasherize(name!)}-${dasherize(tableComponentSuffix)}.component`;

      CoerceComponentImport(classDeclaration, { name: tableComponentName, moduleSpecifier: tableComponentImportPath });

      CoercePropertyDeclaration(classDeclaration, 'parameters$', {
        scope: Scope.Public,
        isReadonly: true,
        initializer: `inject(ActivatedRoute).params.pipe(map(({ uuid }) => uuid), throwIfEmpty('Could not extract the uuid from route'), map((uuid) => ({ uuid })))`
      });
      CoerceImports(sourceFile, [
        {
          namedImports: [ 'inject' ],
          moduleSpecifier: '@angular/core'
        },
        {
          namedImports: [ 'ActivatedRoute' ],
          moduleSpecifier: '@angular/router'
        },
        {
          namedImports: [ 'map' ],
          moduleSpecifier: 'rxjs/operators'
        },
        {
          namedImports: [ 'throwIfEmpty' ],
          moduleSpecifier: '@rxap/rxjs'
        }
      ]);

      tsMorphTransform(project, [ sourceFile ], [ classDeclaration ], options);
    },
  });

}
