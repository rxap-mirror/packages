import { Normalized } from '@rxap/utilities';
import { NormalizeAccordionItemList } from '../accordion-item';
import { AccordionItemKinds } from '../accordion-item-kind';
import {
  BaseAccordionItem,
  NormalizeBaseAccordionItem,
  NormalizedBaseAccordionItem,
} from './base-accordion-item';

export interface NestedAccordionItem extends BaseAccordionItem {
  itemList: Array<BaseAccordionItem & Partial<BaseAccordionItem>>
}

export function IsNestedAccordionItem(item: BaseAccordionItem): item is NestedAccordionItem {
  return item.kind === AccordionItemKinds.Nested;
}

export interface NormalizedNestedAccordionItem extends Readonly<Normalized<Omit<NestedAccordionItem, keyof BaseAccordionItem | 'itemList'>> & NormalizedBaseAccordionItem> {
  kind: AccordionItemKinds.Nested;
  itemList: ReadonlyArray<NormalizedBaseAccordionItem>
}

export function IsNormalizedNestedAccordionItem(item: NormalizedBaseAccordionItem): item is NormalizedNestedAccordionItem {
  return item.kind === AccordionItemKinds.Nested;
}

export function NormalizeNestedAccordionItem(item: Readonly<NestedAccordionItem>): NormalizedNestedAccordionItem {
  return Object.freeze({
    ...NormalizeBaseAccordionItem(item),
    kind: AccordionItemKinds.Nested,
    itemList: NormalizeAccordionItemList(item.itemList),
  });
}
