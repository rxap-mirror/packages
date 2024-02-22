import {
  chain,
  noop,
} from '@angular-devkit/schematics';
import {
  AddComponentProvider,
  buildOperationId,
  CoerceComponentRule,
  CoerceGetChildrenOperation,
  CoerceGetRootOperation,
  CoerceImports,
  CoerceMethodClass,
  CoerceTreeTableChildrenProxyRemoteMethodClass,
  CoerceTreeTableRootProxyRemoteMethodClass,
} from '@rxap/schematics-ts-morph';
import { TypeImportToImportStructure } from '@rxap/ts-morph';
import {
  classify,
  Normalized,
} from '@rxap/utilities';
import {
  Project,
  SourceFile,
} from 'ts-morph';
import {
  AssertAngularOptionsNameProperty,
  NormalizedAngularOptions,
  PrintAngularOptions,
} from '../../../lib/angular-options';
import { BackendTypes } from '../../../lib/backend-types';
import { CoerceTreeTableComponentRule } from '../../../lib/coerce-tree-table-component';
import {
  actionListRule,
  cellComponentRule,
  headerButtonRule,
  NormalizeMinimumTableComponentOptions,
  tableInterfaceRule,
} from '../../../lib/minimum-table-component-options';
import { TableFilterColumnRule } from '../../../lib/table/table-filter-column-rule';
import {
  IsTreeTableModifiers,
  NormalizedTreeTableOptions,
  NormalizeTreeTableOptions,
  TreeTableModifiers,
} from '../../../lib/tree-table-options';
import { TableColumnListAndPropertyListToGetPageOperationPropertyList } from '../table-component';
import { TreeTableComponentOptions } from './schema';

export interface NormalizedTreeTableComponentOptions
  extends Readonly<Normalized<Omit<TreeTableComponentOptions, keyof NormalizedTreeTableOptions>> & NormalizedTreeTableOptions & NormalizedAngularOptions> {
  name: string;
  controllerName: string;
}

export function NormalizedTreeTableComponentOptions(
  options: Readonly<TreeTableComponentOptions>,
): Readonly<NormalizedTreeTableComponentOptions> {
  const normalizedMinimumTableComponentOptions = NormalizeMinimumTableComponentOptions(options, IsTreeTableModifiers, '-tree-table');
  AssertAngularOptionsNameProperty(normalizedMinimumTableComponentOptions);
  const { name } = normalizedMinimumTableComponentOptions;
  const normalizedTreeTableOptions = NormalizeTreeTableOptions(options, name);
  return Object.freeze({
    ...normalizedMinimumTableComponentOptions,
    ...normalizedTreeTableOptions,
  });
}

