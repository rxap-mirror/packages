import { NormalizeTreeTableAccordionItem } from '@rxap/schematic-angular';
import { NormalizeAccordionItemStandaloneComponentOptions } from '../../accordion-item-component/normalize-accordion-item-standalone-component-options';
import { NormalizeAccordionItemTreeTableComponentOptions } from './normalize-accordion-item-tree-table-component-options';

jest.mock('@rxap/schematic-angular', () => ({
  NormalizeTreeTableAccordionItem: jest.fn((o) => ({ ...o, kind: 'tree-table' })),
}));

jest.mock('../../accordion-item-component/normalize-accordion-item-standalone-component-options', () => ({
  NormalizeAccordionItemStandaloneComponentOptions: jest.fn((o) => ({ ...o, name: 'test' })),
}));

describe('NormalizeAccordionItemTreeTableComponentOptions', () => {
  it('should normalize accordion item tree table component options', () => {
    const options = { };
    const result = NormalizeAccordionItemTreeTableComponentOptions(options as any);

    expect(NormalizeAccordionItemStandaloneComponentOptions).toHaveBeenCalledWith(options);
    expect(NormalizeTreeTableAccordionItem).toHaveBeenCalledWith(options);
    expect(result.name).toBe('test');
    expect(result.kind).toBe('tree-table');
  });
});
