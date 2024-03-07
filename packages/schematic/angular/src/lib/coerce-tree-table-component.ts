import {
  AddComponentProvider,
  CoerceComponentOptions,
} from '@rxap/schematics-ts-morph';
import { CoerceMinimumTableComponentRule } from './coerce-minimum-table-component';
import { NormalizedTreeTableOptions } from './tree-table-options';

export interface CoerceTreeTableComponentOptions extends CoerceComponentOptions {
  table: NormalizedTreeTableOptions;
}

export function CoerceTreeTableComponentRule(options: Readonly<CoerceTreeTableComponentOptions>) {

  return CoerceMinimumTableComponentRule({
    ...options,
    tsMorphTransform: (project, [sourceFile]) => {
      AddComponentProvider(sourceFile, {
        provide: 'TABLE_DATA_SOURCE',
        useClass: 'TreeTableDataSource',
      }, [
        {
          namedImports: [ 'TreeTableDataSource' ],
          moduleSpecifier: '@rxap/data-source/table/tree',
        },
        {
          namedImports: ['TABLE_DATA_SOURCE'],
          moduleSpecifier: '@rxap/material-table-system',
        }
      ]);
    },
  });

}
