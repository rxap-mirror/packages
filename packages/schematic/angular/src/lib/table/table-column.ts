import {
  BaseTableColumn,
  NormalizeBaseTableColumn,
  NormalizedBaseTableColumn,
} from './column/base-table-column';
import {
  DateTableColumn,
  NormalizeDateTableColumn,
  NormalizedDateTableColumn,
} from './column/date-table-column';
import { TableColumnKind } from './table-column-kind';

export type TableColumn = BaseTableColumn | DateTableColumn;

export type NormalizedTableColumn = NormalizedBaseTableColumn | NormalizedDateTableColumn;

export function NormalizeTableColumn(
  column: Readonly<TableColumn>,
): NormalizedTableColumn {
  switch (column.kind) {
    case TableColumnKind.DATE:
      return NormalizeDateTableColumn(column);
    case TableColumnKind.DEFAULT:
    default:
      return NormalizeBaseTableColumn(column);
  }
}

export function NormalizeTableColumnList(
  columnList?: ReadonlyArray<Readonly<TableColumn>>,
): ReadonlyArray<NormalizedTableColumn> {
  return Object.freeze((columnList?.map(NormalizeTableColumn) ?? []).sort((a, b) => {
    if (a.stickyStart) {
      return b.stickyStart ? 0 : -1;
    }
    if (a.stickyEnd) {
      return b.stickyEnd ? 0 : 1;
    }
    return 0;
  }));
}
