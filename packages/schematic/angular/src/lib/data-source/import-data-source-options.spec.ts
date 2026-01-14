import { NormalizeImportDataSourceOptions } from './import-data-source-options';
import { DataSourceKinds } from './data-source-kinds';
import * as tsMorph from '@rxap/ts-morph';

jest.mock('@rxap/ts-morph', () => ({
  NormalizeTypeImport: jest.fn((i) => ({ name: i })),
}));

describe('NormalizeImportDataSourceOptions', () => {
  it('should normalize import data source', () => {
    const options = { kind: DataSourceKinds.IMPORT, import: 'TestImport' as any };
    const result = NormalizeImportDataSourceOptions(options);

    expect(result.kind).toBe(DataSourceKinds.IMPORT);
    expect(result.import).toEqual({ name: 'TestImport' });
  });

  it('should throw if import is missing', () => {
    expect(() => NormalizeImportDataSourceOptions({ kind: DataSourceKinds.IMPORT } as any)).toThrow('The import property is required for an import dataSource');
  });
});
