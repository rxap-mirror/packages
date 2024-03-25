import { Normalized } from '@rxap/utilities';
import { TableColumnKind } from '../table-column-kind';
import {
  BaseTableColumn,
  NormalizeBaseTableColumn,
  NormalizedBaseTableColumn,
} from './base-table-column';

export interface DateTableColumn extends BaseTableColumn {
  format?: string;
}

export interface NormalizedDateTableColumn extends Readonly<Normalized<Omit<DateTableColumn, keyof BaseTableColumn>> & NormalizedBaseTableColumn> {
  format: string;
  kind: TableColumnKind.DATE;
}

export function NormalizeDateTableColumn(
  column: Readonly<DateTableColumn>,
): NormalizedDateTableColumn {
  return {
    ...NormalizeBaseTableColumn(column),
    kind: TableColumnKind.DATE,
    format: column.format ?? 'dd.MM.yyyy HH:mm:ss',
  };
}
