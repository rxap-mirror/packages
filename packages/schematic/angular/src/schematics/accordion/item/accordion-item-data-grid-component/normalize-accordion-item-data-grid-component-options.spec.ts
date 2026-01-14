import { NormalizeDataGridAccordionItem } from '@rxap/schematic-angular';
import { NormalizeAccordionItemStandaloneComponentOptions } from '../../accordion-item-component/normalize-accordion-item-standalone-component-options';
import { NormalizeAccordionItemDataGridComponentOptions } from './normalize-accordion-item-data-grid-component-options';

jest.mock('@rxap/schematic-angular', () => ({
  NormalizeDataGridAccordionItem: jest.fn((o) => ({ ...o, kind: 'data-grid' })),
}));

jest.mock('../../accordion-item-component/normalize-accordion-item-standalone-component-options', () => ({
  NormalizeAccordionItemStandaloneComponentOptions: jest.fn((o) => ({ ...o, name: 'test' })),
}));

describe('NormalizeAccordionItemDataGridComponentOptions', () => {
  it('should normalize accordion item data grid component options', () => {
    const options = { };
    const result = NormalizeAccordionItemDataGridComponentOptions(options as any);

    expect(NormalizeAccordionItemStandaloneComponentOptions).toHaveBeenCalledWith(options);
    expect(NormalizeDataGridAccordionItem).toHaveBeenCalledWith(options);
    expect(result.name).toBe('test');
    expect(result.kind).toBe('data-grid');
  });
});
