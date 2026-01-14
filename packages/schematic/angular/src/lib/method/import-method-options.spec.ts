import { NormalizeImportMethodOptions } from './import-method-options';
import { MethodKinds } from './method-kinds';

jest.mock('@rxap/ts-morph', () => ({
  NormalizeTypeImport: jest.fn((i) => ({ name: i })),
}));

describe('NormalizeImportMethodOptions', () => {
  it('should normalize import method options', () => {
    const options = { kind: MethodKinds.IMPORT, import: 'TestImport' as any };
    const result = NormalizeImportMethodOptions(options);

    expect(result.kind).toBe(MethodKinds.IMPORT);
    expect(result.import).toEqual({ name: 'TestImport' });
  });

  it('should throw if import is missing', () => {
    expect(() => NormalizeImportMethodOptions({ kind: MethodKinds.IMPORT } as any)).toThrow('The import property is required for an import method');
  });
});
