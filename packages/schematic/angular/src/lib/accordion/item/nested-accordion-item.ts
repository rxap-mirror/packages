import { dasherize } from '@rxap/schematics-utilities';
import { NormalizeTypeImportList } from '@rxap/ts-morph';
import {
  classify,
  CoerceArrayItems,
  Normalized,
} from '@rxap/utilities';
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
  const accordionImportList = item.accordionImportList ?? [];
  CoerceArrayItems(accordionImportList, [{
    name: `${classify(item.name)}AccordionComponent`,
    moduleSpecifier: `./${dasherize(item.name)}-accordion/${dasherize(item.name)}-accordion.component`
  }], (a, b) => a.name === b.name);
  return Object.freeze({
    ...NormalizeBaseAccordionItem(item),
    accordionImportList: NormalizeTypeImportList(accordionImportList),
    kind: AccordionItemKinds.Nested,
    accordion: NormalizeAccordion({
      name: item.name,
      identifier: item.identifier,
      upstream: item.upstream,
      ...item.accordion,
    }),
  });
}
