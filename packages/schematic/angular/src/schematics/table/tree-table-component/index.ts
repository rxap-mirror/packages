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
import {
  actionListRule,
  cellComponentRule,
  headerButtonRule,
  NormalizeMinimumTableComponentOptions,
  tableInterfaceRule,
} from '../../../lib/minimum-table-component-options';
import {
  NormalizedTreeTableOptions,
  NormalizeTreeTableOptions,
} from '../../../lib/tree-table-options';
import { TreeTableComponentOptions } from './schema';

export interface NormalizedTreeTableComponentOptions
  extends Readonly<Normalized<TreeTableComponentOptions> & NormalizedTreeTableOptions & NormalizedAngularOptions> {
  name: string;
  controllerName: string;
}

export function NormalizedTreeTableComponentOptions(
  options: Readonly<TreeTableComponentOptions>,
): Readonly<NormalizedTreeTableComponentOptions> {
  const normalizedMinimumTableComponentOptions = NormalizeMinimumTableComponentOptions(options);
  AssertAngularOptionsNameProperty(normalizedMinimumTableComponentOptions);
  const { name } = normalizedMinimumTableComponentOptions;
  const normalizedTreeTableOptions = NormalizeTreeTableOptions(options, name);
  return Object.seal({
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
    hasNavigationBackHeader: modifiers.includes('navigation-back-header'),
    hasWithoutTitle: modifiers.includes('without-title'),
    hasColumnWithFilter: columnList.some((c) => c.hasFilter),
  };

  return chain([
    () => console.log(`Coerce the table component ${ componentName }`),
    CoerceComponentRule({
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
    }),
    () => console.log(`Coerce the get children operation ${ getChildrenOperationId }`),
    CoerceGetChildrenOperation({
      controllerName: componentName,
      nestModule,
      project,
      feature,
      shared,
      skipCoerce: true,
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
              useClass: tableRootMethod.className,
            },
            [
              {
                moduleSpecifier: '@rxap/data-source/table/tree',
                namedImports: [ 'RXAP_TREE_TABLE_DATA_SOURCE_ROOT_METHOD' ],
              },
              {
                moduleSpecifier: tableRootMethod.importPath,
                namedImports: [ tableRootMethod.className ],
              },
            ],
          );
          AddComponentProvider(
            sourceFile,
            {
              provide: 'RXAP_TREE_TABLE_DATA_SOURCE_CHILDREN_METHOD',
              useClass: tableChildMethod.className,
            },
            [
              {
                moduleSpecifier: '@rxap/data-source/table/tree',
                namedImports: [ 'RXAP_TREE_TABLE_DATA_SOURCE_CHILDREN_METHOD' ],
              },
              {
                moduleSpecifier: tableChildMethod.importPath,
                namedImports: [ tableChildMethod.className ],
              },
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
      tableInterfaceRule(normalizedOptions),
      componentRule(normalizedOptions),
      actionListRule(normalizedOptions),
      cellComponentRule(normalizedOptions),
      headerButtonRule(normalizedOptions),
      backendRule(normalizedOptions),
      treeTableMethodRule(normalizedOptions),
    ]);
  };
}
