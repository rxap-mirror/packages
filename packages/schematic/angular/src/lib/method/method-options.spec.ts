import {
  NormalizeMethodOptions,
  IsNormalizedOpenApiMethodOptions,
  IsNormalizedImportMethodOptions,
  AssertIsNormalizedOpenApiMethodOptions,
  AssertIsNormalizedImportMethodOptions,
} from './method-options';
import { MethodKinds } from './method-kinds';
import { NormalizeImportMethodOptions } from './import-method-options';
import { NormalizeOpenApiMethodOptions } from './open-api-method-options';
import { NormalizeBaseMethodOptions } from './base-method-options';

jest.mock('./import-method-options', () => ({ NormalizeImportMethodOptions: jest.fn(() => ({ kind: MethodKinds.IMPORT })) }));
jest.mock('./open-api-method-options', () => ({ NormalizeOpenApiMethodOptions: jest.fn(() => ({ kind: MethodKinds.OPEN_API })) }));
jest.mock('./base-method-options', () => ({ NormalizeBaseMethodOptions: jest.fn(() => ({ kind: MethodKinds.DEFAULT })) }));

describe('NormalizeMethodOptions Multiplexer', () => {
  it('should return null for empty input', () => {
    expect(NormalizeMethodOptions(undefined)).toBeNull();
    expect(NormalizeMethodOptions({} as any)).toBeNull();
  });

  it('should route IMPORT kind to NormalizeImportMethodOptions', () => {
    NormalizeMethodOptions({ kind: MethodKinds.IMPORT } as any);
    expect(NormalizeImportMethodOptions).toHaveBeenCalled();
  });

  it('should route OPEN_API kind to NormalizeOpenApiMethodOptions', () => {
    NormalizeMethodOptions({ kind: MethodKinds.OPEN_API } as any);
    expect(NormalizeOpenApiMethodOptions).toHaveBeenCalled();
  });

  it('should route other kinds to NormalizeBaseMethodOptions', () => {
    NormalizeMethodOptions({ kind: MethodKinds.DEFAULT } as any);
    expect(NormalizeBaseMethodOptions).toHaveBeenCalled();
  });

  describe('Type Guards', () => {
    it('IsNormalizedOpenApiMethodOptions', () => {
      expect(IsNormalizedOpenApiMethodOptions({ kind: MethodKinds.OPEN_API } as any)).toBe(true);
      expect(IsNormalizedOpenApiMethodOptions({ kind: MethodKinds.DEFAULT } as any)).toBe(false);
    });

    it('IsNormalizedImportMethodOptions', () => {
      expect(IsNormalizedImportMethodOptions({ kind: MethodKinds.IMPORT } as any)).toBe(true);
      expect(IsNormalizedImportMethodOptions({ kind: MethodKinds.DEFAULT } as any)).toBe(false);
    });

    it('AssertIsNormalizedOpenApiMethodOptions', () => {
      expect(() => AssertIsNormalizedOpenApiMethodOptions({ kind: MethodKinds.OPEN_API } as any)).not.toThrow();
      expect(() => AssertIsNormalizedOpenApiMethodOptions({ kind: MethodKinds.DEFAULT } as any)).toThrow();
    });

    it('AssertIsNormalizedImportMethodOptions', () => {
      expect(() => AssertIsNormalizedImportMethodOptions({ kind: MethodKinds.IMPORT } as any)).not.toThrow();
      expect(() => AssertIsNormalizedImportMethodOptions({ kind: MethodKinds.DEFAULT } as any)).toThrow();
    });
  });
});
