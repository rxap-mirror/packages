import { ExecuteSchematic } from '@rxap/schematics-utilities';
import { accordionComponentRule } from './accordion-component-rule';

jest.mock('@rxap/schematics-utilities', () => ({
  ExecuteSchematic: jest.fn(() => 'rule'),
}));

jest.mock('@rxap/schematics-ts-morph', () => ({
  BuildNestControllerName: jest.fn(() => 'NestController'),
}));

jest.mock('@rxap/utilities', () => ({
  CoerceSuffix: jest.fn((n, s) => n + s),
}));

describe('accordionComponentRule', () => {
  it('should call ExecuteSchematic with correct parameters', () => {
    const options = { name: 'test', accordion: { items: [] } };
    const result = accordionComponentRule(options as any);

    expect(ExecuteSchematic).toHaveBeenCalledWith('accordion-component', expect.objectContaining({
      items: [],
    }));
    expect(result).toBe('rule');
  });
});
