import { strings } from '@angular-devkit/core';
import { chain } from '@angular-devkit/schematics';
import {
  LoadCssClassHandlebarsTemplate,
  LoadMatFormFieldHandlebarsTemplate,
  LoadPipeHandlebarsTemplate,
} from '@rxap/schematic-angular';
import {
  AddComponentProvider,
  CoerceComponentRule,
} from '@rxap/schematics-ts-morph';
import { classify } from '@rxap/schematics-utilities';
import {
  CoerceComponentImport,
  CoerceComponentInput,
  CoerceImports,
  CoercePropertyDeclaration,
} from '@rxap/ts-morph';
import { Scope } from 'ts-morph';
import { NormalizedDataGridComponentOptions } from './normalize-data-grid-component-options';

export function componentRule(normalizedOptions: NormalizedDataGridComponentOptions) {

  const {
    project,
    feature,
    directory,
    componentName,
    overwrite,
    collection,
    name,
    inCard,
    isForm,
  } = normalizedOptions;

  const templateOptions = {
    ...strings,
    ...normalizedOptions,
  };

  return chain([
    () => console.log('Coerce data source component ...'),
    CoerceComponentRule({
      project,
      feature,
      name: componentName,
      directory,
      overwrite,
      template: {
        options: templateOptions,
      },
      handlebars: {
        partials: {
          matFormField: LoadMatFormFieldHandlebarsTemplate(),
          pipe: LoadPipeHandlebarsTemplate(),
          cssClass: LoadCssClassHandlebarsTemplate(),
        },
      },
      tsMorphTransform: (project, [ sourceFile ], [ classDeclaration ]) => {

        CoerceComponentImport(classDeclaration, {
          name: 'DataGridModule',
          moduleSpecifier: '@rxap/data-grid',
        });
        if (inCard) {
          CoerceComponentImport(classDeclaration, {
            name: 'MatCardModule',
            moduleSpecifier: '@angular/material/card',
          });
        }

        if (!collection) {
          const dataSourceClassName = `${ classify(name) }DataGridDataSource`;
          AddComponentProvider(sourceFile, dataSourceClassName);
          CoerceImports(sourceFile, {
            namedImports: [ dataSourceClassName ],
            moduleSpecifier: `./${ name }-data-grid.data-source`,
          });
          CoercePropertyDeclaration(classDeclaration, 'dataGridDataSource', {
            isReadonly: true,
            scope: Scope.Public,
            initializer: `inject(${ dataSourceClassName })`,
          });
          CoerceImports(sourceFile, {
            namedImports: [ 'inject' ],
            moduleSpecifier: '@angular/core',
          });
        } else {
          CoerceComponentInput(classDeclaration, 'data', 'any', { isRequired: true });
        }

        if (isForm) {
          CoerceComponentImport(classDeclaration, {
            name: 'RxapFormsModule',
            moduleSpecifier: '@rxap/forms',
          });
          CoerceComponentImport(classDeclaration, {
            name: 'ReactiveFormsModule',
            moduleSpecifier: '@angular/forms',
          });
          AddComponentProvider(sourceFile, 'FormProviders');
          AddComponentProvider(sourceFile, 'FormComponentProviders');
          CoerceImports(sourceFile, {
            namedImports: [ 'FormProviders', 'FormComponentProviders' ],
            moduleSpecifier: './form.providers',
          });
        }

      },
    }),
  ]);

}