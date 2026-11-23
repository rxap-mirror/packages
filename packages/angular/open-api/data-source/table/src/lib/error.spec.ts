import { RxapOpenApiDataSourceError } from '@rxap/open-api/data-source';
import { RxapOpenApiDataSourceTableError } from './error';

describe('RxapOpenApiDataSourceTableError', () => {

  it('should extend the data source error and add the sub package name', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const error = new RxapOpenApiDataSourceTableError('failed', 'CODE', 'scope');

    expect(error).toBeInstanceOf(RxapOpenApiDataSourceError);
    expect(error.message).toContain('failed');
    expect(error.packageName).toBe('@rxap/open-api/data-source/table');
  });

  afterEach(() => vi.restoreAllMocks());

});
