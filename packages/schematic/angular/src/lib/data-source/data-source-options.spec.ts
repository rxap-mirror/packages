import {
  NormalizeDataSourceOptions,
  IsNormalizedImportDataSourceOptions,
  AssertIsNormalizedImportDataSourceOptions,
} from './data-source-options';
import { DataSourceKinds } from './data-source-kinds';
import { NormalizeImportDataSourceOptions } from './import-data-source-options';
import { NormalizeBaseDataSourceOptions } from './base-data-source-options';

jest.mock('./import-data-source-options', () => ({
  NormalizeImportDataSourceOptions: jest.fn(() => ({ kind: DataSourceKinds.IMPORT })),
}));
jest.mock('./base-data-source-options', () => ({
  NormalizeBaseDataSourceOptions: jest.fn(() => ({ kind: DataSourceKinds.DEFAULT })),
}));

describe('NormalizeDataSourceOptions Multiplexer', () => {
  it('should return null for empty input', () => {
    expect(NormalizeDataSourceOptions()).toBeNull();
    expect(NormalizeDataSourceOptions({} as any)).toBeNull();
  });

  it('should route IMPORT kind to NormalizeImportDataSourceOptions', () => {
    NormalizeDataSourceOptions({ kind: DataSourceKinds.IMPORT } as any);
    expect(NormalizeImportDataSourceOptions).toHaveBeenCalled();
  });

  it('should route other kinds to NormalizeBaseDataSourceOptions', () => {
    NormalizeDataSourceOptions({ kind: DataSourceKinds.DEFAULT } as any);
    expect(NormalizeBaseDataSourceOptions).toHaveBeenCalled();
  });

  describe('Type Guards', () => {
    it('IsNormalizedImportDataSourceOptions', () => {
      expect(IsNormalizedImportDataSourceOptions({ kind: DataSourceKinds.IMPORT } as any)).toBe(true);
      expect(IsNormalizedImportDataSourceOptions({ kind: DataSourceKinds.DEFAULT } as any)).toBe(false);
    });

    it('AssertIsNormalizedImportDataSourceOptions', () => {
      expect(() => AssertIsNormalizedImportDataSourceOptions({ kind: DataSourceKinds.IMPORT } as any)).not.toThrow();
      expect(() => AssertIsNormalizedImportDataSourceOptions({ kind: DataSourceKinds.DEFAULT } as any)).toThrow();
    });
  });
});
