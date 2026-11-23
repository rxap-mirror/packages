import { ConfigService } from '@rxap/config';
import type { MockInstance } from 'vitest';
import { Application, RefWithInjector } from './application';

interface Cfg { prepared?: boolean }

class TestApplication extends Application<Cfg, RefWithInjector, any> {
  public createImpl: () => Promise<RefWithInjector | null> = async () => ({
    injector: { get: () => this.configInstance } as any,
  });
  public configInstance = { id: 'config' } as unknown as ConfigService;
  protected prepareConfig(config: Cfg) { config.prepared = true; }
  protected create() { return this.createImpl() as Promise<RefWithInjector>; }
}

describe('Application', () => {
  const env = { name: 'n', production: false, app: 'a' } as any;
  let load: MockInstance;
  // UpdateEnvironment (@rxap/environment) loads the build.json through fetch
  const fetchBuildJson = vi.fn();

  beforeEach(() => {
    fetchBuildJson.mockReset().mockResolvedValue({ ok: true, json: async () => ({}) });
    vi.stubGlobal('fetch', fetchBuildJson);
    ConfigService.Config = {};
    load = vi.spyOn(ConfigService, 'Load').mockResolvedValue(undefined);
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('runs the bootstrap phases in order and exposes app, logger and config', async () => {
    const order: string[] = [];
    fetchBuildJson.mockImplementation(async () => {
      order.push('env');
      return { ok: true, json: async () => ({}) };
    });
    load.mockImplementation(async () => void order.push('load'));
    const app = new TestApplication(env, {});
    app.before(function (this: any, config, options, environment) {
      order.push('before');
      expect(this).toBe(app);
      expect(config).toBeInstanceOf(ConfigService);
      expect(options.prepared).toBe(true);
      expect(environment).toBe(env);
    });
    app.after(async function (this: any, ref, config, logger, options, environment) {
      order.push('after');
      expect(this).toBe(app);
      expect(ref).toBe(app.app);
      expect(config).toBe(app.configInstance);
      expect(logger).toBe(console);
      expect(options).toBe(app.options);
      expect(environment).toBe(env);
    });

    await app.bootstrap();

    expect(order).toEqual(['env', 'load', 'before', 'after']);
    expect(fetchBuildJson).toHaveBeenCalledWith('build.json');
    expect(app.app).not.toBeNull();
    expect(app.logger).toBe(console);
    expect(app.config).toBe(app.configInstance);
  });

  it('awaits async before/after hooks sequentially', async () => {
    const order: number[] = [];
    const app = new TestApplication(env, {});
    app.before(async () => { await new Promise((r) => setTimeout(r, 5)); order.push(1); });
    app.before(() => void order.push(2));
    app.after(async () => { await new Promise((r) => setTimeout(r, 5)); order.push(3); });
    app.after(() => void order.push(4));
    await app.bootstrap();
    expect(order).toEqual([1, 2, 3, 4]);
  });

  it('wraps creation errors', async () => {
    const app = new TestApplication(env, {});
    app.createImpl = async () => { throw new Error('kaboom'); };
    await expect(app.bootstrap()).rejects.toThrow('Angular app creation failed: kaboom');
  });

  it('fails when create resolves without an app', async () => {
    const app = new TestApplication(env, {});
    app.createImpl = async () => null;
    await expect(app.bootstrap()).rejects.toThrow('Angular app creation failed');
  });

  it('defaults options to an empty object and passes configLoadOptions', async () => {
    const opts = { url: 'x' };
    const app = new TestApplication(env, undefined, opts);
    expect(app.options).toEqual({});
    await app.bootstrap();
    expect(load).toHaveBeenCalledWith(opts, env);
  });
});
