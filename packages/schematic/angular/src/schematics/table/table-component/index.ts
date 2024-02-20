import {
  chain,
  noop,
  Rule,
} from '@angular-devkit/schematics';
import {
  AddComponentImport,
  AddComponentProvider,
  buildOperationId,
  CoerceComponentRule,
  CoerceGetPageOperation,
  CoerceImports,
  CoerceMethodClass,
  FormDefinitionControl,
  GetPageOperationProperty,
  OperationIdToClassImportPath,
  OperationIdToClassName,
  TsMorphAngularProjectTransformOptions,
  TsMorphAngularProjectTransformRule,
} from '@rxap/schematics-ts-morph';
import {
  AddPackageJsonDependencyRule,
  CoerceSuffix,
  ExecuteSchematic,
} from '@rxap/schematics-utilities';
import { TypeImportToImportStructure } from '@rxap/ts-morph';
import {
  camelize,
  classify,
  Normalized,
} from '@rxap/utilities';
import {
  Project,
  SourceFile,
  Writers,
} from 'ts-morph';
import {
  AssertAngularOptionsNameProperty,
  NormalizedAngularOptions,
  PrintAngularOptions,
} from '../../../lib/angular-options';
import { BackendTypes } from '../../../lib/backend-types';
import { CoerceTableComponentRule } from '../../../lib/coerce-table-component';
import {
  actionListRule,
  cellComponentRule,
  headerButtonRule,
  NormalizeMinimumTableComponentOptions,
  tableInterfaceRule,
} from '../../../lib/minimum-table-component-options';
import { NormalizedTableColumn } from '../../../lib/table-column';
import {
  NormalizedTableOptions,
  NormalizeTableOptions,
  TableModifiers,
} from '../../../lib/table-options';
import { NormalizedDataProperty } from '@rxap/ts-morph';
import { CoerceTypeAlias } from '../action/form-table-action/index';
import { TableComponentOptions } from './schema';

export interface NormalizedTableComponentOptions
  extends Readonly<Normalized<Omit<TableComponentOptions, keyof NormalizedTableOptions>> & NormalizedTableOptions & NormalizedAngularOptions> {
  readonly name: string;
  readonly controllerName: string;
}

export function NormalizeTableComponentOptions(
  options: Readonly<TableComponentOptions>,
): NormalizedTableComponentOptions {
  const normalizedMinimumTableComponentOptions = NormalizeMinimumTableComponentOptions(options);
  AssertAngularOptionsNameProperty(normalizedMinimumTableComponentOptions);
  const {
    name,
    backend,
  } = normalizedMinimumTableComponentOptions;
  const normalizedTableOptions = NormalizeTableOptions(options, name);
  const { openApi } = normalizedTableOptions;
  if (backend === BackendTypes.OPEN_API) {
    if (!openApi) {
      throw new Error('openApi options must be provided. If backend is open-api');
    }
  }
  return Object.freeze({
    ...normalizedMinimumTableComponentOptions,
    ...normalizedTableOptions,
  });
}

export function TableColumnListAndPropertyListToGetPageOperationPropertyList(
  columnList: ReadonlyArray<NormalizedTableColumn>,
  propertyList: ReadonlyArray<NormalizedDataProperty>,
): GetPageOperationProperty[] {
  const list: GetPageOperationProperty[] = [];
  for (const column of columnList) {
    list.push({
      name: column.name,
      type: column.type ?? undefined,
      source: column.propertyPath ?? undefined,
    });
  }
  for (const property of propertyList) {
    if (!list.find((p) => p.source === property.name)) {
      list.push({
        name: property.name,
        type: property.type ?? undefined,
        source: property.name ?? undefined,
      });
    }
  }
  return list;
}

export function TableColumnToFormControl(
  column: NormalizedTableColumn,
): FormDefinitionControl {
  return {
    name: column.name,
    type: column.type?.name ?? undefined,
  };
}

function printOptions(options: NormalizedTableComponentOptions) {
  PrintAngularOptions('table-component', options);
  if (options.columnList.length) {
    console.log(`=== columns: \x1b[34m${ options.columnList.map((item) => item.name).join(', ') }\x1b[0m`);
  } else {
    console.log('=== columns: \x1b[31mempty\x1b[0m');
  }
  if (options.actionList.length > 0) {
    console.log(`=== actions: \x1b[34m${ options.actionList.map((c) => c.type).join(', ') }\x1b[0m`);
  } else {
    console.log('=== actions: \x1b[31mempty\x1b[0m');
  }
}

