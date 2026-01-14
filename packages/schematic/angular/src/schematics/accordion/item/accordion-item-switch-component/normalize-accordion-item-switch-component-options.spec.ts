import { NormalizeSwitchAccordionItem } from '@rxap/schematic-angular';
import { NormalizeAccordionItemStandaloneComponentOptions } from '../../accordion-item-component/normalize-accordion-item-standalone-component-options';
import { NormalizeAccordionItemSwitchComponentOptions } from './normalize-accordion-item-switch-component-options';

jest.mock('@rxap/schematic-angular', () => ({
  NormalizeSwitchAccordionItem: jest.fn((o) => ({ ...o, kind: 'switch' })),
}));

jest.mock('../../accordion-item-component/normalize-accordion-item-standalone-component-options', () => ({
  NormalizeAccordionItemStandaloneComponentOptions: jest.fn((o) => ({ ...o, name: 'test' })),
}));

describe('NormalizeAccordionItemSwitchComponentOptions', () => {
  it('should normalize accordion item switch component options', () => {
    const options = { };
    const result = NormalizeAccordionItemSwitchComponentOptions(options as any);

    expect(NormalizeAccordionItemStandaloneComponentOptions).toHaveBeenCalledWith(options);
    expect(NormalizeSwitchAccordionItem).toHaveBeenCalledWith(options);
    expect(result.name).toBe('test');
    expect(result.kind).toBe('switch');
  });
});
