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

export function NormalizeAccordionItem(item: AccordionItem): NormalizedBaseAccordionItem {
  switch (item.kind) {
    case AccordionItemKinds.DataGrid:
      return NormalizeDataGridAccordionItem(item as DataGridAccordionItem);
    case AccordionItemKinds.Switch:
      return NormalizeSwitchAccordionItem(item as SwitchAccordionItem);
    case AccordionItemKinds.Table:
      return NormalizeTableAccordionItem(item as TableAccordionItem);
    case AccordionItemKinds.TreeTable:
      return NormalizeTreeTableAccordionItem(item as TreeTableAccordionItem);
    case AccordionItemKinds.Nested:
      return NormalizeNestedAccordionItem(item as NestedAccordionItem);
    default:
      return NormalizeBaseAccordionItem(item);
  }
}

export function NormalizeAccordionItemList(itemList?: Array<BaseAccordionItem>): ReadonlyArray<NormalizedBaseAccordionItem> {
  return Object.freeze((
    itemList ?? []
  ).map(NormalizeAccordionItem));
}
