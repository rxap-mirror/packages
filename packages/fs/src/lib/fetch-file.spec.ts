import { FetchFile } from './fetch-file';

function response(body: string, init: { ok?: boolean; status?: number; contentType?: string } = {}) {
  return {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    statusText: 'X',
    headers: { get: () => init.contentType ?? null },
    arrayBuffer: async () => new TextEncoder().encode(body).buffer,
  };
}

describe('FetchFile', () => {
  const originalFetch = global.fetch;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn();
    (global as any).fetch = fetchMock;
    jest.spyOn(console, 'debug').mockImplementation();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('derives name from fullName', () => {
    expect(new FetchFile('a/b/c.txt', 'http://x').name).toBe('c.txt');
  });

  it('fetches once and caches', async () => {
    fetchMock.mockResolvedValue(response('hello'));
    const f = new FetchFile('c.txt', 'http://x/c.txt');
    expect((await f.data).byteLength).toBe(5);
    await f.data;
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('normalizes the content-type', async () => {
    fetchMock.mockResolvedValue(response('x', { contentType: 'text/plain; charset=utf-8' }));
    const f = new FetchFile('c.txt', 'http://x');
    await f.data;
    expect(f.mimetype).toBe('text/plain');
  });

  it('rejects on http errors and retries afterwards', async () => {
    fetchMock.mockResolvedValueOnce(response('', { ok: false, status: 404 }));
    const f = new FetchFile('c.txt', 'http://x');
    await expect(f.data).rejects.toThrow('Failed to fetch http://x: 404 X');
    fetchMock.mockResolvedValueOnce(response('ok'));
    expect((await f.data).byteLength).toBe(2);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('getContent returns text or blob', async () => {
    fetchMock.mockResolvedValue(response('hello'));
    const f = new FetchFile('c.txt', 'http://x', 'text/plain');
    expect(await f.getContent()).toBe('hello');
    expect(await f.getContent()).toBe('hello');
    const b = (await f.getContent('image/png')) as Blob;
    expect(b.size).toBe(5);
    expect(b.type).toBe('image/png');
  });

  it('setMimeType, toFile and toJSON', async () => {
    fetchMock.mockResolvedValue(response('hello'));
    const f = new FetchFile('d/c.txt', 'http://x');
    f.setMimeType('text/plain');
    expect((await f.toFile()).name).toBe('c.txt');
    expect((await f.toFile(true)).name).toBe('d/c.txt');
    expect(f.toJSON()).toEqual({ name: 'c.txt', fullName: 'd/c.txt', mimetype: 'text/plain', url: 'http://x' });
  });
});
