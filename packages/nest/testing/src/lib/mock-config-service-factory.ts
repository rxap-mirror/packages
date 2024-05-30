export interface MockConfigService {
  get: <T = unknown>(key: string) => T;
  getOrThrow: <T = unknown>(key: string) => T;
  set: (key: string, value: any) => void;
}

/**
 * Factory function that creates a mock config service with specified config.
 *
 * @param {Record<string, unknown>} config - The configuration object to initialize the mock config service with. Defaults to an empty object if not provided.
 * @returns {MockConfigService} - The created mock config service.
 */
export function MockConfigServiceFactory(config: Record<string, unknown> = {}): MockConfigService {
  return {
    get: <T = unknown>(key: string): T => config[key] as T,
    getOrThrow: <T = unknown>(key: string): T => {
      if (config[key] === undefined) {
        throw new Error(`Config key ${ key } is not defined`);
      }
      return config[key] as T;
    },
    set: (key: string, value: unknown) => {
      config[key] = value;
    }
  };
}
