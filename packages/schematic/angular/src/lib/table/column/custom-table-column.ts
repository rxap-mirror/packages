import { Normalized } from '@rxap/utilities';
import { BackendOptions } from '../../backend/backend-options';
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
  backend: BackendOptions
): NormalizedCustomTableColumn {
  return {
    ...NormalizeBaseTableColumn(column, backend),
    kind: TableColumnKind.CUSTOM,
    html: column.html ?? 'TODO: set html property',
  };
}
