import { ToolFirecrawl } from './ToolFirecrawl.node';

const scrapeUrl = jest.fn();
const extract = jest.fn();
const keyvStore = new Map<string, any>();

jest.mock('@mendable/firecrawl-js', () => ({
  __esModule: true,
  default: jest.fn(() => ({ v1: { scrapeUrl, extract } })),
}));
jest.mock('@keyv/postgres', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('keyv', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    has: async (k: string) => keyvStore.has(k),
    get: async (k: string) => keyvStore.get(k),
    set: async (k: string, v: any) => { keyvStore.set(k, v); },
  })),
}));

describe('ToolFirecrawl node', () => {
  const node = new ToolFirecrawl();
  let params: Record<string, any>;
  let ctx: any;

  beforeEach(() => {
    jest.clearAllMocks();
    keyvStore.clear();
    params = {
      operation: 'scrapeUrl',
      toolDescription: 'scrape',
      url: 'https://example.com/{path}',
      'placeholderDefinitions.values': [{ name: '{path}', type: 'string', description: 'p' }],
      includeTags: ['{tag}'],
    };
    ctx = {
      getNodeParameter: jest.fn((name: string, _i: number, def?: any) => name in params ? params[name] : def),
      getCredentials: jest.fn(async () => ({ apiKey: 'k', host: 'h', database: 'd', user: 'u', password: 'p', ssl: 'disable', port: 1 })),
      getNode: jest.fn(() => ({ name: 'Firecrawl Tool' })),
      addInputData: jest.fn(() => ({ index: 1 })),
      addOutputData: jest.fn(),
      logger: { debug: jest.fn() },
    };
  });

  it('describes the node', () => {
    expect(node.description.name).toBe('toolFirecrawl');
    expect(node.description.credentials!.map((c) => c.name)).toEqual(['firecrawl', 'postgres']);
  });

  it('supplies a tool that scrapes with substituted placeholders', async () => {
    scrapeUrl.mockResolvedValue({ success: true, markdown: 'm' });
    params['includeTags'] = ['{path}-tag'];
    params['excludeTags'] = ['x-{path}'];
    const { response } = await node.supplyData.call(ctx, 0);
    expect((response as any).name).toBe('firecrawl');
    const result = await (response as any).func({ path: 'docs' });
    expect(scrapeUrl).toHaveBeenCalledWith('https://example.com/docs', {
      formats: ['markdown'], onlyMainContent: true, includeTags: ['docs-tag'], excludeTags: ['x-docs'],
    });
    expect(JSON.parse(result)).toEqual({ success: true, markdown: 'm' });
    expect(ctx.addInputData).toHaveBeenCalled();
  });

  it('accepts a json string query and caches with postgres', async () => {
    scrapeUrl.mockResolvedValue({ success: true });
    params['cache'] = 'postgres';
    params['cacheTTL'] = 10;
    const { response } = await node.supplyData.call(ctx, 0);
    await (response as any).func('{"path":"a"}');
    const second = await (response as any).func('{"path":"a"}');
    expect(scrapeUrl).toHaveBeenCalledTimes(1);
    expect(JSON.parse(second).__cache__).toBeDefined();
  });

  it('extracts data', async () => {
    extract.mockResolvedValue({ success: true, data: 1 });
    params['operation'] = 'extract';
    params['schema'] = '{"type":"object"}';
    params['prompt'] = 'p';
    const { response } = await node.supplyData.call(ctx, 0);
    await (response as any).func({ path: 'x' });
    expect(extract).toHaveBeenCalledWith(['https://example.com/x'], expect.objectContaining({ prompt: 'p', schema: { type: 'object' } }));
  });

  it('propagates scrape and extract failures', async () => {
    scrapeUrl.mockResolvedValue({ success: false, error: 'e1' });
    const { response } = await node.supplyData.call(ctx, 0);
    await expect((response as any).func({ path: 'x' })).rejects.toThrow('"scrapeUrl" failed: e1');

    extract.mockResolvedValue({ success: false, error: 'e2' });
    params['operation'] = 'extract';
    const { response: r2 } = await node.supplyData.call(ctx, 0);
    await expect((r2 as any).func({ path: 'x' })).rejects.toThrow('"extract" failed: e2');
  });

  it('rejects unknown operations when the tool is called', async () => {
    params['operation'] = 'crawl';
    const { response } = await node.supplyData.call(ctx, 0);
    await expect((response as any).func({ path: 'x' })).rejects.toThrow('not implemented');
  });

  it('rejects unused placeholder definitions', async () => {
    params['url'] = 'https://example.com';
    await expect(node.supplyData.call(ctx, 0)).rejects.toThrow("Misconfigured placeholder 'path'");
  });

  it('keeps placeholder names that are not wrapped in braces', async () => {
    params['placeholderDefinitions.values'] = [{ name: 'path', type: 'string', description: 'p' }];
    await expect(node.supplyData.call(ctx, 0)).resolves.toBeDefined();
  });
});
