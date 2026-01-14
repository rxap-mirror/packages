import { NormalizeAccordionIdentifier } from './accordion-identifier';

jest.mock('@rxap/ts-morph', () => ({
  NormalizeDataProperty: jest.fn((p, t) => ({ ...p, type: { name: t } })),
}));

describe('NormalizeAccordionIdentifier', () => {
  it('should return null for empty input', () => {
    expect(NormalizeAccordionIdentifier()).toBeNull();
    expect(NormalizeAccordionIdentifier({} as any)).toBeNull();
  });

  it('should normalize accordion identifier', () => {
    const input = { property: { name: 'id' }, source: 'pkg' };
    const result = NormalizeAccordionIdentifier(input as any);
    expect(result!.property.name).toBe('id');
    expect(result!.source).toBe('pkg');
  });
});
