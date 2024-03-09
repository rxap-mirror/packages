import { strings } from '@angular-devkit/core';
import {
  chain,
  noop,
  SchematicsException,
} from '@angular-devkit/schematics';
import {
  AddComponentProvider,
  CoerceComponentRule,
  CoerceDataSourceClass,
  CoerceFormComponentProviderRule,
  CoerceGetDataGridOperation,
  CoerceImports,
  CoerceSubmitDataGridOperation,
} from '@rxap/schematics-ts-morph';
import {
  CoerceSuffix,
  ExecuteSchematic,
} from '@rxap/schematics-utilities';
import {
  CoerceComponentImport,
  CoercePropertyDeclaration,
  OperationParameter,
} from '@rxap/ts-morph';
import {
  classify,
  dasherize,
  Normalized,
} from '@rxap/utilities';
import { join } from 'path';
import {
  ClassDeclaration,
  Project,
  Scope,
  SourceFile,
} from 'ts-morph';
import {
  NormalizeDataGridAccordionItem,
  NormalizedDataGridAccordionItem,
} from '../../../../lib/accordion-item';
import { AccordionItemKinds } from '../../../../lib/accordion-itme-kinds';
import { NormalizedAngularOptions } from '../../../../lib/angular-options';
import { BackendTypes } from '../../../../lib/backend-types';
import {
  GetItemOptions,
  NormalizeAccordionItemStandaloneComponentOptions,
  NormalizedAccordionItemStandaloneComponentOptions,
  printAccordionItemComponentOptions,
} from '../../accordion-item-component';
import { AccordionItemDataGridComponentOptions } from './schema';

export interface NormalizedAccordionItemDataGridComponentOptions
  extends Omit<Readonly<Normalized<AccordionItemDataGridComponentOptions> & NormalizedAngularOptions & NormalizedAccordionItemStandaloneComponentOptions>, 'dataGrid' | 'importList' | 'propertyList'>, Omit<NormalizedDataGridAccordionItem, 'kind'> {
}

export function NormalizeAccordionItemDataGridComponentOptions(
  options: Readonly<AccordionItemDataGridComponentOptions>,
): Readonly<NormalizedAccordionItemDataGridComponentOptions> {
  const normalizedAccordionItemComponentOptions = NormalizeAccordionItemStandaloneComponentOptions(options);
  return Object.freeze({
    ...normalizedAccordionItemComponentOptions,
    ...NormalizeDataGridAccordionItem({
      ...options,
      kind: AccordionItemKinds.DataGrid,
    }),
  });
}

function printOptions(options: NormalizedAccordionItemDataGridComponentOptions) {
  printAccordionItemComponentOptions(options, 'accordion-item-data-grid-component');
  if (options.dataGrid.itemList.length) {
    console.log(`===== Data Grid Items: \x1b[34m${ options.dataGrid.itemList.map((item) => item.name).join(', ') }\x1b[0m`);
  } else {
    console.log('===== Data Grid Items: \x1b[31mempty\x1b[0m');
  }
}


