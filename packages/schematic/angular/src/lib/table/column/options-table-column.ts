import {
  CoerceArrayItems,
  ControlOption,
  Normalized,
} from '@rxap/utilities';
import { BackendOptions } from '../../backend/backend-options';
import { TableColumnKind } from '../table-column-kind';
import {
  BaseTableColumn,
  NormalizeBaseTableColumn,
  NormalizedBaseTableColumn,
} from './base-table-column';

export interface OptionsTableColumn extends BaseTableColumn {
  optionList?: ControlOption[];
}

export interface NormalizedOptionsTableColumn extends Readonly<Normalized<Omit<OptionsTableColumn, keyof BaseTableColumn | 'optionList'>> & NormalizedBaseTableColumn> {
  optionList: ControlOption[];
  kind: TableColumnKind.OPTIONS;
}

export function NormalizeOptionsTableColumn(
  column: Readonly<OptionsTableColumn>,
  backend: BackendOptions
): NormalizedOptionsTableColumn {
  const importList = column.importList ?? [];
  CoerceArrayItems(importList, [
    {
      name: 'OptionsCellComponent',
      moduleSpecifier: '@rxap/material-table-system',
    },
    {
      name: 'MatOptionModule',
      moduleSpecifier: '@angular/material/core',
    },
  ], (a, b) => a.name === b.name);
  return {
    ...NormalizeBaseTableColumn({
      ...column,
      importList,
    }, backend),
    kind: TableColumnKind.OPTIONS,
    optionList: column.optionList ?? [],
  };
}
