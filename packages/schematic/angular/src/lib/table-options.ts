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
import { NormalizedDataProperty } from '@rxap/ts-morph';

export enum TableModifiers {
  OVERWRITE = 'overwrite',
  NAVIGATION_BACK_HEADER = 'navigation-back-header',
  WITHOUT_TITLE = 'without-title',
  SHOW_ARCHIVED_SLIDE = 'show-archived-slide',

}

export function IsTableModifiers(value: string): value is TableModifiers {
  return value in TableModifiers;
}

export interface TableOptions extends MinimumTableOptions {
  selectColumn?: boolean;
  tableMethod?: ExistingMethod;
  openApi?: TableOpenApiOptions;
}

export interface NormalizedTableOptions
  extends Omit<Readonly<Normalized<TableOptions> & NormalizedMinimumTableOptions<TableModifiers>>, 'columnList' | 'actionList' | 'propertyList' | 'tableMethod' | 'openApi'> {
  componentName: string;
  columnList: ReadonlyArray<NormalizedTableColumn>;
  actionList: ReadonlyArray<NormalizedTableAction>;
  propertyList: ReadonlyArray<NormalizedDataProperty>;
  tableMethod: NormalizedExistingMethod | null;
  openApi: NormalizedTableOpenApiOptions | null;
}

export function NormalizeTableOptions(options: Readonly<TableOptions>, name: string): NormalizedTableOptions {
  const normalizedOptions = NormalizeMinimumTableOptions(options, name, IsTableModifiers);
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
