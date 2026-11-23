import type { MockInstance } from 'vitest';
import { ConfigService } from '@rxap/config';
import { OpenApiConfigService } from './open-api-config.service';
import { OpenApiInit } from './open-api-init';

describe('OpenApiInit', () => {
  let insert: MockInstance;
  let load: MockInstance;
  let get: MockInstance;

  beforeEach(() => {
    insert = vi.spyOn(OpenApiConfigService, 'InsertServer').mockImplementation(() => undefined);
    load = vi.spyOn(OpenApiConfigService, 'Load').mockResolvedValue(undefined);
    vi.spyOn(console, 'debug').mockImplementation(() => undefined);
    get = vi.spyOn(ConfigService, 'Get');
  });
  afterEach(() => vi.restoreAllMocks());

  it('does nothing without api config', () => {
    get.mockReturnValue({});
    expect(OpenApiInit({} as any)).toBeUndefined();
    expect(insert).not.toHaveBeenCalled();
    expect(load).not.toHaveBeenCalled();
  });

  it('inserts the default and named servers, joining relative urls with the origin', () => {
    get.mockReturnValue({ baseUrl: '/api', svc: { baseUrl: 'https://svc.test' }, rel: { baseUrl: 'rel' }, empty: {}, str: 'x' });
    OpenApiInit({ origin: 'http://o.test' } as any);
    expect(insert).toHaveBeenCalledWith({ url: 'http://o.test/api' }, 0);
    expect(insert).toHaveBeenCalledWith({ url: 'https://svc.test' }, 0, 'svc');
    expect(insert).toHaveBeenCalledWith({ url: 'http://o.test/rel' }, 0, 'rel');
    expect(insert).toHaveBeenCalledTimes(3);
  });

  it('keeps absolute default base url', () => {
    get.mockReturnValue({ baseUrl: 'http://abs.test' });
    OpenApiInit({ origin: 'http://o.test' } as any);
    expect(insert).toHaveBeenCalledWith({ url: 'http://abs.test' }, 0);
  });

  it('falls back to the location origin', () => {
    get.mockReturnValue({ baseUrl: '/x' });
    OpenApiInit({} as any);
    expect(insert).toHaveBeenCalledWith({ url: location.origin + '/x' }, 0);
  });

  it('loads the config when requested', () => {
    get.mockReturnValue({});
    OpenApiInit({ origin: 'o' } as any, { load: true });
    expect(load).toHaveBeenCalledWith(undefined);
    OpenApiInit({ origin: 'o' } as any, { load: { openApiUrl: 'u.json' } });
    expect(load).toHaveBeenCalledWith('u.json');
    OpenApiInit({ origin: 'o', openApi: { load: true } } as any);
    expect(load).toHaveBeenCalledTimes(3);
  });
});
