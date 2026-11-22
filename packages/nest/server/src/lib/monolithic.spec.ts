import { NestFactory } from '@nestjs/core';
import { Monolithic } from './monolithic';
import { Hybrid } from './hybrid';
import { Microservice } from './microservice';

jest.mock('@rxap/nest-utilities', () => ({
  ...jest.requireActual('@rxap/nest-utilities'),
  DetermineVersion: jest.fn(() => '9.9.9'),
}));

const cfg = (values: Record<string, any> = {}) => {
  const internalConfig: any = {};
  return {
    internalConfig,
    get: jest.fn((k: string, d?: any) => values[k] ?? d),
  } as any;
};
const logger = () => ({ log: jest.fn(), debug: jest.fn(), verbose: jest.fn(), error: jest.fn() }) as any;

describe('Monolithic', () => {
  const make = (production = false, opts: any = {}, boot: any = {}) =>
    new Monolithic<any, any>(class M {}, { name: 'n', production } as any, opts, boot) as any;

  afterEach(() => jest.restoreAllMocks());

  it('creates the app with buffered logs', async () => {
    const app = {};
    const create = jest.spyOn(NestFactory, 'create').mockResolvedValue(app as any);
    const s = make(false, {});
    await expect(s.create()).resolves.toBe(app);
    expect(create).toHaveBeenCalledWith(expect.anything(), { bufferLogs: true, autoFlushLogs: true });
  });

  describe('getPort', () => {
    it('prefers PORT, then port, then 3000', () => {
      const s = make();
      expect(s.getPort(cfg({ PORT: '8080' }))).toBe(8080);
      expect(s.getPort(cfg({ port: 4000 }))).toBe(4000);
      expect(s.getPort(cfg())).toBe(3000);
    });
  });

  it('getGlobalApiPrefix', () => {
    const s = make();
    expect(s.getGlobalApiPrefix(cfg({ GLOBAL_API_PREFIX: 'api' }))).toBe('api');
    expect(s.getGlobalApiPrefix(cfg({ globalPrefix: 'g' }))).toBe('g');
    expect(s.getGlobalApiPrefix(cfg())).toBe('');
  });

  describe('getApiPort', () => {
    it('uses the port in development', () => {
      expect(make(false).getApiPort(cfg(), 3000)).toBe(3000);
    });
    it('uses ROOT_DOMAIN_PORT in production', () => {
      expect(make(true).getApiPort(cfg({ ROOT_DOMAIN_PORT: 443 }), 3000)).toBe(443);
    });
    it('strips a leading colon and converts strings', () => {
      expect(make().getApiPort(cfg({ API_PORT: ':8443' }), 1)).toBe(8443);
    });
  });

  describe('buildApiUrl', () => {
    it('uses API_URL without trailing slash', () => {
      expect(make().buildApiUrl(cfg({ API_URL: 'https://x.y/' }))).toBe('https://x.y');
    });
    it('builds from parts in development', () => {
      expect(make().buildApiUrl(cfg({ PORT: 3001 }))).toBe('http://localhost:3001');
    });
    it('builds from parts in production', () => {
      expect(
        make(true).buildApiUrl(cfg({ ROOT_DOMAIN: 'example.com', ROOT_DOMAIN_PORT: 443 })),
      ).toBe('https://example.com:443');
    });
  });

  describe('buildApiBaseUrl', () => {
    it('appends a normalized prefix', () => {
      expect(make().buildApiBaseUrl(cfg(), 'http://h:1', '/api')).toBe('http://h:1/api');
    });
    it('works without a prefix', () => {
      expect(make().buildApiBaseUrl(cfg(), 'http://h:1', '')).toBe('http://h:1');
    });
    it('prefers API_BASE_URL', () => {
      expect(make().buildApiBaseUrl(cfg({ API_BASE_URL: 'http://z/' }), 'http://h', 'api')).toBe('http://z');
    });
  });

  it('prepareOptions merges bootstrap options and updates config', () => {
    const s = make(false, {}, { globalPrefixOptions: { exclude: ['a'] } });
    const config = cfg({ GLOBAL_API_PREFIX: 'api', PORT: 3002 });
    const o = s.prepareOptions({}, logger(), config);
    expect(o).toMatchObject({
      globalApiPrefix: 'api',
      port: 3002,
      apiUrl: 'http://localhost:3002',
      apiBaseUrl: 'http://localhost:3002/api',
      publicUrl: 'http://localhost:3002/api',
      version: '9.9.9',
      globalPrefixOptions: { exclude: ['a'] },
    });
    expect(config.internalConfig.API_URL).toBe('http://localhost:3002');
    expect(config.internalConfig.API_BASE_URL).toBe('http://localhost:3002/api');
  });

  describe('listen', () => {
    it('sets the prefix with default excludes and listens', async () => {
      const app = { setGlobalPrefix: jest.fn(), listen: jest.fn((_p, cb) => { cb(); return Promise.resolve('x'); }) };
      const s = make();
      await expect(
        s.listen(app, logger(), { globalApiPrefix: 'api', globalPrefixOptions: {}, port: 1, apiUrl: 'u' }),
      ).resolves.toBe('x');
      expect(app.setGlobalPrefix).toHaveBeenCalledWith('api', { exclude: ['/health{/*path}', '/info', '/openapi'] });
      expect(app.listen).toHaveBeenCalledWith(1, expect.any(Function));
    });

    it('keeps custom excludes and skips an empty prefix', async () => {
      const app = { setGlobalPrefix: jest.fn(), listen: jest.fn().mockResolvedValue(undefined) };
      const s = make();
      await s.listen(app, logger(), { globalApiPrefix: 'api', globalPrefixOptions: { exclude: ['/x'] }, port: 1 });
      expect(app.setGlobalPrefix).toHaveBeenCalledWith('api', { exclude: ['/x'] });
      app.setGlobalPrefix.mockClear();
      await s.listen(app, logger(), { globalApiPrefix: '', port: 1 });
      expect(app.setGlobalPrefix).not.toHaveBeenCalled();
    });
  });
});

