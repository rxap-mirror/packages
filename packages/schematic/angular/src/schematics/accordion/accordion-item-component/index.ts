import { strings } from '@angular-devkit/core';
import {
  chain,
  noop,
  Rule,
  SchematicsException,
} from '@angular-devkit/schematics';
import {
  AddComponentProvider,
  BuildNestControllerName,
  buildOperationId,
  CoerceClassConstructor,
  CoerceComponentRule,
  CoerceDataSourceClass,
  CoerceGetByIdOperation,
  CoerceImports,
  CoerceInterfaceRule,
  CoerceMethodClass,
  CoerceParameterDeclaration,
  CoerceStatements,
  OperationIdToClassImportPath,
  OperationIdToClassName,
  OperationIdToResponseClassImportPath,
  OperationIdToResponseClassName,
  TsMorphAngularProjectTransformRule,
} from '@rxap/schematics-ts-morph';
import {
  CoerceSuffix,
  dasherize,
  ExecuteSchematic,
} from '@rxap/schematics-utilities';
import {
  classify,
  Normalized,
} from '@rxap/utilities';
import { join } from 'path';
import {
  ClassDeclaration,
  Project,
  SourceFile,
} from 'ts-morph';
import {
  AccordionItemTypes,
  IsAccordionItemType,
} from '../../../lib/accordion-itme-types';
import {
  NormalizeAngularOptions,
  NormalizedAngularOptions,
  PrintAngularOptions,
} from '../../../lib/angular-options';
import { BackendTypes } from '../../../lib/backend-types';
import { AccordionItemComponentOptions } from './schema';

export type AccordionItemStandaloneComponentOptions = Omit<AccordionItemComponentOptions, 'type'>;

export interface NormalizedAccordionItemStandaloneComponentOptions
  extends Readonly<Normalized<AccordionItemStandaloneComponentOptions> & NormalizedAngularOptions> {
  componentName: string;
}

export function NormalizeAccordionItemStandaloneComponentOptions(
  options: Readonly<AccordionItemStandaloneComponentOptions>,
): NormalizedAccordionItemStandaloneComponentOptions {
  const normalizedAngularOptions = NormalizeAngularOptions(options);
  const { feature } = normalizedAngularOptions;
  const itemName = dasherize(options.itemName);
  const componentName = CoerceSuffix(itemName, '-panel');
  let accordionName = options.accordionName ?? feature;
  accordionName = CoerceSuffix(dasherize(accordionName), '-accordion');
  return Object.seal({
    ...options,
    ...normalizedAngularOptions,
    itemName: itemName,
    nestModule: accordionName,
    modifiers: options.modifiers ?? [],
    accordionName: accordionName,
    directory: join(accordionName, componentName),
    componentName,
  });
}

export type NormalizedAccordionItemComponentOptions = Readonly<NormalizedAccordionItemStandaloneComponentOptions & {
  type: string
}>;

export function NormalizeAccordionItemComponentOptions(
  options: Readonly<AccordionItemComponentOptions>,
): NormalizedAccordionItemComponentOptions {
  const type = options.type ?? 'panel';
  if (!IsAccordionItemType(type)) {
    throw new SchematicsException(`The type "${ type }" is not a valid accordion item type`);
  }
  return Object.seal({
    ...NormalizeAccordionItemStandaloneComponentOptions(options),
    type,
  });
}

function printAccordionItemComponentOptions(options: NormalizedAccordionItemComponentOptions) {
  PrintAngularOptions('accordion-item-component', options);
}

function componentRule(normalizedOptions: NormalizedAccordionItemComponentOptions) {
  const {
    componentName,
    project,
    feature,
    directory,
    shared,
    overwrite,
    itemName,
  } = normalizedOptions;

  const templateOptions = {
    ...strings,
    ...normalizedOptions,
    name: itemName,
    ...GetItemOptions(normalizedOptions),
  };

  return chain([
    () => console.log(`Coerce accordion item component ...`),
    CoerceComponentRule({
      name: componentName,
      project,
      feature,
      directory,
      shared,
      overwrite,
      template: {
        options: templateOptions,
      },
    }),
  ]);
}

interface ItemOptions {
  hasSharedModifier: boolean;
  hasCollectionModifier: boolean;
  hasEditModifier: boolean;
}

// region panel item

