import {
  Injectable,
  Optional,
  Inject
} from '@angular/core';
import { deepMerge } from '@rxap/utilities';
import { RXAP_CONFIG } from './tokens';

@Injectable({
  providedIn: 'root'
})
export class ConfigService<Config extends object> {

  public static Config: any = null;

  public static LocalStorageKey = 'rxap/config/local-config';

  public static Urls = [ '/assets/config.json' ];

  /**
   * Used to load the app config from a remote resource.
   *
   * Promise.all([ ConfigService.Load() ])
   * .then(() => platformBrowserDynamic().bootstrapModule(AppModule))
   * .catch(err => console.error(err))
   *
   */
  public static async Load(): Promise<void> {
    let config = {};
    for (const url of ConfigService.Urls) {
      try {

        const response = await fetch(url);
        config         = deepMerge(config, await response.json());

      } catch (error) {
        console.error(url, error.message, error);
      }
    }

    const localConfig = localStorage.getItem(ConfigService.LocalStorageKey);

    if (localConfig) {
      try {
        config = deepMerge(config, JSON.parse(localConfig));
      } catch (e) {
        console.error('local config could not be parsed');
      }
    }

    console.debug('app config', config);

    ConfigService.Config = config;
  }

  public static Get<T>(path: string, defaultValue?: T, config = this.Config): T {
    if (!config) {
      throw new Error('config not loaded');
    }
    let configValue: any = config;
    for (const fragment of path.split('.')) {
      if (configValue.hasOwnProperty(fragment)) {
        configValue = configValue[ fragment ];
      } else {
        if (defaultValue !== undefined) {
          return defaultValue;
        }
        throw new Error(`Config with path '${path}' not found`);
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

  public get<T>(path: string, defaultValue?: T): T {
    return ConfigService.Get(path, defaultValue, this.config);
  }


}
