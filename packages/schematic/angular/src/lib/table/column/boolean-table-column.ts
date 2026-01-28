import { Normalized } from '@rxap/utilities';
import { BackendOptions } from '../../backend/backend-options';
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
  backend: BackendOptions,
): NormalizedBooleanTableColumn {
  return {
    ...NormalizeBaseTableColumn({
      type: 'boolean',
      ...column,
    }, backend),
    kind: TableColumnKind.BOOLEAN,
  };
}
