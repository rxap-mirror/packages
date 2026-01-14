import { NormalizeNestedAccordionItem } from '@rxap/schematic-angular';
import { NormalizeAccordionItemStandaloneComponentOptions } from '../../accordion-item-component/normalize-accordion-item-standalone-component-options';
import { NormalizeAccordionItemNestedComponentOptions } from './normalize-accordion-item-nested-component-options';

jest.mock('@rxap/schematic-angular', () => ({
  NormalizeNestedAccordionItem: jest.fn((o) => ({ ...o, kind: 'nested' })),
}));

jest.mock('../../accordion-item-component/normalize-accordion-item-standalone-component-options', () => ({
  NormalizeAccordionItemStandaloneComponentOptions: jest.fn((o) => ({ ...o, name: 'test' })),
}));

describe('NormalizeAccordionItemNestedComponentOptions', () => {
  it('should normalize accordion item nested component options', () => {
    const options = { };
    const result = NormalizeAccordionItemNestedComponentOptions(options as any);

    expect(NormalizeAccordionItemStandaloneComponentOptions).toHaveBeenCalledWith(options);
    expect(NormalizeNestedAccordionItem).toHaveBeenCalledWith(options);
    expect(result.name).toBe('test');
    expect(result.kind).toBe('nested');
  });
});
