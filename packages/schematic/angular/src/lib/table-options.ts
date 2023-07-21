import { NormalizedTableColumn } from './table-column';
import { NormalizedTableAction } from './table-action';
import { Normalized } from '@rxap/utilities';
import {
  MinimumTableOptions,
  NormalizedMinimumTableOptions,
  NormalizeMinimumTableOptions,
} from './minimum-table-options';
import {
  ExistingMethod,
  NormalizeExistingMethod,
} from './existing-method';

export interface TableOptions extends MinimumTableOptions {
  selectColumn?: boolean;
  tableMethod?: ExistingMethod;
}

export interface NormalizedTableOptions extends Readonly<Normalized<TableOptions>>, NormalizedMinimumTableOptions {
  componentName: string;
  columnList: NormalizedTableColumn[];
  actionList: NormalizedTableAction[];
}

export function NormalizeTableOptions(options: Readonly<TableOptions>, name: string): NormalizedTableOptions {
  const normalizedOptions = NormalizeMinimumTableOptions(options, name);
  const { actionList } = normalizedOptions;
  const selectColumn = (options.selectColumn ?? false) || actionList.some(action => action.inHeader);
  const tableMethod = NormalizeExistingMethod(options.tableMethod);
  return Object.seal({
    ...normalizedOptions,
    selectColumn,
    tableMethod,
  });
}
