import {
  Injectable,
  Optional,
  Inject
} from '@angular/core';
import {
  deepMerge,
  SetObjectValue
} from '@rxap/utilities';
import { RXAP_CONFIG } from './tokens';
import { NoInferType } from './types';

export interface ConfigLoadOptions {
  fromUrlParam?: string | boolean;
  fromLocalStorage?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService<Config extends Record<string, any> = Record<string, any>> {

  public static Config: any = null;

  /**
   * Static default values for the config object.
   * Will be overwritten by an dynamic config file specified in
   * the Urls array.
   */
  public static Defaults: any = {};

  /**
   * Any value definition in the Overwrites object will overwrite any
   * value form the Defaults values or dynamic config files
   */
  public static Overwrites: any = {};

  public static LocalStorageKey = 'rxap/config/local-config';

  public static Urls = [ 'config.json' ];

  /**
   * Used to load the app config from a remote resource.
   *
   * Promise.all([ ConfigService.Load() ])
   * .then(() => platformBrowserDynamic().bootstrapModule(AppModule))
   * .catch(err => console.error(err))
   *
   */
  public static async Load(options?: ConfigLoadOptions): Promise<void> {
    let config = this.Defaults;
    for (const url of ConfigService.Urls) {
      try {

        const response = await fetch(url);
        config         = deepMerge(config, await response.json());

      } catch (error) {
        console.error(url, error.message);
      }
    }

    config = deepMerge(config, this.Overwrites);

    if (options?.fromLocalStorage !== false) {

      const localConfig = localStorage.getItem(ConfigService.LocalStorageKey);

      if (localConfig) {
        try {
          config = deepMerge(config, JSON.parse(localConfig));
        } catch (e) {
          console.error('local config could not be parsed');
        }
      }

    }

    if (options?.fromUrlParam) {
      const param = typeof options.fromUrlParam === 'string' ? options.fromUrlParam : 'config';
      config      = deepMerge(config, this.LoadConfigDefaultFromUrlParam(param));
    }

    console.debug('app config', config);

    ConfigService.Config = config;
  }

  private static LoadConfigDefaultFromUrlParam(param: string = 'config') {

    const queryString = window.location.search;
    const urlParams   = new URLSearchParams(queryString);

    const configFromParams = {};

    for (const configParam of urlParams.getAll('config')) {

      try {
        const split = configParam.split(';');
        if (split.length === 2) {
          const keyPath = split[ 0 ];
          const value   = split[ 1 ];
          SetObjectValue(configFromParams, keyPath, value);
        }
      } catch (e) {
        console.warn(`Parsing of url config param failed for '${configParam}': ${e.message}`);
      }

    }

    return configFromParams;

  }

  public static Get<T = any, K extends Record<string, any> = Record<string, any>>(path: string, defaultValue: T | undefined, config: Record<string, any>): T
  public static Get<T = any, K extends Record<string, any> = Record<string, any>>(
    path: string,
    defaultValue: NoInferType<T>,
    config: Record<string, any> = this.Config
  ): T {
    if (!config) {
      throw new Error('config not loaded');
    }
    let configValue: any = config;
    if (typeof path !== 'string') {
      throw new Error('The config property path is not a string');
    }
    for (const fragment of (path as any).split('.')) {
      if (configValue.hasOwnProperty(fragment)) {
        configValue = configValue[ fragment ];
      } else {
        if (defaultValue !== undefined) {
          return defaultValue;
        }
        console.warn(`Config with path '${path}' not found`);
        return undefined as any;
      }
    }
    return configValue;
  }

  public readonly config!: Config;

  constructor(@Optional() @Inject(RXAP_CONFIG) config: any | null = null) {
    this.config = ConfigService.Config;
    if (config) {
      this.config = deepMerge(this.config ?? {}, config);
    }
    if (!this.config) {
      throw new Error('config not available');
    }
  }

  public setLocalConfig(config: Config): void {
    localStorage.setItem(ConfigService.LocalStorageKey, JSON.stringify(config));
  }

  public clearLocalConfig(): void {
    localStorage.removeItem(ConfigService.LocalStorageKey);
  }

  public get<T = any>(propertyPath: string): T | undefined;
  public get<T = any>(propertyPath: string, defaultValue: NoInferType<T>): T;
  public get<T = any>(propertyPath: string, defaultValue?: T): T | undefined {
    return ConfigService.Get(propertyPath, defaultValue, this.config);
  }


}
