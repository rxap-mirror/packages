import { NormalizeTableAccordionItem } from '@rxap/schematic-angular';
import { NormalizeAccordionItemStandaloneComponentOptions } from '../../accordion-item-component/normalize-accordion-item-standalone-component-options';
import { NormalizeAccordionItemTableComponentOptions } from './normalize-accordion-item-table-component-options';

jest.mock('@rxap/schematic-angular', () => ({
  NormalizeTableAccordionItem: jest.fn((o) => ({ ...o, kind: 'table' })),
}));

jest.mock('../../accordion-item-component/normalize-accordion-item-standalone-component-options', () => ({
  NormalizeAccordionItemStandaloneComponentOptions: jest.fn((o) => ({ ...o, name: 'test' })),
}));

describe('NormalizeAccordionItemTableComponentOptions', () => {
  it('should normalize accordion item table component options', () => {
    const options = { };
    const result = NormalizeAccordionItemTableComponentOptions(options as any);

    expect(NormalizeAccordionItemStandaloneComponentOptions).toHaveBeenCalledWith(options);
    expect(NormalizeTableAccordionItem).toHaveBeenCalledWith(options);
    expect(result.name).toBe('test');
    expect(result.kind).toBe('table');
  });
});
