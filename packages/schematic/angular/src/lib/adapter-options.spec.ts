import { NormalizeAdapterOptions } from './adapter-options';

jest.mock('@rxap/ts-morph', () => ({
  NormalizeTypeImport: jest.fn((o) => o),
}));

describe('NormalizeAdapterOptions', () => {
  it('should return null for empty input', () => {
    expect(NormalizeAdapterOptions()).toBeNull();
    expect(NormalizeAdapterOptions({} as any)).toBeNull();
  });

  it('should use className and importPath as fallback', () => {
    const input = { className: 'MyAdapter', importPath: './path' };
    const result = NormalizeAdapterOptions(input as any);
    expect(result!.name).toBe('MyAdapter');
    expect(result!.moduleSpecifier).toBe('./path');
  });
});
