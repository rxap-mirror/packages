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
  CoerceComponentRule,
  CoerceDataSourceClass,
  CoerceGetByIdOperation,
  CoerceGetOperation,
  CoerceImports,
  CoerceInterfaceRule,
  CoerceMethodClass,
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
  CoercePropertyDeclaration,
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
  NormalizedBaseAccordionItem,
} from '../../../lib/accordion-item';
import {
  AccordionItemKinds,
  IsAccordionItemKind,
} from '../../../lib/accordion-itme-kinds';
import {
  NormalizeAngularOptions,
  NormalizedAngularOptions,
  PrintAngularOptions,
} from '../../../lib/angular-options';
import { BackendTypes } from '../../../lib/backend-types';
import { AccordionItemComponentOptions } from './schema';

export type AccordionItemStandaloneComponentOptions = Omit<AccordionItemComponentOptions, 'kind'>;

export interface NormalizedAccordionItemStandaloneComponentOptions
  extends Omit<Readonly<Normalized<AccordionItemStandaloneComponentOptions> & NormalizedAngularOptions>, 'importList' | 'name' | 'identifier' | 'upstream' | 'propertyList'>, NormalizedBaseAccordionItem {
  componentName: string;
  controllerName: string;
}

export function NormalizeAccordionItemStandaloneComponentOptions(
  options: Readonly<AccordionItemStandaloneComponentOptions>,
): NormalizedAccordionItemStandaloneComponentOptions {
  const normalizedAngularOptions = NormalizeAngularOptions(options);
  const { feature, controllerName, shared } = normalizedAngularOptions;
  const name = dasherize(options.name);

  const componentName = CoerceSuffix(name, '-panel');
  let accordionName = options.accordionName ?? feature;
  accordionName = CoerceSuffix(dasherize(accordionName), '-accordion');
  const nestModule = options.nestModule ?? accordionName;
  const normalizedAccordionItem = NormalizeAccordionItem({
    kind: AccordionItemKinds.Default,
    ...options,
  });
  const { modifiers } = normalizedAccordionItem;
  const { hasSharedModifier } = GetItemOptions({ modifiers, shared });
  return Object.freeze({
    ...normalizedAngularOptions,
    ...normalizedAccordionItem,
    controllerName: controllerName ?? BuildNestControllerName({
      controllerName: name,
      // nestModule: hasSharedModifier ? undefined : nestModule,
    }),
    name,
    nestModule,
    modifiers: options.modifiers ?? [],
    accordionName: accordionName,
    directory: join(accordionName, componentName),
    componentName,
  });
}

export type NormalizedAccordionItemComponentOptions = Readonly<NormalizedAccordionItemStandaloneComponentOptions & {
  kind: string
}>;

export function NormalizeAccordionItemComponentOptions(
  options: Readonly<AccordionItemComponentOptions>,
): NormalizedAccordionItemComponentOptions {
  const kind = options.kind ?? AccordionItemKinds.Default;
  if (!IsAccordionItemKind(kind)) {
    throw new SchematicsException(`The type "${ kind }" is not a valid accordion item type`);
  }
  return Object.freeze({
    ...NormalizeAccordionItemStandaloneComponentOptions(options),
    kind,
  });
}

export function printAccordionItemComponentOptions(options: NormalizedAccordionItemComponentOptions, schematicName = 'accordion-item-component') {
  PrintAngularOptions(schematicName, options);
  console.log('===== Kind:'.blue, options.kind);
  console.log('===== Identifier:'.blue, options.identifier?.property?.name ?? 'NONE'.red);
}

interface ItemOptions {
  hasSharedModifier: boolean;
  hasCollectionModifier: boolean;
  hasEditModifier: boolean;
}

// region panel item

function buildGetOperationId(normalizedOptions: NormalizedAccordionItemComponentOptions) {
  const {
    identifier,
  } = normalizedOptions;
  return buildOperationId(
    normalizedOptions,
    identifier ? 'getById' : 'get',
    BuildNestControllerName(normalizedOptions)
  );
}

function panelItemOpenApiDataSourceRule(normalizedOptions: NormalizedAccordionItemComponentOptions) {

  const {
    name,
    directory,
    project,
    feature,
    shared,
    scope,
    controllerName,
    identifier,
    upstream,
    nestModule,
    propertyList,
  } = normalizedOptions;

  const operationId = buildGetOperationId(normalizedOptions);

  const rules: Rule[] = [];

  if (identifier) {
    rules.push(
      () => console.log(`Coerce getById operation ...`),
      CoerceGetByIdOperation({
        controllerName,
        project,
        feature,
        shared,
        idProperty: identifier.property,
        upstream,
        nestModule,
        propertyList
      }),
    );
  } else {
    rules.push(
      () => console.log(`Coerce get operation ...`),
      CoerceGetOperation({
        controllerName,
        project,
        feature,
        shared,
        upstream,
        nestModule,
        propertyList
      }),
    );
  }

  rules.push(
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
  );

  return chain(rules);

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

export function GetItemOptions(normalizedOptions: { modifiers: string[], shared: boolean }): ItemOptions {
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
    kind,
  } = normalizedOptions;

  const rules: Rule[] = [
    () => console.log(`Modify accordion item component for type '${ kind }' ...`),
  ];

  switch (kind) {
    case AccordionItemKinds.Default:
      rules.push(panelItemRule(normalizedOptions));
      break;
    case AccordionItemKinds.Table:
      rules.push(ExecuteSchematic('accordion-item-table-component', normalizedOptions));
      break;
    case AccordionItemKinds.DataGrid:
      rules.push(ExecuteSchematic('accordion-item-data-grid-component', normalizedOptions));
      break;
    case AccordionItemKinds.TreeTable:
      rules.push(ExecuteSchematic('accordion-item-tree-table-component', normalizedOptions));
      break;
    case AccordionItemKinds.Switch:
      rules.push(ExecuteSchematic('accordion-item-switch-component', normalizedOptions));
      break;
    default:
      throw new SchematicsException(`Invalid accordion item type '${ kind }'!`);

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
