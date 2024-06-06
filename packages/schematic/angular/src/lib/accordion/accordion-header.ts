import { AccordionHeaderKinds } from './accordion-header-kind';
import {
  BaseAccordionHeader,
  NormalizeBaseAccordionHeader,
  NormalizedBaseAccordionHeader,
} from './header/base-accordion-header';
import {
  NormalizedPropertyAccordionHeader,
  NormalizePropertyAccordionHeader,
  PropertyAccordionHeader,
} from './header/property-accordion-header';
import {
  NormalizedStaticAccordionHeader,
  NormalizeStaticAccordionHeader,
  StaticAccordionHeader,
} from './header/static-accordion-header';

export type AccordionHeader = BaseAccordionHeader | StaticAccordionHeader | PropertyAccordionHeader

export type NormalizedAccordionHeader = NormalizedBaseAccordionHeader | NormalizedStaticAccordionHeader | NormalizedPropertyAccordionHeader;

export function NormalizeAccordionHeader(item?: AccordionHeader): NormalizedBaseAccordionHeader | null {
  if (!item || Object.keys(item).length === 0) {
    return null;
  }
  switch (item.kind) {
    case AccordionHeaderKinds.Static:
      return NormalizeStaticAccordionHeader(item);
    case AccordionHeaderKinds.Property:
      return NormalizePropertyAccordionHeader(item);
    default:
      return NormalizeBaseAccordionHeader(item);
  }
}
