import {
  NonNullableSelected,
  Normalized,
} from '@rxap/utilities';

export interface DataGridItem {
  name: string;
  type?: string;
  header?: string;
}

export type NormalizedDataGridItem = Readonly<NonNullableSelected<Normalized<DataGridItem>, 'type'>>;

export function NormalizeDataGridItem(item: Readonly<DataGridItem> | string): NormalizedDataGridItem {
  let name: string;
  let type: string;
  let header: string | null = null;
  if (typeof item === 'string') {
    const fragments = item.split(':');
    name = fragments[0];
    type = fragments[1] || 'unknown';
  } else {
    name = item.name;
    type = item.type ?? 'unknown';
    header = item.header ?? null;
  }
  return Object.seal({
    name,
    type,
    header,
  });
}

export function NormalizeDataGridItemList(
  itemList?: Array<Readonly<DataGridItem> | string>,
): Array<NormalizedDataGridItem> {
  return Object.seal(itemList?.map(NormalizeDataGridItem) ?? []);
}