function componentRule(normalizedOptions: NormalizedTableComponentOptions): Rule {

  const {
    project,
    feature,
    shared,
    directory,
    overwrite,
    modifiers,
    columnList,
    tableMethod,
    componentName,
  } = normalizedOptions;

  const templateOptions = {
    ...normalizedOptions,
    hasNavigationBackHeader: modifiers.includes(TableModifiers.NAVIGATION_BACK_HEADER),
    hasWithoutTitle: modifiers.includes(TableModifiers.WITHOUT_TITLE),
    hasColumnWithFilter: columnList.some((c) => c.hasFilter),
    hasShowArchivedSlide: modifiers.includes(TableModifiers.SHOW_ARCHIVED_SLIDE),
    exportDefault: !!feature && !directory,
  };

  return chain([
    () => console.log(`Coerce the table component '${ componentName }'`),
    CoerceTableComponentRule({
      table: normalizedOptions,
      project,
      feature,
      shared,
      name: componentName,
      directory,
      overwrite,
      template: {
        options: templateOptions,
      },
      tsMorphTransform: (
        project: Project,
        [ componentSourceFile ]: [ SourceFile ],
      ) => {
        if (tableMethod) {
          AddComponentProvider(
            componentSourceFile,
            {
              provide: 'RXAP_TABLE_METHOD',
              useClass: tableMethod.name,
            },
            [
              TypeImportToImportStructure(tableMethod),
              {
                namedImports: [ 'RXAP_TABLE_METHOD' ],
                moduleSpecifier: '@rxap/material-table-system',
              },
            ],
          );
        }
      },
    }),
  ]);
}

interface UsePickFromTableInterfaceAsFormTypeRuleOptions
  extends TsMorphAngularProjectTransformOptions {
  name: string;
  formName: string;
  columnList: ReadonlyArray<NormalizedTableColumn>;
}

function UsePickFromTableInterfaceAsFormTypeRule(
  options: UsePickFromTableInterfaceAsFormTypeRuleOptions,
): Rule {
  const {
    name,
    columnList,
    formName,
  } = options;

  const className = CoerceSuffix(classify(formName), 'Form');
  const interfaceName = `I${ className }`;
  const tableInterfaceName = `I${ classify(name) }Table`;

  return TsMorphAngularProjectTransformRule(options, (project, [ sourceFile ]) => {

    const interfaceDeclaration = sourceFile.getInterface(interfaceName);
    if (interfaceDeclaration) {
      interfaceDeclaration.remove();
    }

    const type = `Pick<${ tableInterfaceName }, ${ columnList.filter(c => c.hasFilter)
                                                             .map(c => `'${ camelize(c.name) }'`)
                                                             .join(' | ') }>`;

    CoerceTypeAlias(sourceFile, interfaceName, {
      type,
      isExported: true,
    }).set({ type });

    CoerceImports(sourceFile, {
      namedImports: [ tableInterfaceName ],
      moduleSpecifier: `./${ name }-table`,
    });
  }, [ '/' + CoerceSuffix(formName, '.form.ts') ]);
}

function filterColumnRule(normalizedOptions: NormalizedTableComponentOptions): Rule {
  const {
    columnList,
    project,
    feature,
    shared,
    directory,
    backend,
    overwrite,
    componentName,
    name,
  } = normalizedOptions;
  if (columnList.some((c) => c.hasFilter)) {
    return chain([
      () => console.log(`Coerce the filter form definition`),
      ExecuteSchematic('form-definition', {
        name: CoerceSuffix(componentName, '-filter'),
        project,
        feature,
        shared,
        directory,
        backend,
        overwrite,
        controlList: columnList
          .filter((column) => column.hasFilter)
          .map(TableColumnToFormControl),
      }),
      CoerceComponentRule({
        project,
        feature,
        shared,
        name: componentName,
        directory,
        overwrite,
        tsMorphTransform: (
          project: Project,
          [ sourceFile ]: [ SourceFile ],
        ) => {
          AddComponentProvider(
            sourceFile,
            'FormProviders',
            [
              {
                moduleSpecifier: './form.providers',
                namedImports: [ 'FormProviders' ],
              },
            ],
          );
          AddComponentProvider(
            sourceFile,
            'TableFilterService',
            [
              {
                moduleSpecifier: '@rxap/material-table-system',
                namedImports: [ 'TableFilterService' ],
              },
            ],
          );
          AddComponentProvider(
            sourceFile,
            {
              provide: 'RXAP_TABLE_FILTER_FORM_DEFINITION',
              useFactory: 'FormFactory',
              deps: [ 'INJECTOR' ],
            },
            [
              {
                moduleSpecifier: '@angular/core',
                namedImports: [ 'INJECTOR' ],
              },
              {
                moduleSpecifier: './form.providers',
                namedImports: [ 'FormFactory' ],
              },
              {
                moduleSpecifier: '@rxap/material-table-system',
                namedImports: [ 'RXAP_TABLE_FILTER_FORM_DEFINITION' ],
              },
            ],
          );
        },
      }),
      UsePickFromTableInterfaceAsFormTypeRule({
        name,
        columnList,
        feature,
        project,
        shared,
        directory,
        formName: CoerceSuffix(componentName, '-filter'),
      }),
    ]);
  }

  return noop();
}

