import {
  NormalizedTypeImport,
  TypeImport,
} from '@rxap/ts-morph';
import {
  NonNullableSelected,
  Normalized,
} from '@rxap/utilities';
import { NormalizedBaseFormControl } from './form-control';
import {
  FormDefinitionControl,
  NormalizedFormDefinitionControl,
  NormalizeFormDefinitionControl,
} from './form-definition-control';

export interface DataGridItem extends FormDefinitionControl {
  name: string;
  type?: string | TypeImport;
  header?: string;
}

export interface NormalizedDataGridItem extends Omit<Readonly<Normalized<DataGridItem>>, 'type' | 'importList'>, NormalizedFormDefinitionControl {}

export function NormalizeDataGridItem(item: Readonly<DataGridItem>): NormalizedDataGridItem {
  let header: string | null = null;
  header = item.header ?? null;
  return Object.freeze({
    ...NormalizeFormDefinitionControl(item),
    header,
  });
}

export function NormalizeDataGridItemList(
  itemList?: Array<Readonly<DataGridItem>>,
): ReadonlyArray<NormalizedDataGridItem> {
  return Object.freeze(itemList?.map(NormalizeDataGridItem) ?? []);
}
