import { Normalized } from '@rxap/utilities';
import { BackendOptions } from '../../backend/backend-options';
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
  backend: BackendOptions
): NormalizedDateTableColumn {
  return {
    ...NormalizeBaseTableColumn({
      type: 'number | Date',
      ...column,
    }, backend),
    kind: TableColumnKind.DATE,
    format: column.format ?? 'dd.MM.yyyy HH:mm:ss',
  };
}
