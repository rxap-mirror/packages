import { Normalized } from '@rxap/utilities';
import {
  Accordion,
  NormalizeAccordion,
  NormalizedAccordion,
} from '../accordion';
import { AccordionItemKinds } from '../accordion-item-kind';
import {
  BaseAccordionItem,
  NormalizeBaseAccordionItem,
  NormalizedBaseAccordionItem,
} from './base-accordion-item';

export interface NestedAccordionItem extends BaseAccordionItem {
  accordion: Partial<Accordion>;
}

export function IsNestedAccordionItem(item: BaseAccordionItem): item is NestedAccordionItem {
  return item.kind === AccordionItemKinds.Nested;
}

export interface NormalizedNestedAccordionItem extends Readonly<Normalized<Omit<NestedAccordionItem, keyof BaseAccordionItem | 'accordion'>> & NormalizedBaseAccordionItem> {
  kind: AccordionItemKinds.Nested;
  accordion: NormalizedAccordion
}

export function IsNormalizedNestedAccordionItem(item: NormalizedBaseAccordionItem): item is NormalizedNestedAccordionItem {
  return item.kind === AccordionItemKinds.Nested;
}

export function NormalizeNestedAccordionItem(item: Readonly<NestedAccordionItem>): NormalizedNestedAccordionItem {
  return Object.freeze({
    ...NormalizeBaseAccordionItem(item),
    kind: AccordionItemKinds.Nested,
    accordion: NormalizeAccordion({
      name: item.name,
      identifier: item.identifier,
      upstream: item.upstream,
      ...item.accordion,
    }),
  });
}
