import { AccordionItemDataGridComponentOptions } from './schema';
import {
  chain,
  noop,
  SchematicsException,
} from '@angular-devkit/schematics';
import {
  GetItemOptions,
  NormalizeAccordionItemStandaloneComponentOptions,
  NormalizedAccordionItemStandaloneComponentOptions,
} from '../../accordion-item-component';
import {
  CoerceClassConstructor,
  CoerceComponentRule,
  CoerceDataSourceClass,
  CoerceFormComponentProviderRule,
  CoerceGetDataGridOperation,
  CoerceImports,
  CoerceParameterDeclaration,
  CoerceStatements,
  CoerceSubmitDataGridOperation,
} from '@rxap/schematics-ts-morph';
import {
  NormalizedAngularOptions,
  PrintAngularOptions,
} from '../../../../lib/angular-options';
import { BackendTypes } from '../../../../lib/backend-types';
import { Normalized } from '@rxap/utilities';
import {
  DataGridMode,
  NormalizeDataGridOptions,
  NormalizedDataGridOptions,
} from '../../../../lib/data-grid-options';
import { join } from 'path';
import {
  CoerceSuffix,
  ExecuteSchematic,
} from '@rxap/schematics-utilities';
import {
  ClassDeclaration,
  Project,
  SourceFile,
} from 'ts-morph';
import { strings } from '@angular-devkit/core';

export interface NormalizedAccordionItemDataGridComponentOptions
  extends Omit<Readonly<Normalized<AccordionItemDataGridComponentOptions> & NormalizedAngularOptions & NormalizedAccordionItemStandaloneComponentOptions>, 'dataGrid'> {
  dataGrid: NormalizedDataGridOptions;
}

export function NormalizeAccordionItemDataGridComponentOptions(
  options: Readonly<AccordionItemDataGridComponentOptions>,
): Readonly<NormalizedAccordionItemDataGridComponentOptions> {
  const normalizedAccordionItemComponentOptions = NormalizeAccordionItemStandaloneComponentOptions(options);
  return Object.seal({
    ...normalizedAccordionItemComponentOptions,
    dataGrid: NormalizeDataGridOptions(options.dataGrid),
  });
}

function printOptions(options: NormalizedAccordionItemDataGridComponentOptions) {
  PrintAngularOptions('accordion-item-data-grid-component', options);
  if (options.dataGrid.itemList.length) {
    console.log(`=== items: \x1b[34m${ options.dataGrid.itemList.map((item) => item.name).join(', ') }\x1b[0m`);
  } else {
    console.log('=== items: \x1b[31mempty\x1b[0m');
  }
}


function componentRule(normalizedOptions: NormalizedAccordionItemDataGridComponentOptions) {
  const {
    itemName,
    nestModule,
    directory,
    project,
    feature,
    overwrite,
    componentName,
    shared,
    backend,
    dataGrid,
  } = normalizedOptions;
  const {
    hasSharedModifier,
    hasCollectionModifier,
    hasEditModifier,
  } = GetItemOptions(normalizedOptions);

  const templateOptions = {
    ...strings,
    ...normalizedOptions,
    name: itemName,
    ...GetItemOptions(normalizedOptions),
  };
  return chain([
    () => console.log(`Coerce data grid component ...`),
    ExecuteSchematic('data-grid-component', {
      project,
      feature,
      shared: hasSharedModifier,
      name: itemName,
      nestModule: hasSharedModifier ? undefined : nestModule,
      nestController: itemName,
      directory: hasSharedModifier ? undefined : directory,
      itemList: dataGrid?.itemList ?? [],
      collection: hasCollectionModifier || (dataGrid?.collection ?? false),
      mode: hasEditModifier ? 'form' : (dataGrid?.mode ?? 'plain'),
      backend: backend,
      overwrite,
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
    }),
  ]);
}

function nestjsBackendRule(
  normalizedOptions: NormalizedAccordionItemDataGridComponentOptions,
) {

  const {
    itemName,
    nestModule,
    directory,
    project,
    feature,
    shared,
  } = normalizedOptions;
  const {
    hasSharedModifier,
    hasCollectionModifier,
    hasEditModifier,
  } = GetItemOptions(normalizedOptions);

  const rules = ([
    () => console.log(`Modify the data source class ...`),
    CoerceDataSourceClass({
      project,
      feature,
      shared: hasSharedModifier,
      directory: join(
        directory ?? '',
        CoerceSuffix(itemName, '-data-grid'),
      ),
      name: CoerceSuffix(itemName, '-data-grid'),
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
            'AccordionDataSource',
            'ACCORDION_DATA_SOURCE',
          ],
          moduleSpecifier: '@rxap/data-source/accordion',
        });
        CoerceImports(sourceFile, {
          moduleSpecifier: '@angular/router',
          namedImports: [ 'ActivatedRoute' ],
        });
        CoerceImports(sourceFile, {
          moduleSpecifier: '@angular/core',
          namedImports: [ 'Inject' ],
        });
        const [ constructorDeclaration ] =
          CoerceClassConstructor(classDeclaration);
        CoerceParameterDeclaration(
          constructorDeclaration,
          'route',
        ).set({
          type: 'ActivatedRoute',
        });
        CoerceParameterDeclaration(
          constructorDeclaration,
          'accordionDataSource',
        ).set({
          type: 'AccordionDataSource',
          decorators: [
            {
              name: 'Inject',
              arguments: [ 'ACCORDION_DATA_SOURCE' ],
            },
          ],
        });
        CoerceStatements(constructorDeclaration, [
          `super(method, route, accordionDataSource);`,
        ]);
      },
    }),
    () => console.log(`Modify the get data grid operation ...`),
    CoerceGetDataGridOperation({
      controllerName: itemName,
      project,
      feature,
      shared,
      nestModule: hasSharedModifier ? undefined : nestModule,
      collection: hasCollectionModifier,
      paramList: [
        {
          name: 'uuid',
          type: 'string',
          fromParent: !hasSharedModifier,
        },
      ],
      skipCoerce: true,
    }),
  ]);

  if (hasEditModifier) {
    rules.push(
      () => console.log(`Modify the submit data grid operation ...`),
      CoerceSubmitDataGridOperation({
        controllerName: itemName,
        nestModule: hasSharedModifier ? undefined : nestModule,
        project,
        feature,
        shared,
        collection: hasCollectionModifier,
        paramList: [
          {
            name: 'uuid',
            type: 'string',
            fromParent: !hasSharedModifier,
          },
        ],
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
    itemName,
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
        CoerceSuffix(itemName, '-data-grid'),
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

  const { dataGrid: { mode } } = normalizedOptions;

  switch (mode) {

    case DataGridMode.Form:
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
