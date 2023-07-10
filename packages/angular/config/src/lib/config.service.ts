import {
  Inject,
  Injectable,
  Optional,
} from '@angular/core';
import {
  deepMerge,
  SetObjectValue,
} from '@rxap/utilities';
import { RXAP_CONFIG } from './tokens';
import { NoInferType } from './types';
import { AnySchema } from 'joi';

export interface ConfigLoadOptions {
  fromUrlParam?: string | boolean;
  fromLocalStorage?: boolean;
  schema?: AnySchema;
}

@Injectable({
  providedIn: 'root',
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

  public static Urls = ['config.json'];
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

  public static async SideLoad(url: string, propertyPath: string, required?: boolean, schema?: AnySchema): Promise<void> {

    if (!this.Config) {
      throw new Error('Config side load is only possible after the initial config load.');
    }

    const config = await this.loadConfig(url, required, schema);

    SetObjectValue(this.Config, propertyPath, config);

    console.debug(`Side loaded config for '${propertyPath}' successful`, this.Config);

  }

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
      config = await this.loadConfig(url, true, options?.schema);
    }

    config = deepMerge(config, this.Overwrites);

    if (options?.fromLocalStorage !== false) {

      const localConfig = localStorage.getItem(ConfigService.LocalStorageKey);

      if (localConfig) {
        try {
          config = deepMerge(config, JSON.parse(localConfig));
        } catch (e: any) {
          console.error('local config could not be parsed');
        }
      }

    }

    if (options?.fromUrlParam) {
      const param = typeof options.fromUrlParam === 'string' ? options.fromUrlParam : 'config';
      config = deepMerge(config, this.LoadConfigDefaultFromUrlParam(param));
    }

    console.debug('app config', config);

    this.Config = config;
  }

  public static Get<T = any, K extends Record<string, any> = Record<string, any>>(path: string, defaultValue: T | undefined, config: Record<string, any>): T

  public static Get<T = any, K extends Record<string, any> = Record<string, any>>(
    path: string,
    defaultValue: NoInferType<T>,
    config: Record<string, any> = this.Config,
  ): T {
    if (!config) {
      throw new Error('config not loaded');
    }
    let configValue: any = config;
    if (typeof path !== 'string') {
      throw new Error('The config property path is not a string');
    }
    for (const fragment of (path as any).split('.')) {
      if (configValue && configValue[fragment]) {
        configValue = configValue[fragment];
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

  private static async loadConfig<T = any>(url: string, required?: boolean, schema?: AnySchema): Promise<T | null> {

    let config: any;
    let response: any;

    try {
      response = await fetch(url);
    } catch (error: any) {
      const message = `Could not fetch config from '${url}': ${error.message}`;
      if (required) {
        this.showError(message);
        throw new Error(message);
      } else {
        console.warn(message);
        return null;
      }
    }

    try {
      config = await response.json();
    } catch (error: any) {
      const message = `Could not parse config from '${url}' to a json object: ${error.message}`;
      if (required) {
        this.showError(message);
        throw new Error(message);
      } else {
        console.warn(message);
        return null;
      }
    }

    if (schema) {
      try {
        config = await schema.validateAsync(config);
      } catch (error: any) {
        const message = `Config from '${url}' is not valid: ${error.message}`;
        if (required) {
          this.showError(message);
          throw new Error(message);
        } else {
          console.warn(message);
          return null;
        }
      }
    }

    return config;

  }

  private static showError(message: string) {
    const hasUl = document.getElementById('rxap-config-error') !== null;
    const ul = document.getElementById('rxap-config-error') ?? document.createElement('ul');
    ul.id = 'rxap-config-error';
    ul.style.position = 'fixed';
    ul.style.bottom = '16px';
    ul.style.right = '16px';
    ul.style.backgroundColor = 'white';
    ul.style.padding = '32px';
    ul.style.zIndex = '99999999';
    ul.style.color = 'black';
    const li = document.createElement('li');
    li.innerText = message;
    ul.appendChild(li);
    if (!hasUl) {
      document.body.appendChild(ul);
    }
  }

  private static LoadConfigDefaultFromUrlParam(param = 'config') {

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    const configFromParams = {};

    for (const configParam of urlParams.getAll('config')) {

      try {
        const split = configParam.split(';');
        if (split.length === 2) {
          const keyPath = split[0];
          const value = split[1];
          SetObjectValue(configFromParams, keyPath, value);
        }
      } catch (e: any) {
        console.warn(`Parsing of url config param failed for '${configParam}': ${e.message}`);
      }

    }

    return configFromParams;

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

  public getOrThrow<T = any>(propertyPath: string): T;
  public getOrThrow<T = any>(propertyPath: string, defaultValue: NoInferType<T>): T;
  public getOrThrow<T = any>(propertyPath: string, defaultValue?: T): T {
    const value = ConfigService.Get(propertyPath, defaultValue, this.config);
    if (value === undefined) {
      throw new Error(`Could not find config in path '${propertyPath}'`);
    }
    return value;
  }

}
