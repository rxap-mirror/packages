import { Normalized } from '@rxap/utilities';
import {
  ExistingMethod,
  NormalizeExistingMethod,
} from './existing-method';
import {
  MinimumTableOptions,
  NormalizedMinimumTableOptions,
  NormalizeMinimumTableOptions,
} from './minimum-table-options';
import { NormalizedTableAction } from './table-action';
import { NormalizedTableColumn } from './table-column';
import {
  NormalizeTableOpenApiOptions,
  TableOpenApiOptions,
} from './table-open-api-options';

export interface TableOptions extends MinimumTableOptions {
  selectColumn?: boolean;
  tableMethod?: ExistingMethod;
  openApi?: TableOpenApiOptions;
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
  const openApi = NormalizeTableOpenApiOptions(options.openApi);
  return Object.seal({
    ...normalizedOptions,
    selectColumn,
    tableMethod,
    openApi,
  });
}
