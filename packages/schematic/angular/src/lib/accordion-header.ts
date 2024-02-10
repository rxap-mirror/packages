export interface StaticAccordionHeader {
  title: string;
}

export interface PropertyAccordionHeader {
  property: {
    name: string;
    type?: string;
  };
}

export type AccordionHeader = StaticAccordionHeader | PropertyAccordionHeader;

export interface NormalizedStaticAccordionHeader {
  title: string;
}

export interface NormalizedPropertyAccordionHeader {
  property: {
    name: string;
    type: string;
  };
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
      return header;
    } else if (IsPropertyAccordionHeader(header)) {
      return {
        property: {
          name: header.property.name,
          type: header.property.type ?? 'string'
        }
      };
    }
  }
  return null;
}

