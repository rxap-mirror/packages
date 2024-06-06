import { Normalized } from '@rxap/utilities';
import {
  BaseAccordionItem,
  NormalizeBaseAccordionItem,
  NormalizedBaseAccordionItem,
} from './base-accordion-item';
import { AccordionItemKinds } from '../accordion-item-kind';
import {
  NormalizedTreeTableOptions,
  NormalizeTreeTableOptions,
  TreeTableOptions,
} from '../../tree-table-options';

export interface TreeTableAccordionItem extends BaseAccordionItem {
  table: TreeTableOptions;
}

export function IsTreeTableAccordionItem(item: BaseAccordionItem): item is TreeTableAccordionItem {
  return item.kind === AccordionItemKinds.TreeTable;
}

export interface NormalizedTreeTableAccordionItem extends Readonly<Normalized<Omit<TreeTableAccordionItem, keyof BaseAccordionItem |  'table'>> & NormalizedBaseAccordionItem> {
  kind: AccordionItemKinds.TreeTable;
  table: NormalizedTreeTableOptions;
}

export function IsNormalizedTreeTableAccordionItem(item: NormalizedBaseAccordionItem): item is NormalizedTreeTableAccordionItem {
  return item.kind === AccordionItemKinds.TreeTable;
}

export function NormalizeTreeTableAccordionItem(item: TreeTableAccordionItem): NormalizedTreeTableAccordionItem {
  const base = NormalizeBaseAccordionItem(item);
  const { name } = base;
  return Object.freeze({
    ...base,
    kind: AccordionItemKinds.TreeTable,
    table: NormalizeTreeTableOptions(item.table, name),
  });

}
