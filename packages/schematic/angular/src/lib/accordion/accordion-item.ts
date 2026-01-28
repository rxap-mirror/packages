import { BackendOptions } from '../backend/backend-options';
import { AccordionItemKinds } from './accordion-item-kind';
import {
  BaseAccordionItem,
  NormalizeBaseAccordionItem,
  NormalizedBaseAccordionItem,
} from './item/base-accordion-item';
import {
  DataGridAccordionItem,
  NormalizeDataGridAccordionItem,
  NormalizedDataGridAccordionItem,
} from './item/data-grid-accordion-item';
import {
  NestedAccordionItem,
  NormalizedNestedAccordionItem,
  NormalizeNestedAccordionItem,
} from './item/nested-accordion-item';
import {
  NormalizedSwitchAccordionItem,
  NormalizeSwitchAccordionItem,
  SwitchAccordionItem,
} from './item/switch-accordion-item';
import {
  NormalizedTableAccordionItem,
  NormalizeTableAccordionItem,
  TableAccordionItem,
} from './item/table-accordion-item';
import {
  NormalizedTreeTableAccordionItem,
  NormalizeTreeTableAccordionItem,
  TreeTableAccordionItem,
} from './item/tree-table-accordion-item';

export type AccordionItem = BaseAccordionItem | DataGridAccordionItem | SwitchAccordionItem | TableAccordionItem
  | TreeTableAccordionItem | NestedAccordionItem;

export type NormalizedAccordionItem = NormalizedBaseAccordionItem | NormalizedDataGridAccordionItem
  | NormalizedSwitchAccordionItem | NormalizedTableAccordionItem | NormalizedTreeTableAccordionItem
  | NormalizedNestedAccordionItem;

export function NormalizeAccordionItem(item: AccordionItem, backend: BackendOptions): NormalizedBaseAccordionItem {
  switch (item.kind) {
    case AccordionItemKinds.DataGrid:
      return NormalizeDataGridAccordionItem(item as DataGridAccordionItem, backend);
    case AccordionItemKinds.Switch:
      return NormalizeSwitchAccordionItem(item as SwitchAccordionItem, backend);
    case AccordionItemKinds.Table:
      return NormalizeTableAccordionItem(item as TableAccordionItem);
    case AccordionItemKinds.TreeTable:
      return NormalizeTreeTableAccordionItem(item as TreeTableAccordionItem);
    case AccordionItemKinds.Nested:
      return NormalizeNestedAccordionItem(item as NestedAccordionItem, backend);
    default:
      return NormalizeBaseAccordionItem(item);
  }
}

export function NormalizeAccordionItemList(itemList: Array<BaseAccordionItem> = [], backend: BackendOptions): ReadonlyArray<NormalizedBaseAccordionItem> {
  return Object.freeze((
    itemList ?? []
  ).map(item => NormalizeAccordionItem(item, backend)));
}
