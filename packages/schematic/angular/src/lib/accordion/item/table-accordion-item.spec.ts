import { NormalizeTableAccordionItem, IsTableAccordionItem, IsNormalizedTableAccordionItem } from './table-accordion-item';
import { AccordionItemKinds } from '../accordion-item-kind';
import { NormalizeBaseAccordionItem } from './base-accordion-item';
import { NormalizeTableOptions } from '../../table-options';

jest.mock('./base-accordion-item', () => ({
  NormalizeBaseAccordionItem: jest.fn((item) => ({ ...item, name: 'base-name' })),
}));
jest.mock('../../table-options', () => ({
  NormalizeTableOptions: jest.fn((options) => options),
}));

describe('TableAccordionItem Utilities', () => {
  it('should normalize table item', () => {
    const item = { kind: AccordionItemKinds.Table, table: {} };
    const result = NormalizeTableAccordionItem(item as any);

    expect(result.kind).toBe(AccordionItemKinds.Table);
    expect(NormalizeTableOptions).toHaveBeenCalledWith({}, 'base-name');
  });

  describe('Type Guards', () => {
    it('IsTableAccordionItem', () => {
      expect(IsTableAccordionItem({ kind: AccordionItemKinds.Table } as any)).toBe(true);
    });
    it('IsNormalizedTableAccordionItem', () => {
      expect(IsNormalizedTableAccordionItem({ kind: AccordionItemKinds.Table } as any)).toBe(true);
    });
  });
});
