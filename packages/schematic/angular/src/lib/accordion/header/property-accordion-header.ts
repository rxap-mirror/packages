import {
  DataProperty,
  NormalizeDataProperty,
  NormalizedDataProperty,
} from '@rxap/ts-morph';
import { Normalized } from '@rxap/utilities';
import { AccordionHeaderKinds } from '../accordion-header-kind';
import {
  BaseAccordionHeader,
  NormalizeBaseAccordionHeader,
  NormalizedBaseAccordionHeader,
} from './base-accordion-header';

export interface PropertyAccordionHeader extends BaseAccordionHeader {
  property?: DataProperty;
}

export interface NormalizedPropertyAccordionHeader extends Readonly<Normalized<Omit<PropertyAccordionHeader, keyof BaseAccordionHeader>> & NormalizedBaseAccordionHeader> {
  kind: AccordionHeaderKinds.Property;
  property: NormalizedDataProperty;
}

export function IsPropertyAccordionHeader(header: BaseAccordionHeader): header is PropertyAccordionHeader {
  return header.kind === AccordionHeaderKinds.Property;
}

export function IsNormalizedPropertyAccordionHeader(header: NormalizedBaseAccordionHeader): header is NormalizedPropertyAccordionHeader {
  return header.kind === AccordionHeaderKinds.Property;
}

export function NormalizePropertyAccordionHeader(header: PropertyAccordionHeader): NormalizedPropertyAccordionHeader {
  if (!header.property) {
    throw new Error('The property property is required for a property accordion header');
  }
  const property = NormalizeDataProperty(header.property, 'string');
  return Object.freeze({
    ...NormalizeBaseAccordionHeader(header, [property]),
    kind: AccordionHeaderKinds.Property,
    property,
  });
}
