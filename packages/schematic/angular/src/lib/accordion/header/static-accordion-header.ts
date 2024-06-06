import { Normalized } from '@rxap/utilities';
import { AccordionHeaderKinds } from '../accordion-header-kind';
import {
  BaseAccordionHeader,
  NormalizeBaseAccordionHeader,
  NormalizedBaseAccordionHeader,
} from './base-accordion-header';

export interface StaticAccordionHeader extends BaseAccordionHeader {
  title?: string;
}

export interface NormalizedStaticAccordionHeader extends Readonly<Normalized<Omit<StaticAccordionHeader, keyof BaseAccordionHeader>> & NormalizedBaseAccordionHeader> {
  kind: AccordionHeaderKinds.Static;
  title: string;
}

export function NormalizeStaticAccordionHeader(header: StaticAccordionHeader): NormalizedStaticAccordionHeader {
  if (!header.title) {
    throw new Error('The title property is required for a static accordion header');
  }
  return Object.freeze({
    ...NormalizeBaseAccordionHeader(header),
    kind: AccordionHeaderKinds.Static,
    title: header.title,
  });
}