function componentRule(normalizedOptions: NormalizedAccordionItemDataGridComponentOptions) {
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
      collection: hasCollectionModifier || (dataGrid?.collection ?? false),
      mode: hasEditModifier ? 'form' : (dataGrid?.mode ?? 'plain'),
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
      tsMorphTransform: (project, [sourceFile], [classDeclaration]) => {
        CoerceComponentImport(classDeclaration, { name: `${classify(name)}DataGridComponent`, moduleSpecifier: `./${dasherize(name)}-data-grid/${dasherize(name)}-data-grid.component` });
        if (hasCollectionModifier) {
          CoerceComponentImport(classDeclaration, { name: 'DataSourceDirective', moduleSpecifier: '@rxap/data-source/directive' });
          CoerceComponentImport(classDeclaration, { name: 'DataSourceErrorComponent', moduleSpecifier: '@rxap/data-source' });
          CoerceComponentImport(classDeclaration, { name: 'MatProgressBarModule', moduleSpecifier: '@angular/material/progress-bar' });
          CoerceComponentImport(classDeclaration, { name: 'AsyncPipe', moduleSpecifier: '@angular/common' });
          CoerceComponentImport(classDeclaration, { name: 'NgIf', moduleSpecifier: '@angular/common' });
          CoerceComponentImport(classDeclaration, { name: 'NgFor', moduleSpecifier: '@angular/common' });
          const dataGridDataSourceName = `${classify(name)}DataGridDataSource`;
          AddComponentProvider(sourceFile, dataGridDataSourceName);
          CoerceImports(sourceFile, {
            namedImports: [ dataGridDataSourceName ],
            moduleSpecifier: `./${dasherize(name)}-data-grid/${dasherize(name)}-data-grid.data-source`,
          });
          CoercePropertyDeclaration(classDeclaration, 'dataGridDataSource', {
            isReadonly: true,
            scope: Scope.Public,
            initializer: `inject(${dataGridDataSourceName})`,
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

function nestjsBackendRule(
  normalizedOptions: NormalizedAccordionItemDataGridComponentOptions,
) {

  const {
    name,
    directory,
    project,
    feature,
    shared,
    identifier,
    upstream,
    controllerName,
    overwrite,
    nestModule,
  } = normalizedOptions;
  const {
    hasSharedModifier,
    hasCollectionModifier,
    hasEditModifier,
  } = GetItemOptions(normalizedOptions);

  const paramList: OperationParameter[] = [];

  if (identifier) {
    paramList.push({
      ...identifier.property,
      fromParent: !hasSharedModifier,
    });
  }

  const rules = ([
    () => console.log(`Modify the data source class ...`),
    CoerceDataSourceClass({
      project,
      feature,
      shared: hasSharedModifier,
      directory: join(
        directory ?? '',
        CoerceSuffix(name, '-data-grid'),
      ),
      name: CoerceSuffix(name, '-data-grid'),
      tsMorphTransform: (
        project: Project,
        sourceFile: SourceFile,
        classDeclaration: ClassDeclaration,
      ) => {
        const current = classDeclaration.getExtends()?.getText();
        const match = current?.match(/<([^>]+)>/);
        if (!match) {
          throw new SchematicsException(
            `Could not extract the generic type from '${ current }'!`,
          );
        }
        classDeclaration.setExtends(
          `PanelAccordionDataSource<${ match[1] }>`,
        );
        CoerceImports(sourceFile, {
          namedImports: [
            'PanelAccordionDataSource',
          ],
          moduleSpecifier: '@rxap/data-source/accordion',
        });

        sourceFile.getImportDeclaration('@rxap/data-grid')?.remove();
      },
    }),
    () => console.log(`Modify the get data grid operation ...`),
    CoerceGetDataGridOperation({
      controllerName,
      project,
      feature,
      nestModule,
      shared,
      overwrite,
      collection: hasCollectionModifier,
      paramList,
      upstream,
      idProperty: identifier?.property,
      skipCoerce: true,
    }),
  ]);

  if (hasEditModifier) {
    rules.push(
      () => console.log(`Modify the submit data grid operation ...`),
      CoerceSubmitDataGridOperation({
        controllerName,
        project,
        feature,
        shared,
        nestModule,
        overwrite,
        collection: hasCollectionModifier,
        paramList,
        idProperty: identifier?.property,
        skipCoerce: true,
      }),
    );
  }

  return chain(rules);

}

function backendRule(normalizedOptions: NormalizedAccordionItemDataGridComponentOptions) {

  const { backend } = normalizedOptions;

  switch (backend) {

    case BackendTypes.NESTJS:
      return nestjsBackendRule(normalizedOptions);

  }

  return noop();

}

function dataGridFormModeRule(normalizedOptions: NormalizedAccordionItemDataGridComponentOptions) {

  const {
    name,
    directory,
    project,
    feature,
  } = normalizedOptions;

  return chain([
    () => console.log(`Extend the form component providers ...`),
    CoerceFormComponentProviderRule({
      project,
      feature,
      directory: join(
        directory ?? '',
        CoerceSuffix(name, '-data-grid'),
      ),
      providerObject: {
        provide: 'RXAP_FORM_CONTEXT',
        useFactory: 'FormContextFromActivatedRouteFactory',
        deps: [ 'ActivatedRoute' ],
      },
      importStructures: [
        {
          namedImports: [ 'FormContextFromActivatedRouteFactory' ],
          moduleSpecifier: '@rxap/form-system',
        },
        {
          namedImports: [ 'ActivatedRoute' ],
          moduleSpecifier: '@angular/router',
        },
        {
          namedImports: [ 'RXAP_FORM_CONTEXT' ],
          moduleSpecifier: '@rxap/forms',
        },
      ],
    }),
  ]);

}

function dataGridModeRule(normalizedOptions: NormalizedAccordionItemDataGridComponentOptions) {

  const { dataGrid: { mode, isForm } } = normalizedOptions;

  if (isForm) {
    return dataGridFormModeRule(normalizedOptions);
  }

  return noop();

}

export default function (options: AccordionItemDataGridComponentOptions) {
  const normalizedOptions = NormalizeAccordionItemDataGridComponentOptions(options);
  printOptions(normalizedOptions);
  return () => {
    return chain([
      componentRule(normalizedOptions),
      backendRule(normalizedOptions),
      dataGridModeRule(normalizedOptions),
    ]);
  };
}
