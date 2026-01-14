import { chain } from '@angular-devkit/schematics';
import {
  CoerceControlComponentImports,
  NormalizedControl,
} from '@rxap/schematic-angular';
import {
  CoerceComponentRule,
  CoerceFormProviderRule,
  CoerceFormProvidersFile,
} from '@rxap/schematics-ts-morph';
import { ExecuteSchematic } from '@rxap/schematics-utilities';
import { CoerceComponentImport } from '@rxap/ts-morph';
import { NormalizedDataGridComponentOptions } from './normalize-data-grid-component-options';

export function formModeRule(normalizedOptions: NormalizedDataGridComponentOptions) {

  const {
    project,
    feature,
    directory,
    name,
    itemList,
    dataSourceClassName,
    dataSourceFileName,
    componentName,
    overwrite,
    backend,
    nestModule,
    controllerName,
    identifier,
  } = normalizedOptions;

  return chain([
    () => console.log('Coerce form definition ...'),
    ExecuteSchematic('form-definition', {
      name,
      project,
      directory,
      feature,
      controlList: itemList.map(item => item.formControl).filter(
        (formControl): formControl is NormalizedControl => !!formControl),
      overwrite,
      backend,
      nestModule,
      controllerName,
      identifier,
    }),
    () => console.log('Coerce form providers ...'),
    CoerceFormProvidersFile({
      name,
      project,
      feature,
      directory,
    }),
    () => console.log('Coerce form provider rule for the data grid data source refresh after submit ...'),
    CoerceFormProviderRule({
      project,
      feature,
      directory,
      providerObject: {
        provide: 'RXAP_FORM_SUBMIT_SUCCESSFUL_METHOD',
        useFactory: 'DataSourceRefreshToMethodAdapterFactory',
        deps: [ dataSourceClassName ],
      },
      importStructures: [
        {
          namedImports: [ 'RXAP_FORM_SUBMIT_SUCCESSFUL_METHOD' ],
          moduleSpecifier: '@rxap/forms',
        },
        {
          namedImports: [ 'DataSourceRefreshToMethodAdapterFactory' ],
          moduleSpecifier: '@rxap/data-source',
        },
        {
          namedImports: [ dataSourceClassName ],
          moduleSpecifier: `./${ dataSourceFileName }`,
        },
      ],
    }),
    () => console.log('Add Component imports ...'),
    CoerceComponentRule({
      project,
      feature,
      name: componentName,
      directory,
      overwrite,
      tsMorphTransform: (project, [ sourceFile ], [ classDeclaration ]) => {
        for (const item of itemList) {
          for (const angularImport of item.importList) {
            CoerceComponentImport(sourceFile, angularImport);
          }
          if (item.formControl) {
            CoerceControlComponentImports(classDeclaration, [ item.formControl ]);
          }
        }
      },
    }),
  ]);

}