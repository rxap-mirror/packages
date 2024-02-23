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
  CoercePropertyDeclaration,
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
  CoerceClassProperty,
  CoerceComponentImport,
} from '@rxap/ts-morph';
import {
  classify,
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
  NormalizeAccordionItem,
  NormalizeBaseAccordionItem,
  NormalizedBaseAccordionItem,
} from '../../../lib/accordion-item';
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
  extends Omit<Readonly<Normalized<AccordionItemStandaloneComponentOptions> & NormalizedAngularOptions>, 'importList' | 'name'>, NormalizedBaseAccordionItem {
  componentName: string;
}

export function NormalizeAccordionItemStandaloneComponentOptions(
  options: Readonly<AccordionItemStandaloneComponentOptions>,
): NormalizedAccordionItemStandaloneComponentOptions {
  const normalizedAngularOptions = NormalizeAngularOptions(options);
  const { feature } = normalizedAngularOptions;
  const name = dasherize(options.name);
  const componentName = CoerceSuffix(name, '-panel');
  let accordionName = options.accordionName ?? feature;
  accordionName = CoerceSuffix(dasherize(accordionName), '-accordion');
  return Object.freeze({
    ...normalizedAngularOptions,
    ...NormalizeAccordionItem({
      type: AccordionItemTypes.Panel,
      ...options,
    }),
    name,
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
  return Object.freeze({
    ...NormalizeAccordionItemStandaloneComponentOptions(options),
    type,
  });
}

function printAccordionItemComponentOptions(options: NormalizedAccordionItemComponentOptions) {
  PrintAngularOptions('accordion-item-component', options);
}

interface ItemOptions {
  hasSharedModifier: boolean;
  hasCollectionModifier: boolean;
  hasEditModifier: boolean;
}

// region panel item

function panelItemOpenApiDataSourceRule(normalizedOptions: NormalizedAccordionItemComponentOptions) {

  const {
    name,
    nestModule,
    directory,
    project,
    feature,
    shared,
    scope,
  } = normalizedOptions;

  const controllerName = BuildNestControllerName({
    controllerName: name,
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
      controllerName: name,
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
      name: CoerceSuffix(name, '-panel'),
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
          moduleSpecifier: '@rxap/data-source/accordion',
          namedImports: [ 'PanelAccordionDataSource' ],
        });
        CoerceImports(sourceFile, {
          moduleSpecifier: '@angular/core',
          namedImports: [ 'inject' ],
        });
        CoerceClassProperty(classDeclaration, 'method', {
          scope: Scope.Protected,
          hasOverrideKeyword: true,
          initializer: `inject(${ OperationIdToClassName(operationId) })`,
          isReadonly: true,
        });
      },
    }),
  ]);

}

function panelItemLocalDataSourceRule(normalizedOptions: NormalizedAccordionItemComponentOptions) {

  const {
    name,
    directory,
    project,
    feature,
    shared,
    componentName,
    overwrite,
  } = normalizedOptions;

  return chain([
    () => console.log(`Coerce panel data source ...`),
    CoerceInterfaceRule({
      project,
      feature,
      shared,
      directory,
      name: componentName,
      structure: {
        isExported: true,
        properties: [],
      },
    }, TsMorphAngularProjectTransformRule),
    CoerceMethodClass({
      project,
      feature,
      shared,
      directory,
      name: componentName,
      tsMorphTransform: (project, sourceFile) => {
        CoerceImports(sourceFile, [
          {
            namedImports: [ 'faker' ],
            moduleSpecifier: '@faker-js/faker',
          },
          {
            namedImports: [ classify(componentName) ],
            moduleSpecifier: `./${ dasherize(componentName) }`,
          },
        ]);
        return {
          returnType: classify(componentName),
          statements: [
            `console.log('parameters: ', parameters);`,
            'return {} as any;',
          ],
        };
      },
    }),
    CoerceDataSourceClass({
      project,
      feature,
      shared,
      directory,
      name: CoerceSuffix(name, '-panel'),
      tsMorphTransform: (
        project: Project,
        sourceFile: SourceFile,
        classDeclaration: ClassDeclaration,
      ) => {
        classDeclaration.setExtends(`PanelAccordionDataSource<${ classify(componentName) }>`);
        CoerceImports(sourceFile, {
          namedImports: [ classify(componentName) ],
          moduleSpecifier: `./${ dasherize(componentName) }`,
        });
        CoerceImports(sourceFile, {
          namedImports: [ classify(componentName) + 'Method' ],
          moduleSpecifier: `./${ dasherize(componentName) }.method`,
        });
        CoerceImports(sourceFile, {
          moduleSpecifier: '@angular/core',
          namedImports: [ 'Inject' ],
        });
        CoerceImports(sourceFile, {
          moduleSpecifier: '@angular/core',
          namedImports: [ 'inject' ],
        });
        CoerceImports(sourceFile, {
          moduleSpecifier: '@rxap/data-source/accordion',
          namedImports: [ 'PanelAccordionDataSource' ],
        });
        CoerceClassProperty(classDeclaration, 'method', {
          scope: Scope.Protected,
          hasOverrideKeyword: true,
          initializer: `inject(${ classify(componentName) + 'Method' })`,
          isReadonly: true,
        });
      },
    }),
    CoerceComponentRule({
      project,
      name: componentName,
      feature,
      directory,
      overwrite,
      tsMorphTransform: (project, [ sourceFile ]) => {
        AddComponentProvider(sourceFile, classify(componentName) + 'Method', [
          {
            moduleSpecifier: `./${ dasherize(componentName) }.method`,
            namedImports: [ classify(componentName) + 'Method' ],
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
    name,
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
      tsMorphTransform: (project, [ sourceFile ], [ classDeclaration ]) => {
        CoerceComponentImport(classDeclaration, { name: 'DataSourceDirective', moduleSpecifier: '@rxap/data-source/directive' });
        CoerceComponentImport(classDeclaration, { name: 'MatProgressBarModule', moduleSpecifier: '@angular/material/progress-bar' });
        CoerceComponentImport(classDeclaration, { name: 'DataSourceErrorComponent', moduleSpecifier: '@rxap/data-source' });
        CoerceComponentImport(classDeclaration, { name: 'AsyncPipe', moduleSpecifier: '@angular/common' });
        CoerceComponentImport(classDeclaration, { name: 'JsonPipe', moduleSpecifier: '@angular/common' });

        const pipeDataSourceName = `${ classify(name) }PanelDataSource`;

        AddComponentProvider(sourceFile, pipeDataSourceName);
        CoerceImports(sourceFile, {
          moduleSpecifier: `./${ dasherize(name) }-panel.data-source`,
          namedImports: [ pipeDataSourceName ],
        });
        CoerceImports(sourceFile, {
          namedImports: ['inject'],
          moduleSpecifier: '@angular/core'
        });
        CoercePropertyDeclaration(classDeclaration, 'panelDataSource', {
          isReadonly: true,
          initializer: `inject(${pipeDataSourceName})`,
          scope: Scope.Public,
        });
      }
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
    case AccordionItemTypes.Switch:
      rules.push(ExecuteSchematic('accordion-item-switch-component', normalizedOptions));
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
      // componentRule(normalizedOptions),
      itemRule(normalizedOptions),
    ]);
  };
}
