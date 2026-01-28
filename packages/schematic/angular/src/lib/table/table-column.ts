import { BackendOptions } from '../backend/backend-options';
import {
  BaseTableColumn,
  NormalizeBaseTableColumn,
  NormalizedBaseTableColumn,
} from './column/base-table-column';
import { NormalizeBooleanTableColumn } from './column/boolean-table-column';
import { NormalizeCustomTableColumn } from './column/custom-table-column';
import {
  DateTableColumn,
  NormalizeDateTableColumn,
  NormalizedDateTableColumn,
} from './column/date-table-column';
import { NormalizeOptionsTableColumn } from './column/options-table-column';
import { TableColumnKind } from './table-column-kind';

export type TableColumn = BaseTableColumn | DateTableColumn;

export type NormalizedTableColumn = NormalizedBaseTableColumn | NormalizedDateTableColumn;

export function NormalizeTableColumn(
  column: Readonly<TableColumn>,
  backend: BackendOptions
): NormalizedTableColumn {
  switch (column.kind) {
    case TableColumnKind.DATE:
      return NormalizeDateTableColumn(column, backend);
    case TableColumnKind.CUSTOM:
      return NormalizeCustomTableColumn(column, backend);
    case TableColumnKind.BOOLEAN:
      return NormalizeBooleanTableColumn(column, backend);
    case TableColumnKind.OPTIONS:
      return NormalizeOptionsTableColumn(column, backend);
    case TableColumnKind.DEFAULT:
    default:
      return NormalizeBaseTableColumn(column, backend);
  }
}

export function NormalizeTableColumnList(
  columnList: ReadonlyArray<Readonly<TableColumn>> = [],
  backend: BackendOptions
): ReadonlyArray<NormalizedTableColumn> {
  return Object.freeze((columnList?.map(item => NormalizeTableColumn(item, backend)) ?? []).sort((a, b) => {
    if (a.stickyStart !== b.stickyStart) {
      return a.stickyStart ? -1 : 1;
    }
    if (a.stickyEnd !== b.stickyEnd) {
      return a.stickyEnd ? 1 : -1;
    }
    return 0;
  }));
}
