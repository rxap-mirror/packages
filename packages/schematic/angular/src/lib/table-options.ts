import { Normalized } from '@rxap/utilities';
import {
  ExistingMethod,
  NormalizedExistingMethod,
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
  NormalizedTableOpenApiOptions,
  NormalizeTableOpenApiOptions,
  TableOpenApiOptions,
} from './table-open-api-options';
import { NormalizedDataProperty } from './data-property';

export interface TableOptions extends MinimumTableOptions {
  selectColumn?: boolean;
  tableMethod?: ExistingMethod;
  openApi?: TableOpenApiOptions;
}

export interface NormalizedTableOptions
  extends Omit<Readonly<Normalized<TableOptions> & NormalizedMinimumTableOptions>, 'columnList' | 'actionList' | 'propertyList' | 'tableMethod' | 'openApi'> {
  componentName: string;
  columnList: ReadonlyArray<NormalizedTableColumn>;
  actionList: ReadonlyArray<NormalizedTableAction>;
  propertyList: ReadonlyArray<NormalizedDataProperty>;
  tableMethod: NormalizedExistingMethod | null;
  openApi: NormalizedTableOpenApiOptions | null;
}

export function NormalizeTableOptions(options: Readonly<TableOptions>, name: string): NormalizedTableOptions {
  const normalizedOptions = NormalizeMinimumTableOptions(options, name);
  const { actionList } = normalizedOptions;
  const selectColumn = (options.selectColumn ?? false) || actionList.some(action => action.inHeader);
  const tableMethod = NormalizeExistingMethod(options.tableMethod);
  const openApi = NormalizeTableOpenApiOptions(options.openApi);
  return Object.freeze({
    ...normalizedOptions,
    selectColumn,
    tableMethod,
    openApi,
  });
}
