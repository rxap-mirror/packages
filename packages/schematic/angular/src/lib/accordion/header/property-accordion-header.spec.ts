import {
  NormalizePropertyAccordionHeader,
  IsPropertyAccordionHeader,
  IsNormalizedPropertyAccordionHeader,
} from './property-accordion-header';
import { AccordionHeaderKinds } from '../accordion-header-kind';
import * as tsMorph from '@rxap/ts-morph';

jest.mock('@rxap/ts-morph', () => ({
  NormalizeDataProperty: jest.fn((p) => ({ name: p })),
  NormalizeDataPropertyList: jest.fn((list) => list),
  NormalizeTypeImportList: jest.fn((list) => list),
}));

jest.mock('../../load-handlebars-template', () => ({
  LoadHandlebarsTemplate: jest.fn(() => 'mock-handlebars'),
}));

describe('PropertyAccordionHeader Utilities', () => {
  describe('NormalizePropertyAccordionHeader', () => {
    it('should normalize property header', () => {
      const header = { property: 'testProp' as any };
      const result = NormalizePropertyAccordionHeader(header);

      expect(result.kind).toBe(AccordionHeaderKinds.Property);
      expect(result.property).toEqual({ name: 'testProp' });
    });

    it('should throw if property is missing', () => {
      expect(() => NormalizePropertyAccordionHeader({} as any)).toThrow('The property property is required for a property accordion header');
    });
  });

  describe('IsPropertyAccordionHeader', () => {
    it('should return true if kind is Property', () => {
      expect(IsPropertyAccordionHeader({ kind: AccordionHeaderKinds.Property })).toBe(true);
    });
    it('should return false otherwise', () => {
      expect(IsPropertyAccordionHeader({ kind: AccordionHeaderKinds.Static })).toBe(false);
    });
  });

  describe('IsNormalizedPropertyAccordionHeader', () => {
    it('should return true if kind is Property', () => {
      expect(IsNormalizedPropertyAccordionHeader({ kind: AccordionHeaderKinds.Property } as any)).toBe(true);
    });
  });
});
