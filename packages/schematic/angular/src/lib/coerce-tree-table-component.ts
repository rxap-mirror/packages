import { CoerceComponentOptions } from '@rxap/schematics-ts-morph';
import { CoerceComponentImport } from '@rxap/ts-morph';
import { CoerceMinimumTableComponentRule } from './coerce-minimum-table-component';
import { NormalizedTreeTableOptions } from './tree-table-options';

export interface CoerceTreeTableComponentOptions extends CoerceComponentOptions {
  table: NormalizedTreeTableOptions;
}

export function CoerceTreeTableComponentRule(options: Readonly<CoerceTreeTableComponentOptions>) {

  return CoerceMinimumTableComponentRule({
    ...options,
    tsMorphTransform: (project, [sourceFile], [classDeclaration]) => {
      CoerceComponentImport(classDeclaration, { name: 'TreeControlCellComponent', moduleSpecifier: '@rxap/material-table-system' });
    },
  });

}
