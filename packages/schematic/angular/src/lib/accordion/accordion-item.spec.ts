import { BackendTypes } from '@rxap/schematic-angular';
import { NormalizeAccordionItem, NormalizeAccordionItemList } from './accordion-item';
import { AccordionItemKinds } from './accordion-item-kind';
import { NormalizeDataGridAccordionItem } from './item/data-grid-accordion-item';
import { NormalizeSwitchAccordionItem } from './item/switch-accordion-item';
import { NormalizeTableAccordionItem } from './item/table-accordion-item';
import { NormalizeTreeTableAccordionItem } from './item/tree-table-accordion-item';
import { NormalizeNestedAccordionItem } from './item/nested-accordion-item';
import { NormalizeBaseAccordionItem } from './item/base-accordion-item';

jest.mock('./item/data-grid-accordion-item', () => ({ NormalizeDataGridAccordionItem: jest.fn(() => 'data-grid') }));
jest.mock('./item/switch-accordion-item', () => ({ NormalizeSwitchAccordionItem: jest.fn(() => 'switch') }));
jest.mock('./item/table-accordion-item', () => ({ NormalizeTableAccordionItem: jest.fn(() => 'table') }));
jest.mock('./item/tree-table-accordion-item', () => ({ NormalizeTreeTableAccordionItem: jest.fn(() => 'tree-table') }));
jest.mock('./item/nested-accordion-item', () => ({ NormalizeNestedAccordionItem: jest.fn(() => 'nested') }));
jest.mock('./item/base-accordion-item', () => ({ NormalizeBaseAccordionItem: jest.fn(() => 'base') }));

describe('NormalizeAccordionItem Multiplexer', () => {
  it('should route to NormalizeDataGridAccordionItem', () => {
    NormalizeAccordionItem({ kind: AccordionItemKinds.DataGrid } as any, { kind: BackendTypes.NONE });
    expect(NormalizeDataGridAccordionItem).toHaveBeenCalled();
  });

  it('should route to NormalizeSwitchAccordionItem', () => {
    NormalizeAccordionItem({ kind: AccordionItemKinds.Switch } as any, { kind: BackendTypes.NONE });
    expect(NormalizeSwitchAccordionItem).toHaveBeenCalled();
  });

  it('should route to NormalizeTableAccordionItem', () => {
    NormalizeAccordionItem({ kind: AccordionItemKinds.Table } as any, { kind: BackendTypes.NONE });
    expect(NormalizeTableAccordionItem).toHaveBeenCalled();
  });

  it('should route to NormalizeBaseAccordionItem by default', () => {
    NormalizeAccordionItem({ kind: AccordionItemKinds.Default } as any, { kind: BackendTypes.NONE });
    expect(NormalizeBaseAccordionItem).toHaveBeenCalled();
  });

  describe('NormalizeAccordionItemList', () => {
    it('should return frozen empty array for empty input', () => {
      const result = NormalizeAccordionItemList([], { kind: BackendTypes.NONE });
      expect(result).toEqual([]);
      expect(Object.isFrozen(result)).toBe(true);
    });

    it('should map over items', () => {
      const result = NormalizeAccordionItemList([{ kind: AccordionItemKinds.Default } as any], { kind: BackendTypes.NONE });
      expect(result).toEqual(['base']);
    });
  });
});