describe('Hybrid', () => {
  const app = () => ({
    connectMicroservice: jest.fn(),
    startAllMicroservices: jest.fn().mockResolvedValue(undefined),
    setGlobalPrefix: jest.fn(),
    listen: jest.fn().mockResolvedValue('listening'),
  });
  const opts = { globalApiPrefix: '', port: 1 } as any;
  const make = (ms: any, hybrid?: any) =>
    new Hybrid<any, any>(class M {}, { name: 'n' } as any, {}, {}, ms, hybrid) as any;

  it('connects static, factory and async microservices then listens', async () => {
    const a = app();
    const factory = jest.fn().mockReturnValue({ transport: 2 });
    const s = make([{ transport: 1 }, factory, Promise.resolve({ transport: 3 })], [{ h: 0 }, { h: 1 }, { h: 2 }]);
    await expect(s.listen(a, logger(), opts)).resolves.toBe('listening');
    expect(a.connectMicroservice.mock.calls).toEqual([
      [{ transport: 1 }, { h: 0 }],
      [{ transport: 2 }, { h: 1 }],
      [{ transport: 3 }, { h: 2 }],
    ]);
    expect(factory).toHaveBeenCalledWith(a, expect.anything(), opts, { h: 1 });
    expect(a.startAllMicroservices).toHaveBeenCalled();
  });

  it('accepts a single options object and shared hybrid options', async () => {
    const a = app();
    await make({ transport: 1 }, { h: 1 }).listen(a, logger(), opts);
    expect(a.connectMicroservice).toHaveBeenCalledWith({ transport: 1 }, { h: 1 });
  });

  it('exits when option resolution fails', async () => {
    const exit = jest.spyOn(process, 'exit').mockImplementation((() => undefined) as any);
    const a = app();
    const l = logger();
    await make(() => { throw new Error('sync'); }).listen(a, l, opts);
    expect(l.error).toHaveBeenCalledWith(expect.stringContaining('sync'), expect.anything(), 'Bootstrap');
    await make(Promise.reject(new Error('async'))).listen(a, l, opts);
    expect(l.error).toHaveBeenCalledWith(expect.stringContaining('async'), expect.anything(), 'Bootstrap');
    expect(exit).toHaveBeenCalledWith(1);
    exit.mockRestore();
  });
});

describe('Microservice', () => {
  it('creates, prepares options and listens', async () => {
    const ms = { listen: jest.fn().mockResolvedValue('ok') };
    const create = jest.spyOn(NestFactory, 'createMicroservice').mockResolvedValue(ms as any);
    const s: any = new Microservice<any>(class M {}, { name: 'n' } as any, { transport: 1 } as any);
    await expect(s.create()).resolves.toBe(ms);
    expect(create).toHaveBeenCalledWith(expect.anything(), { transport: 1 });
    const l = logger();
    expect(s.prepareOptions(ms, l, cfg())).toEqual({ version: '9.9.9' });
    await expect(s.listen(ms, l, {})).resolves.toBe('ok');
    create.mockRestore();
  });
});
