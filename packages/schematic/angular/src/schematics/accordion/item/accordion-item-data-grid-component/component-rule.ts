import { strings } from '@angular-devkit/core';
import { chain } from '@angular-devkit/schematics';
import { GetItemOptions } from '@rxap/schematic-angular';
import {
  AddComponentProvider,
  CoerceComponentRule,
  CoerceImports,
} from '@rxap/schematics-ts-morph';
import { ExecuteSchematic } from '@rxap/schematics-utilities';
import {
  CoerceComponentImport,
  CoercePropertyDeclaration,
} from '@rxap/ts-morph';
import {
  classify,
  dasherize,
} from '@rxap/utilities';
import { Scope } from 'ts-morph';
import { NormalizedAccordionItemDataGridComponentOptions } from './normalize-accordion-item-data-grid-component-options';

export function componentRule(normalizedOptions: NormalizedAccordionItemDataGridComponentOptions) {
  const {
    name,
    nestModule,
    directory,
    project,
    feature,
    overwrite,
    componentName,
    shared,
    backend,
    dataGrid,
    controllerName,
    upstream,
    identifier,
    importList,
  } = normalizedOptions;
  const {
    hasSharedModifier,
    hasCollectionModifier,
    hasEditModifier,
  } = GetItemOptions(normalizedOptions);

  const templateOptions = {
    ...strings,
    ...normalizedOptions,
    ...GetItemOptions(normalizedOptions),
  };
  return chain([
    () => console.log(`Coerce data grid component ...`),
    ExecuteSchematic('data-grid-component', {
      ...dataGrid,
      project,
      feature,
      shared: hasSharedModifier,
      name: name,
      nestModule: hasSharedModifier ? undefined : nestModule,
      controllerName,
      directory: hasSharedModifier ? undefined : directory,
      collection: hasCollectionModifier || (
        dataGrid?.collection ?? false
      ),
      mode: hasEditModifier ? 'form' : (
        dataGrid?.mode ?? 'plain'
      ),
      backend: backend,
      overwrite,
      upstream,
      identifier,
    }),
    CoerceComponentRule({
      name: componentName,
      project,
      feature,
      directory,
      shared,
      overwrite,
      template: {
        url: `./files/${ hasCollectionModifier ? 'data-grid-collection' : 'data-grid' }`,
        options: templateOptions,
      },
      tsMorphTransform: (project, [ sourceFile ], [ classDeclaration ]) => {
        CoerceComponentImport(classDeclaration, {
          name: `${ classify(name) }DataGridComponent`,
          moduleSpecifier: `./${ dasherize(name) }-data-grid/${ dasherize(name) }-data-grid.component`,
        });
        for (const angularImport of importList) {
          CoerceComponentImport(classDeclaration, angularImport);
        }
        if (hasCollectionModifier) {
          CoerceComponentImport(classDeclaration, {
            name: 'DataSourceDirective',
            moduleSpecifier: '@rxap/data-source/directive',
          });
          CoerceComponentImport(classDeclaration, {
            name: 'DataSourceErrorComponent',
            moduleSpecifier: '@rxap/data-source',
          });
          CoerceComponentImport(classDeclaration, {
            name: 'MatProgressBarModule',
            moduleSpecifier: '@angular/material/progress-bar',
          });
          CoerceComponentImport(classDeclaration, {
            name: 'AsyncPipe',
            moduleSpecifier: '@angular/common',
          });
          CoerceComponentImport(classDeclaration, {
            name: 'NgIf',
            moduleSpecifier: '@angular/common',
          });
          CoerceComponentImport(classDeclaration, {
            name: 'NgFor',
            moduleSpecifier: '@angular/common',
          });
          const dataGridDataSourceName = `${ classify(name) }DataGridDataSource`;
          AddComponentProvider(sourceFile, dataGridDataSourceName);
          CoerceImports(sourceFile, {
            namedImports: [ dataGridDataSourceName ],
            moduleSpecifier: `./${ dasherize(name) }-data-grid/${ dasherize(name) }-data-grid.data-source`,
          });
          CoercePropertyDeclaration(classDeclaration, 'dataGridDataSource', {
            isReadonly: true,
            scope: Scope.Public,
            initializer: `inject(${ dataGridDataSourceName })`,
          });
          CoerceImports(sourceFile, {
            namedImports: [ 'inject' ],
            moduleSpecifier: '@angular/core',
          });
        }
      },
    }),
  ]);
}