function openApiBackendRule(normalizedOptions: NormalizedTableComponentOptions): Rule {

  const {
    project,
    feature,
    shared,
    columnList,
    context,
    nestModule,
    componentName,
    directory,
    overwrite,
    scope,
    openApi,
  } = normalizedOptions;

  return chain([
    () => console.log('Add the open api methods to the table component providers'),
    CoerceComponentRule({
      project,
      feature,
      shared,
      name: componentName,
      directory,
      overwrite,
      tsMorphTransform: (
        project: Project,
        [ sourceFile ]: [ SourceFile ],
      ) => {
        if (openApi.adapter) {
          AddComponentProvider(
            sourceFile,
            {
              provide: 'TABLE_REMOTE_METHOD_ADAPTER_FACTORY',
              useValue: openApi.adapter.name,
            },
            [
              {
                moduleSpecifier: '@rxap/material-table-system',
                namedImports: [ 'TABLE_REMOTE_METHOD_ADAPTER_FACTORY' ],
              },
              TypeImportToImportStructure(openApi.adapter),
            ],
          );
        }
        AddComponentProvider(
          sourceFile,
          {
            provide: 'RXAP_TABLE_METHOD',
            useClass: OperationIdToClassName(openApi.operationId),
          },
          [
            {
              moduleSpecifier: '@rxap/material-table-system',
              namedImports: [ 'RXAP_TABLE_METHOD' ],
            },
            {
              moduleSpecifier: OperationIdToClassImportPath(openApi.operationId, scope),
              namedImports: [ OperationIdToClassName(openApi.operationId) ],
            },
          ],
        );
      },
    }),
  ]);

}

function nestjsBackendRule(normalizedOptions: NormalizedTableComponentOptions): Rule {

  const {
    project,
    feature,
    shared,
    columnList,
    propertyList,
    context,
    nestModule,
    componentName,
    directory,
    overwrite,
    scope,
    controllerName,
  } = normalizedOptions;

  const operationId = buildOperationId(
    normalizedOptions,
    'get-page',
    controllerName,
  );

  return chain([
    () => console.log(`Coerce the getPage operation for the table`),
    CoerceGetPageOperation({
      controllerName,
      nestModule: shared ? undefined : nestModule,
      project,
      feature,
      shared,
      propertyList: TableColumnListAndPropertyListToGetPageOperationPropertyList(columnList, propertyList),
      context,
    }),
    () => console.log('Add the open api methods to the table component providers'),
    CoerceComponentRule({
      project,
      feature,
      shared,
      name: componentName,
      directory,
      overwrite,
      tsMorphTransform: (
        project: Project,
        [ sourceFile ]: [ SourceFile ],
      ) => {
        AddComponentProvider(
          sourceFile,
          {
            provide: 'TABLE_REMOTE_METHOD_ADAPTER_FACTORY',
            useValue: 'GetPageAdapterFactory',
          },
          [
            {
              moduleSpecifier: '@rxap/material-table-system',
              namedImports: [ 'TABLE_REMOTE_METHOD_ADAPTER_FACTORY' ],
            },
            {
              moduleSpecifier: '@rxap/open-api/remote-method',
              namedImports: [ 'GetPageAdapterFactory' ],
            },
          ],
        );
        AddComponentProvider(
          sourceFile,
          {
            provide: 'RXAP_TABLE_METHOD',
            useClass: OperationIdToClassName(operationId),
          },
          [
            {
              moduleSpecifier: '@rxap/material-table-system',
              namedImports: [ 'RXAP_TABLE_METHOD' ],
            },
            {
              moduleSpecifier: OperationIdToClassImportPath(operationId, scope),
              namedImports: [ OperationIdToClassName(operationId) ],
            },
          ],
        );
      },
    }),
  ]);
}

