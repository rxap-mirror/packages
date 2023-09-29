export function MockConfigServiceFactory(config: Record<string, unknown> = {}) {
  return {
    get: (key: string) => config[key],
    getOrThrow: (key: string) => {
      if (config[key] === undefined) {
        throw new Error(`Config key ${ key } is not defined`);
      }
      return config[key];
    },
  };
}
