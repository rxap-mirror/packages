import { NormalizeSwitchAccordionItem, IsSwitchAccordionItem, IsNormalizedSwitchAccordionItem } from './switch-accordion-item';
import { AccordionItemKinds } from '../accordion-item-kind';
import { NormalizeBaseAccordionItem } from './base-accordion-item';
import { NormalizeAccordionItemList } from '../accordion-item';
import * as tsMorph from '@rxap/ts-morph';

jest.mock('./base-accordion-item', () => ({
  NormalizeBaseAccordionItem: jest.fn((item) => ({ 
    ...item, 
    name: item.name,
    importList: [],
    accordionImportList: [],
    propertyList: []
  })),
}));
jest.mock('../accordion-item', () => ({
  NormalizeAccordionItemList: jest.fn((list) => list?.map((item: any) => ({
    ...item,
    importList: [],
    accordionImportList: [],
    propertyList: []
  })) ?? []),
}));
jest.mock('@rxap/ts-morph', () => ({
  NormalizeDataProperty: jest.fn((p) => ({ name: p })),
  NormalizeTypeImportList: jest.fn((l) => l),
}));

describe('SwitchAccordionItem Utilities', () => {
  it('should normalize switch item', () => {
    const item = {
      kind: AccordionItemKinds.Switch,
      name: 'test-switch',
      switch: {
        property: 'type',
        case: [
          { test: 'A', itemList: [{ name: 'ItemA' }] }
        ]
      }
    };
    const result = NormalizeSwitchAccordionItem(item as any);

    expect(result.kind).toBe(AccordionItemKinds.Switch);
    expect(result.switch.property).toEqual({ name: 'type' });
    expect(result.switch.case[0].test).toBe('A');
  });

  it('should throw if no cases and no default case', () => {
    const item = { name: 'test', switch: { property: 'p', case: [] } };
    expect(() => NormalizeSwitchAccordionItem(item as any)).toThrow('The switch \'test\' has no cases or default case');
  });

  describe('Type Guards', () => {
    it('IsSwitchAccordionItem', () => {
      expect(IsSwitchAccordionItem({ kind: AccordionItemKinds.Switch } as any)).toBe(true);
    });
    it('IsNormalizedSwitchAccordionItem', () => {
      expect(IsNormalizedSwitchAccordionItem({ kind: AccordionItemKinds.Switch } as any)).toBe(true);
    });
  });
});
