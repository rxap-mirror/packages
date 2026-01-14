import { chain } from '@angular-devkit/schematics';
import {
  AddComponentProvider,
  CoerceComponentRule,
  CoerceGetChildrenOperation,
  CoerceGetRootOperation,
  CoerceTreeTableChildrenProxyRemoteMethodClass,
  CoerceTreeTableRootProxyRemoteMethodClass,
} from '@rxap/schematics-ts-morph';
import {
  Project,
  SourceFile,
} from 'ts-morph';
import { BuildTreeTableGeChildrenOperationId } from '../../../../lib/build-tree-table-ge-children-operation-id';
import { BuildTreeTableGetRootOperationId } from '../../../../lib/build-tree-table-get-root-operation-id';
import { NormalizedTreeTableComponentOptions } from '../normalized-tree-table-component-options';

export function nestjsBackendRule(normalizedOptions: NormalizedTreeTableComponentOptions) {

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
    propertyList,
    identifier,
    upstream,
    backend,
  } = normalizedOptions;

  const getRootOperationId = BuildTreeTableGetRootOperationId(normalizedOptions);
  const getChildrenOperationId = BuildTreeTableGeChildrenOperationId(normalizedOptions);

  return chain([
    () => console.log(`Coerce the get root operation ${ getRootOperationId }`),
    CoerceGetRootOperation({
      controllerName,
      nestModule,
      project,
      feature,
      backend,
      shared,
      propertyList,
      upstream,
      overwrite,
    }),
    () => console.log(`Coerce the get children operation ${ getChildrenOperationId }`),
    CoerceGetChildrenOperation({
      controllerName,
      nestModule,
      project,
      feature,
      backend,
      shared,
      skipCoerce: true,
      propertyList,
      upstream,
      overwrite,
    }),
    () => console.log(`Coerce the tree table root proxy remote method class`),
    CoerceTreeTableRootProxyRemoteMethodClass({
      scope,
      project,
      feature,
      shared,
      directory,
      getRootOperationId,
      identifier,
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