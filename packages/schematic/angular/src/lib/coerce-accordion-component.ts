import {
  AddComponentProvider,
  CoerceComponentOptions,
  CoerceComponentRule,
  CoercePropertyDeclaration,
} from '@rxap/schematics-ts-morph';
import {
  CoerceComponentImport,
  CoerceDefaultClassExport,
  CoerceImports,
} from '@rxap/ts-morph';
import {
  classify,
  dasherize,
  noop,
} from '@rxap/utilities';
import { Scope } from 'ts-morph';
import { NormalizedAccordionComponentOptions } from '../schematics/accordion/accordion-component';

export interface CoerceAccordionComponentOptions extends CoerceComponentOptions {
  accordion: NormalizedAccordionComponentOptions;
}

export function CoerceAccordionComponentRule(options: CoerceAccordionComponentOptions) {

  const {
    accordion: {
      componentName,
      itemList,
      persistent,
      withPermission,
      header,
    },
    tsMorphTransform = noop,
  } = options;

  return CoerceComponentRule({
    ...options,
    tsMorphTransform: (project, [ sourceFile ], [ classDeclaration ]) => {

      // region angular imports
      CoerceComponentImport(classDeclaration, { name: 'DataSourceErrorComponent', moduleSpecifier: '@rxap/data-source' });
      CoerceComponentImport(classDeclaration, { name: 'DataSourceDirective', moduleSpecifier: '@rxap/data-source/directive' });
      CoerceComponentImport(classDeclaration, { name: 'MatProgressBarModule', moduleSpecifier: '@angular/material/progress-bar' });
      CoerceComponentImport(classDeclaration, { name: 'MatExpansionModule', moduleSpecifier: '@angular/material/expansion' });

      if (header) {
        CoerceComponentImport(classDeclaration, { name: 'MatDividerModule', moduleSpecifier: '@angular/material/divider' });
        CoerceComponentImport(classDeclaration, { name: 'MatDividerModule', moduleSpecifier: '@angular/material/divider' });
        for (const angularImport of header.importList) {
          CoerceComponentImport(classDeclaration, angularImport);
        }
      }
      if (withPermission) {
        CoerceComponentImport(classDeclaration, { name: 'IfHasPermissionDirective', moduleSpecifier: '@rxap/authorization' });
      }
      if (persistent) {
        CoerceComponentImport(classDeclaration, { name: 'PersistentAccordionDirective', moduleSpecifier: '@rxap/material-directives/expansion' });
      }
      for (const item of itemList) {
        for (const angularImport of item.importList) {
          CoerceComponentImport(classDeclaration, angularImport);
        }
      }
      // endregion

      const accordionDataSourceName = `${classify(componentName!)}DataSource`;

      // region angular providers
      CoerceImports(sourceFile, {
        namedImports: ['ACCORDION_DATA_SOURCE'],
        moduleSpecifier: '@rxap/data-source/accordion'
      });
      AddComponentProvider(sourceFile, accordionDataSourceName);
      AddComponentProvider(sourceFile, {
        provide: 'ACCORDION_DATA_SOURCE',
        useExisting: accordionDataSourceName
      });
      // endregion

      CoercePropertyDeclaration(classDeclaration, 'accordionDataSource', {
        initializer: `inject(${accordionDataSourceName})`,
        isReadonly: true,
        scope: Scope.Public,
      });
      CoerceImports(sourceFile, {
        namedImports: ['inject'],
        moduleSpecifier: '@angular/core'
      });
      CoerceImports(sourceFile, {
        namedImports: [accordionDataSourceName],
        moduleSpecifier: `./${dasherize(componentName!)}.data-source`
      });

      if (!!options.feature && (!options.directory || !options.directory.includes('/'))) {
        CoerceDefaultClassExport(classDeclaration, true);
      }

      tsMorphTransform(project, [ sourceFile ], [ classDeclaration ], options);
    },
  });

}
