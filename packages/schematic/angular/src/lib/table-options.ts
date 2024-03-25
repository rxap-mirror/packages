import { NormalizedDataProperty } from '@rxap/ts-morph';
import {
  CoerceArrayItems,
  Normalized,
} from '@rxap/utilities';
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
import {
  NormalizedTableOpenApiOptions,
  NormalizeTableOpenApiOptions,
  TableOpenApiOptions,
} from './table-open-api-options';
import { NormalizedTableColumn } from './table/table-column';
import { TableColumnKind } from './table/table-column-kind';
import { TableColumnSticky } from './table/table-column-sticky';

export enum TableModifiers {
  OVERWRITE = 'overwrite',
  NAVIGATION_BACK_HEADER = 'navigation-back-header',
  WITHOUT_TITLE = 'without-title',
  SHOW_ARCHIVED_SLIDE = 'show-archived-slide',
  WITH_HEADER = 'with-header',
}

export function IsTableModifiers(value: string): value is TableModifiers {
  return Object.values(TableModifiers).includes(value as TableModifiers);
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
  propertyList: Array<NormalizedDataProperty>;
  tableMethod: NormalizedExistingMethod | null;
  openApi: NormalizedTableOpenApiOptions | null;
}

export function NormalizeTableOptions(options: Readonly<TableOptions>, name: string): NormalizedTableOptions {
  const columnList = options.columnList ?? [];
  const propertyList = options.propertyList ?? [];
  if (options.modifiers?.includes(TableModifiers.SHOW_ARCHIVED_SLIDE)) {
    CoerceArrayItems(columnList, [{
      name: '__removedAt',
      kind: TableColumnKind.DATE,
      inactive: true,
      hidden: true,
      sticky: TableColumnSticky.START,
    }], { compareTo: (a, b) => a.name === b.name, unshift: true });
    CoerceArrayItems(propertyList, [{
      name: '__archived',
      type: 'boolean',
    }], { compareTo: (a, b) => a.name === b.name, unshift: true });
  }
  const normalizedOptions = NormalizeMinimumTableOptions({
    ...options,
    columnList,
    propertyList,
  }, name, IsTableModifiers);
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
