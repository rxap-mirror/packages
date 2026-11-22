import { OpenApiConfigService } from './open-api-config.service';

describe('@rxap/open-api', () => {

  describe('OpenApiConfigService', () => {

    let service: OpenApiConfigService;

    beforeEach(() => {
      service = new OpenApiConfigService({
        openapi: '3.0',
        info: {
          title: 'testing',
          version: '1.0',
        },
        servers: [
          {
            url: 'http://localhost:4354',
          },
        ],
        paths: {},
      });
    });

    it('should insert server config', () => {

      service.insertServer({
        url: 'http://server.de',
      }, 1);

      expect(service.config.servers?.length).toBe(2);

      service.insertServer({
        url: 'http://server.de',
      });

      expect(service.config.servers?.length).toBe(2);
      expect(service.config.servers).toEqual([
        {
          url: 'http://server.de',
        },
        {
          url: 'http://server.de',
        },
      ]);

    });

  });

});

describe('OpenApiConfigService operations', () => {
  const doc = (paths: any, servers: any[] = [{ url: 'http://a' }]): any => ({
    openapi: '3.0.0', info: { title: 't', version: '1' }, servers, paths,
  });
  const paths = {
    '/pets': { get: { operationId: 'listPets' }, post: { operationId: 'addPet' } },
    '/other': { summary: 'no methods' },
  };
  let savedConfig: any;

  beforeEach(() => {
    savedConfig = OpenApiConfigService.Config;
    OpenApiConfigService.Config = null;
    (OpenApiConfigService as any)._operations = null;
    (OpenApiConfigService as any).serverConfigMap.clear();
  });
  afterEach(() => {
    OpenApiConfigService.Config = savedConfig;
    jest.restoreAllMocks();
  });

  it('indexes operations with path and method', () => {
    const s = new OpenApiConfigService(doc(paths));
    expect(s.getOperation('listPets')).toEqual(expect.objectContaining({ path: '/pets', method: 'GET' }));
    expect(s.getOperation('addPet').method).toBe('POST');
  });

  it('throws on unknown operations', () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const s = new OpenApiConfigService(doc(paths));
    expect(() => s.getOperation('nope')).toThrow("The operation 'nope' is not defined");
  });

  it('throws on duplicate or missing operation ids', () => {
    expect(() => new OpenApiConfigService(doc({ '/a': { get: { operationId: 'x' } }, '/b': { get: { operationId: 'x' } } }))).toThrow('already defined');
    expect(() => new OpenApiConfigService(doc({ '/a': { get: {} } }))).toThrow('OperationId is not defined');
  });

  it('config throws when no document is available', () => {
    const s = new OpenApiConfigService(null);
    expect(() => s.config).toThrow('Could not load open api config');
    expect(() => s.getOperation('x')).toThrow('not loaded');
  });

  it('uses the static config as fallback', () => {
    OpenApiConfigService.Config = doc(paths);
    const s = new OpenApiConfigService();
    expect(s.config).toBe(OpenApiConfigService.Config);
    expect(OpenApiConfigService.GetOperation('listPets').path).toBe('/pets');
    expect(() => OpenApiConfigService.GetOperation('zzz')).toThrow('not defined');
  });

  it('static GetOperation requires a config', () => {
    expect(() => OpenApiConfigService.GetOperation('x')).toThrow('Could not load open api config');
  });

  it('resolves base urls by index and server id', () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const s = new OpenApiConfigService(doc(paths, [{ url: 'http://a' }, { url: 'http://b' }]));
    expect(s.getBaseUrl()).toBe('http://a');
    expect(s.getBaseUrl(1)).toBe('http://b');
    expect(() => s.getBaseUrl(5)).toThrow('Could not determine the base url');
    s.insertServer({ url: 'http://named' }, 0, 'named');
    expect(s.getBaseUrl(0, 'named')).toBe('http://named');
    expect(() => s.getBaseUrl(0, 'missing')).toThrow();
  });

  it('InsertServer creates the servers array when missing', () => {
    const d = doc(paths);
    delete d.servers;
    OpenApiConfigService.InsertServer({ url: 'u' }, 0, undefined, d);
    expect(d.servers).toEqual([{ url: 'u' }]);
  });

  it('Load fetches, validates and stores the config', async () => {
    const d = doc(paths);
    (global as any).fetch = jest.fn(async () => ({ json: async () => d }));
    await OpenApiConfigService.Load();
    expect((global as any).fetch).toHaveBeenCalledWith('openapi.json');
    expect(OpenApiConfigService.Config).toBe(d);
  });

  it('Load stores null when the fetch fails and rejects bad input', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'debug').mockImplementation(() => undefined);
    (global as any).fetch = jest.fn(async () => { throw new Error('net'); });
    await OpenApiConfigService.Load('x.json');
    expect(OpenApiConfigService.Config).toBeNull();
    await expect(OpenApiConfigService.Load('')).rejects.toThrow('not defined');
    (global as any).fetch = jest.fn(async () => ({ json: async () => ({ openapi: '2.0' }) }));
    await expect(OpenApiConfigService.Load('y.json')).rejects.toThrow('3.x.x');
  });

  it('GetBaseUrl (private) reads the server by index', () => {
    const get = (OpenApiConfigService as any).GetBaseUrl.bind(OpenApiConfigService);
    jest.spyOn(console, 'debug').mockImplementation(() => undefined);
    expect(get(doc(paths))).toBe('http://a');
    expect(() => get(doc(paths), 3)).toThrow('Could not extract');
  });
});
