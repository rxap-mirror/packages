import { NormalizeTreeTableAccordionItem, IsTreeTableAccordionItem, IsNormalizedTreeTableAccordionItem } from './tree-table-accordion-item';
import { AccordionItemKinds } from '../accordion-item-kind';
import { NormalizeBaseAccordionItem } from './base-accordion-item';
import { NormalizeTreeTableOptions } from '../../tree-table-options';

jest.mock('./base-accordion-item', () => ({
  NormalizeBaseAccordionItem: jest.fn((item) => ({ ...item, name: 'base-name' })),
}));
jest.mock('../../tree-table-options', () => ({
  NormalizeTreeTableOptions: jest.fn((options) => options),
}));

describe('TreeTableAccordionItem Utilities', () => {
  it('should normalize tree table item', () => {
    const item = { kind: AccordionItemKinds.TreeTable, table: {} };
    const result = NormalizeTreeTableAccordionItem(item as any);

    expect(result.kind).toBe(AccordionItemKinds.TreeTable);
    expect(NormalizeTreeTableOptions).toHaveBeenCalledWith({}, 'base-name');
  });

  describe('Type Guards', () => {
    it('IsTreeTableAccordionItem', () => {
      expect(IsTreeTableAccordionItem({ kind: AccordionItemKinds.TreeTable } as any)).toBe(true);
    });
    it('IsNormalizedTreeTableAccordionItem', () => {
      expect(IsNormalizedTreeTableAccordionItem({ kind: AccordionItemKinds.TreeTable } as any)).toBe(true);
    });
  });
});
