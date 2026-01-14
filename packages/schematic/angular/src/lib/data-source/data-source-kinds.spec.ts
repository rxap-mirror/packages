import { DataSourceKinds } from './data-source-kinds';

describe('DataSourceKinds', () => {
  it('should have the expected values', () => {
    expect(DataSourceKinds.DEFAULT).toBe('default');
    expect(DataSourceKinds.IMPORT).toBe('import');
  });
});
