import { Normalized } from '@rxap/utilities';
import { TableColumnKind } from '../table-column-kind';
import {
  BaseTableColumn,
  NormalizeBaseTableColumn,
  NormalizedBaseTableColumn,
} from './base-table-column';

export type BooleanTableColumn = BaseTableColumn

export interface NormalizedBooleanTableColumn extends Readonly<Normalized<Omit<BooleanTableColumn, keyof BaseTableColumn>> & NormalizedBaseTableColumn> {
  kind: TableColumnKind.BOOLEAN;
}

export function NormalizeBooleanTableColumn(
  column: Readonly<BooleanTableColumn>,
): NormalizedBooleanTableColumn {
  return {
    ...NormalizeBaseTableColumn({
      type: 'boolean',
      ...column,
    }),
    kind: TableColumnKind.BOOLEAN,
  };
}
