import { RxapOpenApiError } from '@rxap/open-api';
import { RxapOpenApiDataSourceError } from './error';

describe('RxapOpenApiDataSourceError', () => {

  it('should extend the open api error and add the sub package name', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const error = new RxapOpenApiDataSourceError('failed', 'CODE', 'scope');

    expect(error).toBeInstanceOf(RxapOpenApiError);
    expect(error.message).toContain('failed');
    expect(error.packageName).toBe('@rxap/open-api/data-source');
  });

  afterEach(() => vi.restoreAllMocks());

});
