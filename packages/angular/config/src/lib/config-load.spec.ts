import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { Environment } from '@rxap/environment';
import { ConfigLoaderService } from './config-loader.service';
import { ConfigTestingService } from './config-testing-service';
import {
  ConfigLoadingStrategy,
  ConfigLoadMethod,
  ConfigService,
} from './config.service';
import { ConfigLoadError } from './config-load-error';
import { ProvideConfig } from './provide-config';
import { RXAP_CONFIG } from './tokens';

function ok(body: unknown): Response {
  return { ok: true, status: 200, statusText: 'OK', type: 'basic', json: async () => body } as unknown as Response;
}

function failing(status: number, statusText = ''): Response {
  return { ok: false, status, statusText, type: 'basic' } as unknown as Response;
}

describe('ConfigService static loading', () => {
  let fetchMock: jest.Mock;
  const handler = jest.fn();

  beforeEach(() => {
    fetchMock = jest.fn();
    (globalThis as any).fetch = fetchMock;
    ConfigService.Config = null;
    ConfigService.Defaults = {};
    ConfigService.Overwrites = {};
    ConfigService.Urls = [];
    ConfigService.onErrorFnc = [];
    ConfigService.onRequestErrorFnc = [];
    handler.mockReset();
    localStorage.clear();
    window.history.replaceState({}, '', '/');
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'debug').mockImplementation();
  });

  afterEach(() => jest.restoreAllMocks());

  it('merges defaults, static, urls and overwrites in order', async () => {
    ConfigService.Defaults = { a: 1, b: 1, c: 1 };
    ConfigService.Overwrites = { d: 'over' };
    fetchMock.mockResolvedValue(ok({ b: 2, d: 'url' }));
    await ConfigService.Load({ static: { c: 3 }, url: '/config.json', errorHandler: handler });
    expect(ConfigService.Config).toEqual({ a: 1, b: 2, c: 3, d: 'over' });
  });

  it('supports url arrays and url functions', async () => {
    fetchMock.mockImplementation(async (url: string) => ok({ [url.replace('/', '')]: true }));
    const env = { production: false } as Environment;
    await ConfigService.Load({ url: ['/x', (e: Environment) => ['/y', '/z']] }, env);
    expect(ConfigService.Config).toEqual({ x: true, y: true, z: true });
  });

  it('requires an environment for url functions', async () => {
    await expect(ConfigService.Load({ url: () => '/x' })).rejects.toThrow('environment is required');
  });

  it('places config.<path>.json responses at the path', async () => {
    fetchMock.mockResolvedValue(ok({ k: 1 }));
    await ConfigService.Load({ url: '/config.feature.sub.json' });
    expect(ConfigService.Config).toEqual({ feature: { sub: { k: 1 } } });
  });

  it('uses the environment config (string and object)', async () => {
    fetchMock.mockResolvedValue(ok({ fromUrl: true }));
    await ConfigService.Load({}, { config: '/env.json' } as unknown as Environment);
    expect(fetchMock).toHaveBeenCalledWith('/env.json', undefined);
    expect(ConfigService.Config).toEqual({ fromUrl: true });

    await ConfigService.Load({}, { config: { static: { s: 1 }, url: '/e2.json', strategy: 'fifo' } } as unknown as Environment);
    expect(ConfigService.Config).toEqual({ s: 1, fromUrl: true });
  });

  it('validates with a schema', async () => {
    fetchMock.mockResolvedValue(ok({ a: 1 }));
    const schema = { validateAsync: jest.fn(async (c: any) => ({ ...c, validated: true })) };
    await ConfigService.Load({ url: '/c.json', schema });
    expect(ConfigService.Config).toEqual({ a: 1, validated: true });
  });

  describe('sources', () => {
    it('loads from local storage', async () => {
      localStorage.setItem(ConfigService.LocalStorageKey, JSON.stringify({ ls: 1 }));
      await ConfigService.Load({ fromUrls: false });
      expect(ConfigService.Config).toEqual({ ls: 1 });
    });

    it('treats empty local storage as empty config and can be disabled', async () => {
      await ConfigService.Load({ fromUrls: false });
      expect(ConfigService.Config).toEqual({});
      localStorage.setItem(ConfigService.LocalStorageKey, '{"ls":1}');
      await ConfigService.Load({ fromUrls: false, fromLocalStorage: false });
      expect(ConfigService.Config).toEqual({});
    });

    it('loads from url params', async () => {
      window.history.replaceState({}, '', '/?config=a.b;1&config=c;2&config=invalid');
      await ConfigService.Load({ fromUrls: false, fromLocalStorage: false, fromUrlParam: true });
      expect(ConfigService.Config).toEqual({ a: { b: '1' }, c: '2' });
    });

    it('uses a custom url param name', async () => {
      window.history.replaceState({}, '', '/?cfg=x;1&config=y;2');
      await ConfigService.Load({ fromUrls: false, fromLocalStorage: false, fromUrlParam: 'cfg' });
      expect(ConfigService.Config).toEqual({ x: '1' });
    });

    it('loads from a cid', async () => {
      const fetchCidContent = jest.fn().mockResolvedValue({ text: async () => '{"cid":true}' });
      await ConfigService.Load({
        fromUrls: false,
        fromLocalStorage: false,
        fromCid: 'bafy',
        ipfsGatewayServers: [c => `https://g/${c}`],
        fetchCidContent,
      });
      expect(ConfigService.Config).toEqual({ cid: true });
    });

    it('skips cid loading without gateways or with non object content', async () => {
      await ConfigService.Load({ fromUrls: false, fromLocalStorage: false, fromCid: 'bafy' });
      expect(ConfigService.Config).toEqual({});
      const fetchCidContent = jest.fn().mockResolvedValue({ text: async () => '"str"' });
      await ConfigService.Load({
        fromUrls: false, fromLocalStorage: false, fromCid: 'bafy',
        ipfsGatewayServers: [c => c], fetchCidContent,
      });
      expect(ConfigService.Config).toEqual({});
      fetchCidContent.mockResolvedValue(null);
      await ConfigService.Load({
        fromUrls: false, fromLocalStorage: false, fromCid: 'bafy',
        ipfsGatewayServers: [c => c], fetchCidContent,
      });
      expect(ConfigService.Config).toEqual({});
    });

    it('swallows cid fetch errors', async () => {
      const fetchCidContent = jest.fn().mockRejectedValue(new Error('x'));
      await ConfigService.Load({
        fromUrls: false, fromLocalStorage: false, fromCid: 'bafy',
        ipfsGatewayServers: [c => c], fetchCidContent,
      });
      expect(ConfigService.Config).toEqual({});
    });

    it('resolves the cid from dns', async () => {
      const cid = 'a'.repeat(50);
      fetchMock.mockImplementation(async (url: string) => {
        if (url.includes('name=_config.example.com')) {
          return ok({ Answer: [{ data: `"ipfs://${cid}"` }] });
        }
        return ok({});
      });
      const fetchCidContent = jest.fn().mockResolvedValue({ text: async () => '{"dns":true}' });
      await ConfigService.Load({
        fromUrls: false, fromLocalStorage: false,
        fromDns: 'example.com', dnsServers: ['https://dns'],
        ipfsGatewayServers: [c => c], fetchCidContent,
      });
      expect(fetchCidContent).toHaveBeenCalledWith(cid, undefined, expect.any(Array));
      expect(ConfigService.Config).toEqual({ dns: true });
    });

    it('ignores dns failures, unusable txt data and missing servers', async () => {
      await ConfigService.Load({ fromUrls: false, fromLocalStorage: false, fromDns: true });
      expect(console.warn).toHaveBeenCalledWith('No DNS servers provided for DNS lookup');
      fetchMock.mockResolvedValue(ok({ Answer: [{ data: 'short' }] }));
      await ConfigService.Load({ fromUrls: false, fromLocalStorage: false, fromDns: true, dnsServers: ['d'] });
      expect(ConfigService.Config).toEqual({});
      fetchMock.mockRejectedValue(new Error('down'));
      await ConfigService.Load({ fromUrls: false, fromLocalStorage: false, fromDns: true, dnsServers: ['d'] });
      expect(ConfigService.Config).toEqual({});
    });

    it('honours a custom order', async () => {
      localStorage.setItem(ConfigService.LocalStorageKey, '{"v":"ls"}');
      fetchMock.mockResolvedValue(ok({ v: 'url' }));
      await ConfigService.Load({ url: '/c.json', order: [ConfigLoadMethod.FROM_LOCAL_STORAGE, ConfigLoadMethod.FROM_URLS] });
      expect(ConfigService.Config).toEqual({ v: 'url' });
      await ConfigService.Load({ url: '/c.json', order: [ConfigLoadMethod.FROM_URLS, ConfigLoadMethod.FROM_LOCAL_STORAGE] });
      expect(ConfigService.Config).toEqual({ v: 'ls' });
    });

    it('ignores unknown methods', async () => {
      await ConfigService.Load({ order: ['unknown' as ConfigLoadMethod] });
      expect(ConfigService.Config).toEqual({});
    });
  });

  describe('strategy', () => {
    it('FIFO stops after the first source', async () => {
      localStorage.setItem(ConfigService.LocalStorageKey, '{"ls":1}');
      fetchMock.mockResolvedValue(ok({ url: 1 }));
      await ConfigService.Load({ url: '/c.json', strategy: ConfigLoadingStrategy.FIFO });
      expect(ConfigService.Config).toEqual({ url: 1 });
    });

    it('FIFO falls through on errors', async () => {
      localStorage.setItem(ConfigService.LocalStorageKey, '{"ls":1}');
      fetchMock.mockRejectedValue(new Error('offline'));
      await ConfigService.Load({
        url: '/c.json', strategy: ConfigLoadingStrategy.FIFO, errorHandler: handler,
      });
      expect(ConfigService.Config).toEqual({ ls: 1 });
    });

    it('default strategy rethrows source errors', async () => {
      fetchMock.mockRejectedValue(new Error('offline'));
      await expect(ConfigService.Load({ url: '/c.json', errorHandler: handler })).rejects.toThrow(
        "Could not fetch config from '/c.json': offline");
    });
  });

  describe('error handling', () => {
    async function load(options: object = {}) {
      return ConfigService.Load({ url: '/c.json', errorHandler: handler, ...options });
    }

    it.each([
      [404, "Config not found at '/c.json'"],
      [405, 'Config service is not started yet. Wait 30s and try again.'],
      [401, "Unauthorized to fetch config from '/c.json'"],
      [500, "Config request results in non ok response for '/c.json': (500) Server"],
    ])('maps http status %i', async (status, message) => {
      fetchMock.mockResolvedValue(failing(status, 'Server'));
      const onRequestError = jest.fn();
      ConfigService.onRequestErrorFnc.push(() => { throw new Error('hook'); }, onRequestError);
      await expect(load()).rejects.toThrow(message);
      expect(handler).toHaveBeenCalledWith(expect.objectContaining<Partial<ConfigLoadError>>({ kind: 'http', status, required: true }));
      expect(onRequestError).toHaveBeenCalled();
    });

    it('reports opaque redirects', async () => {
      fetchMock.mockResolvedValue({ type: 'opaqueredirect', status: 0 });
      await expect(load()).rejects.toThrow("Config request for '/c.json' was redirected");
      expect(handler.mock.calls[0][0].kind).toBe('redirect');
    });

    it('reports parse errors and notifies onError hooks', async () => {
      fetchMock.mockResolvedValue({ ok: true, type: 'basic', status: 200, json: async () => { throw new Error('bad'); } });
      const onError = jest.fn();
      ConfigService.onErrorFnc.push(() => { throw new Error('hook'); }, onError);
      await expect(load()).rejects.toThrow("Could not parse config from '/c.json' to a json object: bad");
      expect(handler.mock.calls[0][0].kind).toBe('parse');
      expect(onError).toHaveBeenCalled();
    });

    it('reports schema errors', async () => {
      fetchMock.mockResolvedValue(ok({}));
      const schema = { validateAsync: jest.fn().mockRejectedValue(new Error('invalid')) };
      await expect(load({ schema })).rejects.toThrow("Config from '/c.json' is not valid: invalid");
      expect(handler.mock.calls[0][0].kind).toBe('schema');
    });

    it('passes requestInit to fetch', async () => {
      fetchMock.mockResolvedValue(ok({}));
      await load({ requestInit: { redirect: 'manual' } });
      expect(fetchMock).toHaveBeenCalledWith('/c.json', { redirect: 'manual' });
    });

    it('survives a throwing error handler (rethrowing the required error)', async () => {
      fetchMock.mockRejectedValue(new Error('x'));
      handler.mockRejectedValue(new Error('handler'));
      await expect(load()).rejects.toThrow("Could not fetch config from '/c.json': x");
    });
  });

  describe('SideLoad', () => {
    it('requires the initial load', async () => {
      await expect(ConfigService.SideLoad('/s.json', 'a')).rejects.toThrow('only possible after the initial config load');
    });

    it('sets the loaded config at the property path', async () => {
      ConfigService.Config = { existing: 1 };
      fetchMock.mockResolvedValue(ok({ side: true }));
      await ConfigService.SideLoad('/s.json', 'a.b', true);
      expect(ConfigService.Config).toEqual({ existing: 1, a: { b: { side: true } } });
    });

    it('uses the options of the last Load and sets null for optional failures', async () => {
      fetchMock.mockResolvedValue(ok({}));
      await ConfigService.Load({ errorHandler: handler, requestInit: { credentials: 'include' } });
      fetchMock.mockResolvedValue(failing(500, 'x'));
      await ConfigService.SideLoad('/s.json', 'opt');
      expect(handler).toHaveBeenCalledWith(expect.objectContaining({ required: false }));
      expect(ConfigService.Config.opt).toBeNull();
      expect(fetchMock).toHaveBeenLastCalledWith('/s.json', { credentials: 'include' });
    });

    it('does not notify hooks for optional urls but uses the default handler', async () => {
      ConfigService.Config = {};
      fetchMock.mockResolvedValue(failing(500, 'x'));
      const onError = jest.fn();
      ConfigService.onErrorFnc.push(onError);
      await ConfigService.SideLoad('/s.json', 'a', false, undefined, {});
      expect(onError).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('Get', () => {
    it('reads nested values with defaults', () => {
      const config = { a: { b: 1, n: null }, z: 0 };
      expect(ConfigService.Get('a.b', undefined, config)).toBe(1);
      expect(ConfigService.Get('z', 5, config)).toBe(0);
      expect(ConfigService.Get('a.c', 'def', config)).toBe('def');
      expect(ConfigService.Get('a.c', undefined, config)).toBeUndefined();
      expect(ConfigService.Get('a.n.x', 'def', config)).toBe('def');
    });

    it('validates its input', () => {
      expect(() => ConfigService.Get('a', undefined, null as any)).toThrow('config not loaded');
      expect(() => ConfigService.Get(1 as any, undefined, {})).toThrow('not a string');
    });
  });

  describe('instance', () => {
    it('merges the injected config over the static config', () => {
      ConfigService.Config = { a: 1, b: 1 };
      TestBed.configureTestingModule({ providers: [ProvideConfig({ b: 2 })] });
      const service = TestBed.inject(ConfigService);
      expect(service.config).toEqual({ a: 1, b: 2 });
      expect(ProvideConfig()).toEqual({ provide: RXAP_CONFIG, useValue: {} });
    });

    it('throws when no config is available', () => {
      expect(() => new ConfigService()).toThrow('config not available');
    });

    it('get / getOrThrow / local config', () => {
      const service = new ConfigService({ a: { b: 1 } });
      expect(service.get('a.b')).toBe(1);
      expect(service.get('x', 'd')).toBe('d');
      expect(service.getOrThrow('a.b')).toBe(1);
      expect(service.getOrThrow('x', 'd')).toBe('d');
      expect(() => service.getOrThrow('x')).toThrow("Could not find config in path 'x'");
      service.setLocalConfig({ l: 1 });
      expect(localStorage.getItem(ConfigService.LocalStorageKey)).toBe('{"l":1}');
      service.clearLocalConfig();
      expect(localStorage.getItem(ConfigService.LocalStorageKey)).toBeNull();
    });
  });
});

describe('ConfigTestingService', () => {
  it('stores and reads values', () => {
    const service = new ConfigTestingService();
    service.set('a.b', 1);
    expect(service.get('a.b')).toBe(1);
    expect(service.get('a.c', 'd')).toBe('d');
    expect(service.getOrThrow('a.b')).toBe(1);
    expect(() => service.getOrThrow('nope')).toThrow("Could not find config in path 'nope'");
    expect(() => service.setLocalConfig({})).not.toThrow();
    expect(() => service.clearLocalConfig()).not.toThrow();
  });
});

describe('ConfigLoaderService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
  });

  it('shares concurrent loads of the same url', async () => {
    const service = TestBed.inject(ConfigLoaderService);
    const http = TestBed.inject(HttpTestingController);
    const p1 = service.load$('/a');
    const p2 = service.load$('/a');
    const req = http.expectOne('/a');
    req.flush({ v: 1 });
    await expect(p1).resolves.toEqual({ v: 1 });
    await expect(p2).resolves.toEqual({ v: 1 });
    expect(service.configLoading.size).toBe(0);
    http.verify();
  });

  it('returns cached configs', async () => {
    const service = TestBed.inject(ConfigLoaderService);
    service.configs.set('/c', { cached: true });
    await expect(service.load$('/c')).resolves.toEqual({ cached: true });
  });
});
