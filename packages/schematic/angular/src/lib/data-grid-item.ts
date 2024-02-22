import {
  NormalizedTypeImport,
  TypeImport,
} from '@rxap/ts-morph';
import {
  NonNullableSelected,
  Normalized,
} from '@rxap/utilities';
import {
  BaseFormControlTemplate,
  FormDefinitionControl,
  NormalizedFormDefinitionControl,
  NormalizeFormDefinitionControl,
} from './form-definition-control';

export interface DataGridItem extends FormDefinitionControl {
  name: string;
  type?: string | TypeImport;
  header?: string;
}

export interface NormalizedDataGridItem extends Readonly<NonNullableSelected<Normalized<DataGridItem>, 'type'>>, Omit<NormalizedFormDefinitionControl, 'type'> {
  type: NormalizedTypeImport;
  template: BaseFormControlTemplate;
  importList: NormalizedTypeImport[];
}

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
