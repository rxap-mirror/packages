import { NgModule, NgModuleRef } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ConfigService } from '@rxap/config';
import { ModuleApplication, ModuleApplicationConfig } from './module-application';

@NgModule({ imports: [ BrowserModule ] })
class TestModule {
  // the module has no bootstrap component
  public readonly ngDoBootstrap = vi.fn();
}

describe('ModuleApplication', () => {
  const environment = { name: 'test', production: false, app: 'test-app' } as any;

  beforeEach(() => {
    ConfigService.Config = {};
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('prepareConfig defaults the extra providers and compiler options', () => {
    const app = new ModuleApplication<TestModule, ModuleApplicationConfig, any>(environment, TestModule, {});
    (app as any).prepareConfig(app.options);
    expect(app.options.extraProviders).toEqual([]);
    expect(app.options.compilerOptions).toEqual([]);
  });

  it('prepareConfig keeps the configured values', () => {
    const extraProviders = [ { provide: 'a', useValue: 1 } ];
    const compilerOptions = { preserveWhitespaces: true };
    const app = new ModuleApplication<TestModule, ModuleApplicationConfig, any>(environment, TestModule, { extraProviders, compilerOptions });
    (app as any).prepareConfig(app.options);
    expect(app.options.extraProviders).toBe(extraProviders);
    expect(app.options.compilerOptions).toBe(compilerOptions);
  });

  it('create bootstraps the module', async () => {
    const app = new ModuleApplication<TestModule, ModuleApplicationConfig, any>(environment, TestModule, {});
    (app as any).prepareConfig(app.options);

    const moduleRef: NgModuleRef<TestModule> = await (app as any).create();
    try {
      expect(moduleRef.instance).toBeInstanceOf(TestModule);
      expect(moduleRef.instance.ngDoBootstrap).toHaveBeenCalledTimes(1);
    } finally {
      moduleRef.destroy();
    }
  });

  it('bootstrap loads the config and creates the module with the prepared options', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }));
    const load = vi.spyOn(ConfigService, 'Load').mockResolvedValue(undefined);
    const configLoadOptions = { url: 'https://example.com/config.json' };
    const app = new ModuleApplication<TestModule, ModuleApplicationConfig, any>(environment, TestModule, {}, configLoadOptions);
    const after = vi.fn();
    app.after(after);
    try {
      await app.bootstrap();
      expect(load).toHaveBeenCalledWith(configLoadOptions, environment);
      expect(app.options.extraProviders).toEqual([]);
      expect(app.options.compilerOptions).toEqual([]);
      expect(app.app?.instance).toBeInstanceOf(TestModule);
      expect(app.config).toBe(app.app?.injector.get(ConfigService));
      expect(after).toHaveBeenCalledTimes(1);
    } finally {
      vi.unstubAllGlobals();
      app.app?.destroy();
    }
  });
});
