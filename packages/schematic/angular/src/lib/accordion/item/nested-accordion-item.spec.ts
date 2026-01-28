import { BackendTypes } from '@rxap/schematic-angular';
import { NormalizeNestedAccordionItem, IsNestedAccordionItem, IsNormalizedNestedAccordionItem } from './nested-accordion-item';
import { AccordionItemKinds } from '../accordion-item-kind';
import { NormalizeBaseAccordionItem } from './base-accordion-item';
import { NormalizeAccordion } from '../accordion';

jest.mock('./base-accordion-item', () => ({
  NormalizeBaseAccordionItem: jest.fn((item) => ({ ...item })),
}));
jest.mock('../accordion', () => ({
  NormalizeAccordion: jest.fn((options) => options),
}));

describe('NestedAccordionItem Utilities', () => {
  it('should normalize nested accordion item', () => {
    const item = { name: 'nested', kind: AccordionItemKinds.Nested, accordion: { multiple: true } };
    const result = NormalizeNestedAccordionItem(item as any, { kind: BackendTypes.NONE });

    expect(result.kind).toBe(AccordionItemKinds.Nested);
    expect(NormalizeAccordion).toHaveBeenCalledWith(expect.objectContaining({ name: 'nested', multiple: true }), { kind: BackendTypes.NONE });
  });

  describe('Type Guards', () => {
    it('IsNestedAccordionItem', () => {
       expect(IsNestedAccordionItem({ kind: AccordionItemKinds.Nested } as any)).toBe(true);
    });
    it('IsNormalizedNestedAccordionItem', () => {
       expect(IsNormalizedNestedAccordionItem({ kind: AccordionItemKinds.Nested } as any)).toBe(true);
    });
  });
});
