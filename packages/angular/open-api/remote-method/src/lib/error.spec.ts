import { RxapOpenApiError } from '@rxap/open-api';
import { RxapOpenApiRemoteMethodError } from './error';

describe('RxapOpenApiRemoteMethodError', () => {

  it('should extend the open api error and add the sub package name', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const error = new RxapOpenApiRemoteMethodError('failed', 'CODE', 'scope');

    expect(error).toBeInstanceOf(RxapOpenApiError);
    expect(error.message).toContain('failed');
    expect(error.packageName).toBe('@rxap/open-api/remote-method');
  });

  afterEach(() => vi.restoreAllMocks());

});
