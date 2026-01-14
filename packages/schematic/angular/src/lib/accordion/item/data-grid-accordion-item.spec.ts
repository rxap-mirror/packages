import { NormalizeDataGridAccordionItem, IsDataGridAccordionItem, IsNormalizedDataGridAccordionItem } from './data-grid-accordion-item';
import { AccordionItemKinds } from '../accordion-item-kind';
import { NormalizeBaseAccordionItem } from './base-accordion-item';
import { NormalizeDataGridOptions } from '../../data-grid-options';

jest.mock('./base-accordion-item', () => ({
  NormalizeBaseAccordionItem: jest.fn((item) => ({ ...item, propertyList: [] })),
}));
jest.mock('../../data-grid-options', () => ({
  NormalizeDataGridOptions: jest.fn((options) => options),
}));

describe('DataGridAccordionItem Utilities', () => {
  it('should normalize data grid item', () => {
    const item = { kind: AccordionItemKinds.DataGrid, dataGrid: { propertyList: [] } };
    const result = NormalizeDataGridAccordionItem(item as any);

    expect(result.kind).toBe(AccordionItemKinds.DataGrid);
    expect(NormalizeBaseAccordionItem).toHaveBeenCalled();
    expect(NormalizeDataGridOptions).toHaveBeenCalled();
  });

  describe('Type Guards', () => {
    it('IsDataGridAccordionItem', () => {
      expect(IsDataGridAccordionItem({ kind: AccordionItemKinds.DataGrid } as any)).toBe(true);
      expect(IsDataGridAccordionItem({ kind: AccordionItemKinds.Default } as any)).toBe(false);
    });
    it('IsNormalizedDataGridAccordionItem', () => {
      expect(IsNormalizedDataGridAccordionItem({ kind: AccordionItemKinds.DataGrid } as any)).toBe(true);
    });
  });
});
