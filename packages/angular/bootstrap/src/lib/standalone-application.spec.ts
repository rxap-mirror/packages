import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import {
  ConfigLoadOptions,
  ConfigService,
} from '@rxap/config';
import { Environment } from '@rxap/environment';
import { StandaloneApplication } from './standalone-application';

@Component({
  selector: 'rxap-test-root',
  template: '',
})
class TestRootComponent {}

vi.mock('@angular/platform-browser', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@angular/platform-browser')>()),
  bootstrapApplication: vi.fn(),
}));

describe('StandaloneApplication', () => {

  const environment: Environment = {
    name: 'test',
    production: false,
    app: 'test-app',
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('passes the configLoadOptions to ConfigService.Load unchanged', async () => {
    const load = vi.spyOn(ConfigService, 'Load').mockResolvedValue(undefined);
    const errorHandler = vi.fn();
    const requestInit: RequestInit = { redirect: 'manual' };
    const configLoadOptions: ConfigLoadOptions = {
      url: 'https://example.com/config.json',
      errorHandler,
      requestInit,
    };

    const application = new StandaloneApplication(environment, TestRootComponent, {
      providers: [],
    }, configLoadOptions);

    await (application as any).loadConfig(environment);

    expect(load).toHaveBeenCalledTimes(1);
    const [ options, env ] = load.mock.calls[0];
    expect(options).toBe(configLoadOptions);
    expect(options?.errorHandler).toBe(errorHandler);
    expect(options?.requestInit).toBe(requestInit);
    expect(env).toBe(environment);
  });

});

describe('StandaloneApplication providers and bootstrap', () => {
  const environment = { name: 'test', production: false, app: 'test-app', tag: 'v1', origin: 'http://o' } as any;

  it('builds the default config url from environment', () => {
    const app = new StandaloneApplication(environment, TestRootComponent);
    expect(app.configLoadOptions?.url).toBe('http://o/api/configuration/v1/test-app');
    const fallback = new StandaloneApplication({ name: 'x', production: false, app: 'z' } as any, TestRootComponent);
    expect(fallback.configLoadOptions?.url).toBe(`${location.origin}/api/configuration/latest/z`);
  });

  it('prepareConfig coerces providers and importProvidersFrom appends', () => {
    const app = new StandaloneApplication(environment, TestRootComponent, {} as any);
    (app as any).prepareConfig(app.options);
    expect(app.options.providers).toEqual([]);
    app.importProvidersFrom([]);
    expect(app.options.providers).toHaveLength(1);
  });

  it('importProvidersFrom initializes providers when missing', () => {
    const app = new StandaloneApplication(environment, TestRootComponent, {} as any);
    app.importProvidersFrom([]);
    expect(app.options.providers).toHaveLength(1);
  });

  it('create bootstraps the root component with the prepared options', async () => {
    const appRef = { injector: {} } as any;
    vi.mocked(bootstrapApplication).mockResolvedValue(appRef);
    const app = new StandaloneApplication(environment, TestRootComponent, {} as any);
    app.importProvidersFrom([]);

    await expect((app as any).create()).resolves.toBe(appRef);

    expect(bootstrapApplication).toHaveBeenCalledWith(TestRootComponent, app.options);
    expect(app.options.providers).toHaveLength(1);
  });
});
