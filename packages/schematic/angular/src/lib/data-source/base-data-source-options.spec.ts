import { NormalizeBaseDataSourceOptions } from './base-data-source-options';
import { DataSourceKinds } from './data-source-kinds';

describe('NormalizeBaseDataSourceOptions', () => {
  it('should normalize with default kind', () => {
    const result = NormalizeBaseDataSourceOptions({} as any);
    expect(result.kind).toBe(DataSourceKinds.DEFAULT);
  });

  it('should preserve provided kind', () => {
    const result = NormalizeBaseDataSourceOptions({ kind: DataSourceKinds.IMPORT });
    expect(result.kind).toBe(DataSourceKinds.IMPORT);
  });
});