function printOptions(options: NormalizedTreeTableComponentOptions) {
  PrintAngularOptions('tree-table-component', options);
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

function componentRule(normalizedOptions: NormalizedTreeTableComponentOptions) {

  const {
    project,
    feature,
    shared,
    componentName,
    directory,
    overwrite,
    modifiers,
    columnList,
  } = normalizedOptions;

  const templateOptions = {
    ...normalizedOptions,
    hasNavigationBackHeader: modifiers.includes(TreeTableModifiers.NAVIGATION_BACK_HEADER),
    hasWithoutTitle: modifiers.includes(TreeTableModifiers.WITHOUT_TITLE),
    hasColumnWithFilter: columnList.some((c) => c.hasFilter),
    exportDefault: !!feature && !directory,
  };

  return chain([
    () => console.log(`Coerce the table component ${ componentName }`),
    CoerceTreeTableComponentRule({
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
      tsMorphTransform: (project, [ sourceFile ]) => {
        AddComponentProvider(
          sourceFile,
          {
            provide: 'TABLE_DATA_SOURCE',
            useClass: 'TreeTableDataSource',
          },
          [
            {
              moduleSpecifier: '@rxap/data-source/table/tree',
              namedImports: [ 'TreeTableDataSource' ],
            },
            {
              moduleSpecifier: '@rxap/material-table-system',
              namedImports: [ 'TABLE_DATA_SOURCE' ],
            },
          ],
        );
      },
    }),
  ]);

}

// region backend

function nestjsBackendRule(normalizedOptions: NormalizedTreeTableComponentOptions) {

  const {
    nestModule,
    project,
    feature,
    shared,
    componentName,
    directory,
    overwrite,
    scope,
    controllerName,
    columnList,
    propertyList
  } = normalizedOptions;

  const getRootOperationId = buildOperationId(
    normalizedOptions,
    'get-root',
    controllerName,
  );
  const getChildrenOperationId = buildOperationId(
    normalizedOptions,
    'get-children',
    controllerName,
  );

  return chain([
    () => console.log(`Coerce the get root operation ${ getRootOperationId }`),
    CoerceGetRootOperation({
      controllerName: componentName,
      nestModule,
      project,
      feature,
      shared,
      propertyList: TableColumnListAndPropertyListToGetPageOperationPropertyList(columnList, propertyList),
    }),
    () => console.log(`Coerce the get children operation ${ getChildrenOperationId }`),
    CoerceGetChildrenOperation({
      controllerName: componentName,
      nestModule,
      project,
      feature,
      shared,
      skipCoerce: true,
      propertyList: TableColumnListAndPropertyListToGetPageOperationPropertyList(columnList, propertyList),
    }),
    () => console.log(`Coerce the tree table root proxy remote method class`),
    CoerceTreeTableRootProxyRemoteMethodClass({
      scope,
      project,
      feature,
      shared,
      directory,
      getRootOperationId,
    }),
    () => console.log(`Coerce the tree table children proxy remote method class`),
    CoerceTreeTableChildrenProxyRemoteMethodClass({
      scope,
      project,
      feature,
      shared,
      directory,
      getChildrenOperationId,
    }),
    () => console.log(`Coerce the tree table providers`),
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
            provide: 'RXAP_TREE_TABLE_DATA_SOURCE_ROOT_METHOD',
            useClass: 'TreeTableRootProxyMethod',
          },
          [
            {
              moduleSpecifier: '@rxap/data-source/table/tree',
              namedImports: [ 'RXAP_TREE_TABLE_DATA_SOURCE_ROOT_METHOD' ],
            },
            {
              moduleSpecifier: './tree-table-root-proxy.method',
              namedImports: [ 'TreeTableRootProxyMethod' ],
            },
          ],
        );
        AddComponentProvider(
          sourceFile,
          {
            provide: 'RXAP_TREE_TABLE_DATA_SOURCE_CHILDREN_METHOD',
            useClass: 'TreeTableChildrenProxyMethod',
          },
          [
            {
              moduleSpecifier: '@rxap/data-source/table/tree',
              namedImports: [ 'RXAP_TREE_TABLE_DATA_SOURCE_CHILDREN_METHOD' ],
            },
            {
              moduleSpecifier: './tree-table-children-proxy.method',
              namedImports: [ 'TreeTableChildrenProxyMethod' ],
            },
          ],
        );
      },
    }),
  ]);
}