function localBackendRule(normalizedOptions: NormalizedTableComponentOptions): Rule {

  const {
    project,
    feature,
    shared,
    componentName,
    directory,
    overwrite,
    name,
  } = normalizedOptions;

  return chain([
    () => console.log(`Coerce local backend method to table component`),
    CoerceComponentRule({
      project,
      feature,
      shared,
      name: componentName,
      directory,
      overwrite,
      tsMorphTransform: (
        project: Project,
        [ componentSourceFile ]: [ SourceFile ],
      ) => {
        AddComponentProvider(
          componentSourceFile,
          {
            provide: 'RXAP_TABLE_METHOD',
            useClass: `${ classify(name) }TableMethod`,
          },
          [
            {
              namedImports: [ `${ classify(name) }TableMethod` ],
              moduleSpecifier: `./${ name }-table.method`,
            },
            {
              namedImports: [ 'RXAP_TABLE_METHOD' ],
              moduleSpecifier: '@rxap/material-table-system',
            },
          ],
        );
      },
    }),
    () => console.log(`Coerce local backend method`),
    CoerceMethodClass({
      name: `${ name }-table`,
      project,
      feature,
      shared,
      directory,
      overwrite,
      tsMorphTransform: (project, sourceFile, classDeclaration) => {

        CoerceImports(sourceFile, [
          {
            moduleSpecifier: '@rxap/data-source/table',
            namedImports: [ 'TableEvent' ],
          },
          {
            moduleSpecifier: `./${ name }-table`,
            namedImports: [ `I${ classify(name) }Table` ],
          },
        ]);

        return {
          parameters: [
            {
              name: 'event',
              type: 'TableEvent',
            },
          ],
          statements: [ 'return [];' ],
          returnType: `I${ classify(name) }Table[]`,
        };
      },
    }),
  ]);

}

function backendRule(normalizedOptions: NormalizedTableComponentOptions): Rule {
  const {
    backend,
  } = normalizedOptions;
  switch (backend) {
    case BackendTypes.NESTJS:
      return nestjsBackendRule(normalizedOptions);
    case BackendTypes.LOCAL:
      return localBackendRule(normalizedOptions);
    case BackendTypes.OPEN_API:
      return openApiBackendRule(normalizedOptions);
  }
  return noop();
}

function selectColumnRule(normalizedOptions: NormalizedTableComponentOptions): Rule {

  const {
    selectColumn,
    project,
    feature,
    shared,
    componentName,
    directory,
    overwrite,
  } = normalizedOptions;

  if (selectColumn) {
    return chain([
      CoerceComponentRule({
        project,
        feature,
        shared,
        name: componentName,
        directory,
        overwrite,
        tsMorphTransform: (
          project: Project,
          [ sourceFile ]: [ SourceFile ],
        ) => {
          AddComponentProvider(
            sourceFile,
            'SelectRowService',
            [
              {
                moduleSpecifier: '@rxap/material-table-system',
                namedImports: [ 'SelectRowService' ],
              },
            ],
          );
          AddComponentProvider(
            sourceFile,
            {
              provide: 'RXAP_MATERIAL_TABLE_SYSTEM_SELECT_ROW_OPTIONS',
              useValue: Writers.object({
                multiple: 'true',
              }),
            },
            [
              {
                moduleSpecifier: '@rxap/material-table-system',
                namedImports: [ 'RXAP_MATERIAL_TABLE_SYSTEM_SELECT_ROW_OPTIONS' ],
              },
            ],
          );
          AddComponentImport(sourceFile, 'SelectRowModule', '@rxap/material-table-system');
        },
      }),
    ]);
  }

  return noop();

}

export default function (options: TableComponentOptions) {
  const normalizedOptions = NormalizeTableComponentOptions(options);
  printOptions(normalizedOptions);

  return function () {
    return chain([
      () => console.group('\x1b[32m[@rxap/schematics-angular:table-component]\x1b[0m'),
      tableInterfaceRule(normalizedOptions),
      componentRule(normalizedOptions),
      headerButtonRule(normalizedOptions),
      filterColumnRule(normalizedOptions),
      backendRule(normalizedOptions),
      cellComponentRule(normalizedOptions),
      actionListRule(normalizedOptions),
      selectColumnRule(normalizedOptions),
      AddPackageJsonDependencyRule('@rxap/material-table-system', 'latest', { soft: true }),
      AddPackageJsonDependencyRule('@rxap/material-form-system', 'latest', { soft: true }),
      AddPackageJsonDependencyRule('@rxap/form-system', 'latest', { soft: true }),
      AddPackageJsonDependencyRule('@rxap/window-system', 'latest', { soft: true }),
      AddPackageJsonDependencyRule('@rxap/nest-dto', 'latest', { soft: true }),
      () => console.groupEnd(),
    ]);
  };
}
