import { Normalized } from '@rxap/utilities';
import {
  BaseAccordionItem,
  NormalizeBaseAccordionItem,
  NormalizedBaseAccordionItem,
} from './base-accordion-item';
import { AccordionItemKinds } from '../accordion-item-kind';
import {
  NormalizedTableOptions,
  NormalizeTableOptions,
  TableOptions,
} from '../../table-options';

export interface TableAccordionItem extends BaseAccordionItem {
  table: TableOptions;
}

export function IsTableAccordionItem(item: BaseAccordionItem): item is TableAccordionItem {
  return item.kind === AccordionItemKinds.Table;
}

export interface NormalizedTableAccordionItem extends Readonly<Normalized<Omit<TableAccordionItem, keyof BaseAccordionItem | 'table'>> & NormalizedBaseAccordionItem> {
  kind: AccordionItemKinds.Table;
  table: NormalizedTableOptions;
}

export function IsNormalizedTableAccordionItem(item: NormalizedBaseAccordionItem): item is NormalizedTableAccordionItem {
  return item.kind === AccordionItemKinds.Table;
}

export function NormalizeTableAccordionItem(item: TableAccordionItem): NormalizedTableAccordionItem {
  const base = NormalizeBaseAccordionItem(item);
  const { name } = base;
  return Object.freeze({
    ...base,
    kind: AccordionItemKinds.Table,
    table: NormalizeTableOptions(item.table, name),
  });
}
