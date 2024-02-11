import {
  DataProperty,
  NormalizeDataProperty,
  NormalizedDataProperty,
} from './data-property';

export interface StaticAccordionHeader {
  title: string;
}

export interface PropertyAccordionHeader {
  property: DataProperty;
}

export type AccordionHeader = StaticAccordionHeader | PropertyAccordionHeader;

export interface NormalizedStaticAccordionHeader {
  title: string;
}

export interface NormalizedPropertyAccordionHeader {
  property: NormalizedDataProperty;
}

export type NormalizedAccordionHeader = NormalizedStaticAccordionHeader | NormalizedPropertyAccordionHeader;

export function IsStaticAccordionHeader(header: AccordionHeader): header is StaticAccordionHeader {
  return (header as StaticAccordionHeader).title !== undefined;
}

export function IsPropertyAccordionHeader(header: AccordionHeader): header is PropertyAccordionHeader {
  return (header as PropertyAccordionHeader).property !== undefined;
}

export function IsNormalizedStaticAccordionHeader(header: NormalizedAccordionHeader): header is NormalizedStaticAccordionHeader {
  return (header as NormalizedStaticAccordionHeader).title !== undefined;
}

export function IsNormalizedPropertyAccordionHeader(header: NormalizedAccordionHeader): header is NormalizedPropertyAccordionHeader {
  return (header as NormalizedPropertyAccordionHeader).property !== undefined;
}

export function NormalizeAccordionHeader(header?: AccordionHeader): NormalizedAccordionHeader | null {
  if (header) {
    if (IsStaticAccordionHeader(header)) {
      return {
        title: header.title,
      };
    } else if (IsPropertyAccordionHeader(header)) {
      return {
        property: NormalizeDataProperty(header.property, 'string'),
      };
    }
  }
  return null;
}

