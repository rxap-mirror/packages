import { Firecrawl } from './Firecrawl.node';

const scrapeUrl = jest.fn();
const extract = jest.fn();
const keyvStore = new Map<string, any>();

jest.mock('@mendable/firecrawl-js', () => ({
  __esModule: true,
  default: jest.fn(() => ({ v1: { scrapeUrl, extract } })),
}));
jest.mock('@keyv/postgres', () => ({ __esModule: true, default: jest.fn((o) => ({ opts: o })) }));
jest.mock('keyv', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    has: async (k: string) => keyvStore.has(k),
    get: async (k: string) => keyvStore.get(k),
    set: async (k: string, v: any) => { keyvStore.set(k, v); },
  })),
}));

describe('Firecrawl node', () => {
  const node = new Firecrawl();
  let params: Record<string, any>;
  let ctx: any;

  beforeEach(() => {
    jest.clearAllMocks();
    keyvStore.clear();
    params = { operation: 'scrapeUrl', url: 'https://example.com' };
    ctx = {
      getInputData: jest.fn(() => [{ json: {} }]),
      getNodeParameter: jest.fn((name: string, _i: number, def?: any) => name in params ? params[name] : def),
      getCredentials: jest.fn(async (name: string) =>
        name === 'firecrawl'
          ? { apiKey: 'key' }
          : { host: 'h', database: 'd', user: 'u', password: 'p', ssl: 'disable', port: 5432 }),
      getNode: jest.fn(() => ({ name: 'Firecrawl' })),
      continueOnFail: jest.fn(() => false),
    };
  });

  it('declares credentials', () => {
    expect(node.description.name).toBe('rxapFirecrawl');
    expect(node.description.credentials!.map((c) => c.name)).toEqual(['firecrawl', 'postgres']);
  });

  it('scrapes a url', async () => {
    scrapeUrl.mockResolvedValue({ success: true, markdown: '# hi' });
    const [results] = await node.execute.call(ctx) as any;
    expect(scrapeUrl).toHaveBeenCalledWith('https://example.com', {
      formats: ['markdown'], onlyMainContent: true, includeTags: undefined, excludeTags: undefined,
    });
    expect(results).toEqual([{ json: { success: true, markdown: '# hi' } }]);
  });

  it('passes include and exclude tags', async () => {
    scrapeUrl.mockResolvedValue({ success: true });
    params['includeTags'] = ['main'];
    params['excludeTags'] = ['nav'];
    await node.execute.call(ctx) as any;
    expect(scrapeUrl.mock.calls[0][1]).toMatchObject({ includeTags: ['main'], excludeTags: ['nav'] });
  });

  it('fails when scraping is unsuccessful', async () => {
    scrapeUrl.mockResolvedValue({ success: false, error: 'blocked' });
    await expect(node.execute.call(ctx)).rejects.toThrow('The operation "scrapeUrl" failed: blocked');
  });

  it('extracts structured data with a json string schema', async () => {
    extract.mockResolvedValue({ success: true, data: { a: 1 } });
    params = { ...params, operation: 'extract', prompt: 'p', schema: '{"type":"object"}', systemPrompt: 's', enableWebSearch: true, showSources: false };
    const [results] = await node.execute.call(ctx) as any;
    expect(extract).toHaveBeenCalledWith(['https://example.com'], {
      prompt: 'p', schema: { type: 'object' }, systemPrompt: 's', enableWebSearch: true, showSources: false,
    });
    expect(results[0].json).toMatchObject({ data: { a: 1 } });
  });

  it('accepts an object schema', async () => {
    extract.mockResolvedValue({ success: true });
    params = { ...params, operation: 'extract', schema: { type: 'object' } };
    await node.execute.call(ctx) as any;
    expect(extract.mock.calls[0][1].schema).toEqual({ type: 'object' });
  });

  it('fails when extraction is unsuccessful', async () => {
    extract.mockResolvedValue({ success: false, error: 'bad' });
    params['operation'] = 'extract';
    await expect(node.execute.call(ctx)).rejects.toThrow('The operation "extract" failed: bad');
  });

  it('fails for unknown operations', async () => {
    params['operation'] = 'crawl';
    await expect(node.execute.call(ctx)).rejects.toThrow('The operation "crawl" is not implemented.');
  });

  it('caches results with postgres and serves them from the cache', async () => {
    scrapeUrl.mockResolvedValue({ success: true, markdown: 'x' });
    params['cache'] = 'postgres';
    params['cacheTTL'] = 60;
    await node.execute.call(ctx) as any;
    const [second] = await node.execute.call(ctx) as any;
    expect(ctx.getCredentials).toHaveBeenCalledWith('postgres');
    expect(scrapeUrl).toHaveBeenCalledTimes(1);
    expect(second[0].json['__cache__']).toEqual(expect.any(String));
  });
});