function panelItemOpenApiDataSourceRule(normalizedOptions: NormalizedAccordionItemComponentOptions) {

  const {
    itemName,
    nestModule,
    directory,
    project,
    feature,
    shared,
    scope,
  } = normalizedOptions;

  const controllerName = BuildNestControllerName({
    controllerName: itemName,
    nestModule,
  });
  const operationId = buildOperationId(
    normalizedOptions,
    'getById',
    controllerName,
  );

  return chain([
    () => console.log(`Coerce getById operation ...`),
    CoerceGetByIdOperation({
      controllerName: itemName,
      project,
      feature,
      shared,
      nestModule,
    }),
    () => console.log(`Coerce panel data source ...`),
    CoerceDataSourceClass({
      project,
      feature,
      shared,
      directory,
      name: CoerceSuffix(itemName, '-panel'),
      tsMorphTransform: (
        project: Project,
        sourceFile: SourceFile,
        classDeclaration: ClassDeclaration,
      ) => {
        classDeclaration.setExtends(
          `PanelAccordionDataSource<${ OperationIdToResponseClassName(
            operationId,
          ) }>`,
        );
        CoerceImports(sourceFile, {
          namedImports: [ OperationIdToResponseClassName(operationId) ],
          moduleSpecifier:
            OperationIdToResponseClassImportPath(operationId, scope),
        });
        CoerceImports(sourceFile, {
          namedImports: [ OperationIdToClassName(operationId) ],
          moduleSpecifier: OperationIdToClassImportPath(operationId, scope),
        });
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
          'method',
        ).set({
          type: OperationIdToClassName(operationId),
        });
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
  ]);

}

function panelItemLocalDataSourceRule(normalizedOptions: NormalizedAccordionItemComponentOptions) {

  const {
    itemName,
    directory,
    project,
    feature,
    shared,
    componentName: name,
    overwrite,
  } = normalizedOptions;

  return chain([
    () => console.log(`Coerce panel data source ...`),
    CoerceInterfaceRule({
      project,
      feature,
      shared,
      directory,
      name,
      structure: {
        isExported: true,
        properties: [
          {
            name: 'uuid',
            type: 'string',
          },
          {
            name: 'name',
            type: 'string',
          },
        ],
      },
    }, TsMorphAngularProjectTransformRule),
    CoerceMethodClass({
      project,
      feature,
      shared,
      directory,
      name,
      tsMorphTransform: (project, sourceFile) => {
        CoerceImports(sourceFile, [
          {
            namedImports: [ 'faker' ],
            moduleSpecifier: '@faker-js/faker',
          },
          {
            namedImports: [ classify(name) ],
            moduleSpecifier: `./${ dasherize(name) }`,
          },
        ]);
        return {
          returnType: classify(name),
          statements: [
            `console.log('parameters: ', parameters);`,
            'return { uuid: faker.string.uuid(), name: faker.commerce.productName() };',
          ],
        };
      },
    }),
    CoerceDataSourceClass({
      project,
      feature,
      shared,
      directory,
      name: CoerceSuffix(itemName, '-panel'),
      tsMorphTransform: (
        project: Project,
        sourceFile: SourceFile,
        classDeclaration: ClassDeclaration,
      ) => {
        classDeclaration.setExtends(`PanelAccordionDataSource<${ classify(name) }>`);
        CoerceImports(sourceFile, {
          namedImports: [ classify(name) ],
          moduleSpecifier: `./${ dasherize(name) }`,
        });
        CoerceImports(sourceFile, {
          namedImports: [ classify(name) + 'Method' ],
          moduleSpecifier: `./${ dasherize(name) }.method`,
        });
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
          'method',
        ).set({
          type: classify(name) + 'Method',
        });
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
    CoerceComponentRule({
      project,
      name,
      feature,
      directory,
      overwrite,
      tsMorphTransform: (project, [ sourceFile ]) => {
        AddComponentProvider(sourceFile, classify(name) + 'Method', [
          {
            moduleSpecifier: `./${ dasherize(name) }.method`,
            namedImports: [ classify(name) + 'Method' ],
          },
        ]);
      },
    }),
  ]);

}

function panelItemBackendRule(normalizedOptions: NormalizedAccordionItemComponentOptions) {

  const {
    backend,
  } = normalizedOptions;

  switch (backend) {

    case BackendTypes.NESTJS:
      return panelItemOpenApiDataSourceRule(normalizedOptions);
    case BackendTypes.LOCAL:
      return panelItemLocalDataSourceRule(normalizedOptions);

  }

  return noop();

}

function panelItemRule(normalizedOptions: NormalizedAccordionItemComponentOptions): Rule {

  const {
    itemName,
    directory,
    project,
    feature,
    shared,
    overwrite,
    componentName,
  } = normalizedOptions;

  const templateOptions = {
    ...strings,
    ...normalizedOptions,
    name: itemName,
  };

  return chain([
    CoerceComponentRule({
      name: componentName,
      project,
      feature,
      directory,
      shared,
      overwrite,
      template: {
        options: templateOptions,
      },
    }),
    panelItemBackendRule(normalizedOptions),
  ]);

}

// endregion

export function GetItemOptions(normalizedOptions: Pick<NormalizedAccordionItemComponentOptions, 'modifiers' | 'shared'>): ItemOptions {
  const {
    shared,
    modifiers,
  } = normalizedOptions;
  return {
    hasSharedModifier: shared || !!modifiers?.includes('shared'),
    hasCollectionModifier: !!modifiers?.includes('collection'),
    hasEditModifier: !!modifiers?.includes('edit'),
  };
}

function itemRule(normalizedOptions: NormalizedAccordionItemComponentOptions): Rule {

  const {
    type,
  } = normalizedOptions;

  const rules: Rule[] = [
    () => console.log(`Modify accordion item component for type '${ type }' ...`),
  ];

  switch (type) {
    case AccordionItemTypes.Panel:
      rules.push(panelItemRule(normalizedOptions));
      break;
    case AccordionItemTypes.Table:
      rules.push(ExecuteSchematic('accordion-item-table-component', normalizedOptions));
      break;
    case AccordionItemTypes.DataGrid:
      rules.push(ExecuteSchematic('accordion-item-data-grid-component', normalizedOptions));
      break;
    case AccordionItemTypes.TreeTable:
      rules.push(ExecuteSchematic('accordion-item-tree-table-component', normalizedOptions));
      break;
    default:
      throw new SchematicsException(`Invalid accordion item type '${ type }'!`);

  }

  return chain(rules);

}

export default function (options: AccordionItemComponentOptions) {
  const normalizedOptions = NormalizeAccordionItemComponentOptions(options);

  printAccordionItemComponentOptions(normalizedOptions);
  return () => {
    return chain([
      componentRule(normalizedOptions),
      itemRule(normalizedOptions),
    ]);
  };
}
