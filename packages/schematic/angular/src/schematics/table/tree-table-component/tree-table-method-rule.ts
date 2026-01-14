import {
  chain,
  noop,
} from '@angular-devkit/schematics';
import {
  AddComponentProvider,
  CoerceComponentRule,
} from '@rxap/schematics-ts-morph';
import { TypeImportToImportStructure } from '@rxap/ts-morph';
import {
  Project,
  SourceFile,
} from 'ts-morph';
import { NormalizedTreeTableComponentOptions } from './normalized-tree-table-component-options';

export function treeTableMethodRule(normalizedOptions: NormalizedTreeTableComponentOptions) {

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