function localBackendRule(normalizedOptions: NormalizedTreeTableComponentOptions) {

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
            provide: 'RXAP_TREE_TABLE_DATA_SOURCE_ROOT_METHOD',
            useClass: `${ classify(name) }RootTableMethod`,
          },
          [
            {
              moduleSpecifier: '@rxap/data-source/table/tree',
              namedImports: [ 'RXAP_TREE_TABLE_DATA_SOURCE_ROOT_METHOD' ],
            },
            {
              moduleSpecifier: `./${ name }-root-table.method`,
              namedImports: [ `${ classify(name) }RootTableMethod` ],
            },
          ],
        );
        AddComponentProvider(
          sourceFile,
          {
            provide: 'RXAP_TREE_TABLE_DATA_SOURCE_CHILDREN_METHOD',
            useClass: `${ classify(name) }ChildTableMethod`,
          },
          [
            {
              moduleSpecifier: '@rxap/data-source/table/tree',
              namedImports: [ 'RXAP_TREE_TABLE_DATA_SOURCE_CHILDREN_METHOD' ],
            },
            {
              moduleSpecifier: `./${ name }-child-table.method`,
              namedImports: [ `${ classify(name) }ChildTableMethod` ],
            },
          ],
        );
      },
    }),
    () => console.log(`Coerce local backend root method`),
    CoerceMethodClass({
      name: `${ name }-root-table`,
      project,
      feature,
      shared,
      directory,
      overwrite,
      tsMorphTransform: (project, sourceFile, classDeclaration) => {

        CoerceImports(sourceFile, [
          {
            moduleSpecifier: `./${ name }-table`,
            namedImports: [ `I${ classify(name) }Table` ],
          },
        ]);

        return {
          parameters: [],
          statements: [ 'return [];' ],
          returnType: `I${ classify(name) }Table[]`,
        };
      },
    }),
    () => console.log(`Coerce local backend child method`),
    CoerceMethodClass({
      name: `${ name }-child-table`,
      project,
      feature,
      shared,
      directory,
      overwrite,
      tsMorphTransform: (project, sourceFile, classDeclaration) => {

        CoerceImports(sourceFile, [
          {
            moduleSpecifier: '@rxap/data-structure-tree',
            namedImports: [ 'Node' ],
          },
          {
            moduleSpecifier: `./${ name }-table`,
            namedImports: [ `I${ classify(name) }Table` ],
          },
        ]);

        return {
          parameters: [
            {
              name: 'node',
              type: `Node<I${ classify(name) }Table>`,
            },
          ],
          statements: [ 'return [];' ],
          returnType: `I${ classify(name) }Table[]`,
        };
      },
    }),
  ]);

}

function backendRule(normalizedOptions: NormalizedTreeTableComponentOptions) {

  const {
    backend,
  } = normalizedOptions;

  switch (backend) {

    case BackendTypes.NESTJS:
      return nestjsBackendRule(normalizedOptions);

    case BackendTypes.LOCAL:
      return localBackendRule(normalizedOptions);

  }

  return noop();

}

// endregion

function treeTableMethodRule(normalizedOptions: NormalizedTreeTableComponentOptions) {

  const {
    project,
    feature,
    shared,
    componentName,
    directory,
    overwrite,
    tableRootMethod,
    tableChildMethod,
  } = normalizedOptions;

  if (tableRootMethod && tableChildMethod) {
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
            {
              provide: 'RXAP_TREE_TABLE_DATA_SOURCE_ROOT_METHOD',
              useClass: tableRootMethod.name,
            },
            [
              {
                moduleSpecifier: '@rxap/data-source/table/tree',
                namedImports: [ 'RXAP_TREE_TABLE_DATA_SOURCE_ROOT_METHOD' ],
              },
              TypeImportToImportStructure(tableRootMethod),
            ],
          );
          AddComponentProvider(
            sourceFile,
            {
              provide: 'RXAP_TREE_TABLE_DATA_SOURCE_CHILDREN_METHOD',
              useClass: tableChildMethod.name,
            },
            [
              {
                moduleSpecifier: '@rxap/data-source/table/tree',
                namedImports: [ 'RXAP_TREE_TABLE_DATA_SOURCE_CHILDREN_METHOD' ],
              },
              TypeImportToImportStructure(tableChildMethod),
            ],
          );
        },
      }),
    ]);
  }

  return noop();

}

export default function (options: TreeTableComponentOptions) {
  const normalizedOptions = NormalizedTreeTableComponentOptions(options);
  printOptions(normalizedOptions);

  return () => {
    return chain([
      tableInterfaceRule(normalizedOptions, { operationName: 'get-root', typePath: '[number]' }),
      componentRule(normalizedOptions),
      TableFilterColumnRule(normalizedOptions, 'tree-table'),
      actionListRule(normalizedOptions),
      cellComponentRule(normalizedOptions),
      headerButtonRule(normalizedOptions),
      backendRule(normalizedOptions),
      treeTableMethodRule(normalizedOptions),
    ]);
  };
}
