import { NormalizeComponentOptions } from './component-options';

jest.mock('@rxap/ts-morph', () => ({
  NormalizeTypeImport: jest.fn((o) => o),
}));

describe('NormalizeComponentOptions', () => {
  it('should normalize component options', () => {
    const input = { name: 'TestComponent' };
    const result = NormalizeComponentOptions(input as any);
    expect(result.name).toBe('test');
    expect(result.namedImport).toBe('TestComponent');
  });
});
