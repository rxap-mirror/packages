import { CoerceAccordionItemTableComponentRule } from './coerce-accordion-item-table-component';

jest.mock('@rxap/schematics-ts-morph', () => ({
  CoerceComponentRule: jest.fn((o) => () => {}),
}));

describe('CoerceAccordionItemTableComponentRule', () => {
  it('should return a rule function', () => {
    const options = { accordionItem: { name: 'test', importList: [] } };
    const rule = CoerceAccordionItemTableComponentRule(options as any);
    expect(typeof rule).toBe('function');
  });
});
