import { CoerceAccordionComponentRule } from './coerce-accordion-component';

jest.mock('@rxap/schematics-ts-morph', () => ({
  CoerceComponentRule: jest.fn((o) => () => {}),
}));

describe('CoerceAccordionComponentRule', () => {
  it('should return a rule function', () => {
    const options = { accordion: { itemList: [], componentName: 'test', importList: [] } };
    const rule = CoerceAccordionComponentRule(options as any);
    expect(typeof rule).toBe('function');
  });
});
