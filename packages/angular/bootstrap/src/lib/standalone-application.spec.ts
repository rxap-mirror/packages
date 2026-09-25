import { Component } from '@angular/core';
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

describe('StandaloneApplication', () => {

  const environment: Environment = {
    name: 'test',
    production: false,
    app: 'test-app',
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('passes the configLoadOptions to ConfigService.Load unchanged', async () => {
    const load = jest.spyOn(ConfigService, 'Load').mockResolvedValue(undefined);
    const errorHandler = jest.fn();
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
