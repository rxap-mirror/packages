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
  OperationIdToClassRemoteMethodImportPath,
  OperationIdToRemoteMethodClassName,
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
  AccordionItem,
  NormalizeAccordionItem,
  NormalizedAccordionItem,
} from '../../../lib/accordion/accordion-item';
import {
  AccordionItemKinds,
  IsAccordionItemKind,
} from '../../../lib/accordion/accordion-item-kind';
import {
  AngularOptions,
  NormalizeAngularOptions,
  NormalizedAngularOptions,
  PrintAngularOptions,
} from '../../../lib/angular-options';
import { BackendTypes } from '../../../lib/backend-types';
import { AccordionItemComponentOptions } from './schema';

export type NormalizedAccordionItemStandaloneComponentOptions =
  Readonly<Normalized<Omit<AccordionItemComponentOptions, keyof AngularOptions | keyof AccordionItem>>>
  & NormalizedAngularOptions & NormalizedAccordionItem
  & Readonly<NonNullable<Pick<AngularOptions, 'controllerName' | 'componentName' | 'directory' | 'nestModule'>>>

export function NormalizeAccordionItemStandaloneComponentOptions(
  options: Readonly<AccordionItemComponentOptions>,
): NormalizedAccordionItemStandaloneComponentOptions {
  const normalizedAngularOptions = NormalizeAngularOptions(options);
  const { name } = normalizedAngularOptions;
  let {
    directory,
    controllerName,
    componentName,
  } = normalizedAngularOptions;
  let {
    accordionName,
    nestModule,
  } = options;
  if (!name) {
    throw new Error('The name is required!');
  }
  if (!accordionName) {
    throw new Error('The accordion name is required!');
  }
  accordionName = CoerceSuffix(dasherize(accordionName), '-accordion');
  componentName ??= CoerceSuffix(name, '-panel');
  directory ??= join(accordionName, componentName);
  if (!directory.endsWith(componentName)) {
    directory = join(directory, componentName);
  }
  nestModule ??= accordionName;
  controllerName ??= BuildNestControllerName({
    controllerName: name,
    nestModule,
  });
  return Object.freeze({
    ...normalizedAngularOptions,
    ...NormalizeAccordionItem(options),
    controllerName,
    nestModule,
    directory,
    componentName,
    accordionName,
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

export function printAccordionItemComponentOptions(options: NormalizedAngularOptions & Pick<NormalizedAccordionItem, 'kind' | 'identifier'>, schematicName = 'accordion-item-component') {
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
    overwrite,
    propertyList,
    backend,
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
        overwrite,
        nestModule,
        propertyList,
        backend
      }),
    );
  } else {
    rules.push(
      () => console.log(`Coerce get operation ...`),
      CoerceGetOperation({
        controllerName,
        project,
        feature,
        overwrite,
        shared,
        upstream,
        nestModule,
        propertyList,
        backend
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
    backend,
  } = normalizedOptions;

  return chain([
    () => console.log(`Coerce panel data source ...`),
    CoerceInterfaceRule({
      project,
      feature,
      shared,
      directory,
      backend,
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

  switch (backend.kind) {

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
    componentName,
    importList,
    backend
  } = normalizedOptions;

  let methodName: string | null = null;
  let methodModuleSpecifier: string | null = null;
  let methodResponse: string | null = null;
  let methodResponseModuleSpecifier: string | null = null;

  if (backend.kind === BackendTypes.NESTJS) {
    const operationId = buildGetOperationId(normalizedOptions);
    methodName = OperationIdToRemoteMethodClassName(operationId);
    methodModuleSpecifier = OperationIdToClassRemoteMethodImportPath(operationId, normalizedOptions.scope);
    methodResponse = OperationIdToResponseClassName(operationId);
    methodResponseModuleSpecifier = OperationIdToResponseClassImportPath(operationId, normalizedOptions.scope);
  }

  const templateOptions = {
    ...strings,
    ...normalizedOptions,
    method: backend.kind === BackendTypes.NESTJS ? {
      name: methodName,
      moduleSpecifier: methodModuleSpecifier,
      response: methodResponse,
      responseModuleSpecifier: methodResponseModuleSpecifier,
    } : null,
  };

  return chain([
    CoerceComponentRule({
      name: componentName,
      project,
      feature,
      directory,
      shared,
      overwrite: false,
      template: {
        options: templateOptions,
      },
      tsMorphTransform: (project, [ sourceFile ], [ classDeclaration ]) => {
        CoerceComponentImport(classDeclaration, { name: 'DataSourceDirective', moduleSpecifier: '@rxap/data-source/directive' });
        CoerceComponentImport(classDeclaration, { name: 'MatProgressBarModule', moduleSpecifier: '@angular/material/progress-bar' });
        CoerceComponentImport(classDeclaration, { name: 'DataSourceErrorComponent', moduleSpecifier: '@rxap/data-source' });
        CoerceComponentImport(classDeclaration, { name: 'AsyncPipe', moduleSpecifier: '@angular/common' });
        CoerceComponentImport(classDeclaration, { name: 'JsonPipe', moduleSpecifier: '@angular/common' });
        CoerceComponentImport(classDeclaration, { name: 'NgIf', moduleSpecifier: '@angular/common' });

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
        for (const angularImport of importList) {
          CoerceComponentImport(classDeclaration, angularImport);
        }
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
    case AccordionItemKinds.Nested:
      rules.push(ExecuteSchematic('accordion-item-nested-component', normalizedOptions));
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
