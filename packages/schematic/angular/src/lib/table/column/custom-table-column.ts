import { Normalized } from '@rxap/utilities';
import { TableColumnKind } from '../table-column-kind';
import {
  BaseTableColumn,
  NormalizeBaseTableColumn,
  NormalizedBaseTableColumn,
} from './base-table-column';

export interface CustomTableColumn extends BaseTableColumn {
  html?: string;
}

export interface NormalizedCustomTableColumn extends Readonly<Normalized<Omit<CustomTableColumn, keyof BaseTableColumn>> & NormalizedBaseTableColumn> {
  html: string;
  kind: TableColumnKind.CUSTOM;
}

export function NormalizeCustomTableColumn(
  column: Readonly<CustomTableColumn>,
): NormalizedCustomTableColumn {
  return {
    ...NormalizeBaseTableColumn(column),
    kind: TableColumnKind.CUSTOM,
    html: column.html ?? 'TODO: set html property',
  };
}
