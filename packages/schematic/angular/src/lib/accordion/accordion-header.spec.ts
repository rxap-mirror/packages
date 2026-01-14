import { NormalizeAccordionHeader } from './accordion-header';
import { AccordionHeaderKinds } from './accordion-header-kind';
import { NormalizeStaticAccordionHeader } from './header/static-accordion-header';
import { NormalizePropertyAccordionHeader } from './header/property-accordion-header';
import { NormalizeBaseAccordionHeader } from './header/base-accordion-header';

jest.mock('./header/static-accordion-header', () => ({
  NormalizeStaticAccordionHeader: jest.fn(() => 'static'),
}));
jest.mock('./header/property-accordion-header', () => ({
  NormalizePropertyAccordionHeader: jest.fn(() => 'property'),
}));
jest.mock('./header/base-accordion-header', () => ({
  NormalizeBaseAccordionHeader: jest.fn(() => 'base'),
}));

describe('NormalizeAccordionHeader', () => {
  it('should return null for empty input', () => {
    expect(NormalizeAccordionHeader(undefined)).toBeNull();
    expect(NormalizeAccordionHeader({} as any)).toBeNull();
  });

  it('should route to NormalizeStaticAccordionHeader', () => {
    NormalizeAccordionHeader({ kind: AccordionHeaderKinds.Static } as any);
    expect(NormalizeStaticAccordionHeader).toHaveBeenCalled();
  });

  it('should route to NormalizePropertyAccordionHeader', () => {
    NormalizeAccordionHeader({ kind: AccordionHeaderKinds.Property } as any);
    expect(NormalizePropertyAccordionHeader).toHaveBeenCalled();
  });

  it('should route to NormalizeBaseAccordionHeader by default', () => {
    NormalizeAccordionHeader({ kind: AccordionHeaderKinds.Default } as any);
    expect(NormalizeBaseAccordionHeader).toHaveBeenCalled();
  });
});
