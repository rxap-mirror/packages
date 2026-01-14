import { AccordionItemKinds, IsAccordionItemKind } from './accordion-item-kind';

describe('AccordionItemKinds', () => {
  it('should have the expected values', () => {
    expect(AccordionItemKinds.Default).toBe('default');
    expect(AccordionItemKinds.Table).toBe('table');
    expect(AccordionItemKinds.DataGrid).toBe('data-grid');
    expect(AccordionItemKinds.TreeTable).toBe('tree-table');
    expect(AccordionItemKinds.Switch).toBe('switch');
    expect(AccordionItemKinds.Nested).toBe('nested');
  });

  describe('IsAccordionItemKind', () => {
    it('should return true for valid kinds', () => {
      expect(IsAccordionItemKind('default')).toBe(true);
      expect(IsAccordionItemKind('table')).toBe(true);
      expect(IsAccordionItemKind('data-grid')).toBe(true);
    });

    it('should return false for invalid kinds', () => {
      expect(IsAccordionItemKind('invalid')).toBe(false);
    });
  });
});
