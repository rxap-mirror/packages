import { NormalizeExistingMethod } from './existing-method';

jest.mock('@rxap/ts-morph', () => ({
  NormalizeTypeImport: jest.fn((o) => o),
}));

describe('NormalizeExistingMethod', () => {
  it('should return null for empty input', () => {
    expect(NormalizeExistingMethod()).toBeNull();
    expect(NormalizeExistingMethod({} as any)).toBeNull();
  });

  it('should use className and importPath as fallback', () => {
    const input = { className: 'MyService', importPath: './service' };
    const result = NormalizeExistingMethod(input as any);
    expect(result!.name).toBe('MyService');
    expect(result!.moduleSpecifier).toBe('./service');
  });
});
