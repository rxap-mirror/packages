import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigService<Config extends object> {

  public static Config: any = null;

  public static Url = '/config.json';

  public static async Load(): Promise<void> {

    try {

      const response       = await fetch(ConfigService.Url);
      ConfigService.Config = await response.json();

    } catch (error) {
      console.error(error.message, error);
    }

  }

  public readonly config!: Config;

  constructor() {
    this.config = ConfigService.Config;
    if (!ConfigService.Config) {
      throw new Error('config not available');
    }
  }

  public get<T>(path: string, defaultValue?: T): T {
    if (!this.config) {
      throw new Error('config not loaded');
    }
    let config: any = this.config;
    for (const fragment of path.split('.')) {
      if (config.hasOwnProperty(fragment)) {
        config = (this.config as any)[ config ];
      } else {
        if (defaultValue !== undefined) {
          return defaultValue;
        }
        throw new Error(`Config with path '${path}' not found`);
      }
    }
    return config;
  }


}
