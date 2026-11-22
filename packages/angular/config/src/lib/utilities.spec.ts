import {
  defaultIpfsGatewayServers,
  dnsLookup,
  dnsResolver,
  fetchCidContent,
  fetchCidContentAsJson,
  fetchCidContentViaHttp,
  fetchContentViaHttp,
  localPathIpfsGateway,
  localSubDomainIpfsGateway,
  raceSuccess,
  storachaIpfsGateway,
  w3sIpfsGateway,
} from './utilities';

function response(init: Partial<Response> & { json?: () => unknown; blob?: () => unknown }): Response {
  return { ok: true, status: 200, statusText: 'OK', ...init } as unknown as Response;
}

describe('config utilities', () => {
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn();
    (globalThis as any).fetch = fetchMock;
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'debug').mockImplementation();
  });

  afterEach(() => jest.restoreAllMocks());

  describe('raceSuccess', () => {
    it('resolves with the first success even when others reject', async () => {
      await expect(raceSuccess([Promise.reject(new Error('a')), Promise.resolve(2)])).resolves.toBe(2);
    });

    it('rejects when all reject', async () => {
      await expect(raceSuccess([Promise.reject(1), Promise.reject(2)])).rejects.toThrow('All promises were rejected');
    });
  });

  describe('dnsResolver', () => {
    it('returns the unquoted TXT data', async () => {
      fetchMock.mockResolvedValue(response({ json: async () => ({ Answer: [{ data: '"ipfs://abc"' }] }) }));
      await expect(dnsResolver('https://dns', 'x.com', 'TXT')).resolves.toBe('ipfs://abc');
      expect(fetchMock.mock.calls[0][0]).toBe('https://dns?name=x.com&type=TXT');
      expect(fetchMock.mock.calls[0][1].headers.Accept).toBe('application/dns-json');
    });

    it('throws on non ok responses', async () => {
      fetchMock.mockResolvedValue(response({ ok: false, status: 500, statusText: 'Boom' }));
      await expect(dnsResolver('e', 'n', 'TXT')).rejects.toThrow('Failed to resolve DNS via e (500): Boom');
    });

    it.each([null, {}, { Answer: [] }, { Answer: [{}] }])('throws on invalid structure %j', async (body) => {
      fetchMock.mockResolvedValue(response({ json: async () => body }));
      await expect(dnsResolver('e', 'n', 'TXT')).rejects.toThrow('Invalid DNS response structure');
    });
  });

  describe('dnsLookup', () => {
    it('requires servers', async () => {
      await expect(dnsLookup('a', 'txt', [])).rejects.toThrow('No DNS servers provided');
    });

    it('uses the first successful server and uppercases the type', async () => {
      fetchMock
        .mockRejectedValueOnce(new Error('down'))
        .mockResolvedValueOnce(response({ json: async () => ({ Answer: [{ data: 'v' }] }) }));
      await expect(dnsLookup('a', 'txt', ['s1', 's2'])).resolves.toBe('v');
      expect(fetchMock.mock.calls[0][0]).toContain('type=TXT');
    });

    it('wraps failures in a specific error', async () => {
      fetchMock.mockRejectedValue(new Error('down'));
      await expect(dnsLookup('a.com', 'txt', ['s1'])).rejects.toThrow('DNS lookup failed for a.com (TXT)');
    });
  });

  describe('gateways', () => {
    it('builds gateway urls', () => {
      expect(w3sIpfsGateway('cid')).toBe('https://cid.ipfs.w3s.link');
      expect(storachaIpfsGateway('cid')).toBe('https://cid.ipfs.storacha.link');
      expect(localPathIpfsGateway('cid')).toBe(`${location.origin}/ipfs/cid`);
      expect(localSubDomainIpfsGateway('cid')).toBe(`https://cid.ipfs.${location.hostname.split('.').slice(-2).join('.')}`);
      expect(defaultIpfsGatewayServers).toHaveLength(4);
    });
  });

  describe('fetchContentViaHttp', () => {
    it('emits the blob and completes', async () => {
      const blob = {} as Blob;
      fetchMock.mockResolvedValue(response({ blob: async () => blob }));
      const next = jest.fn();
      const complete = jest.fn();
      fetchContentViaHttp('u').subscribe({ next, complete });
      await new Promise(r => setTimeout(r));
      expect(next).toHaveBeenCalledWith(blob);
      expect(complete).toHaveBeenCalled();
    });

    it('warns and emits nothing for http errors', async () => {
      fetchMock.mockResolvedValue(response({ ok: false, status: 404, statusText: 'NF' }));
      const next = jest.fn();
      fetchContentViaHttp('u').subscribe({ next });
      await new Promise(r => setTimeout(r));
      expect(next).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalled();
    });

    it('completes without a value when the request fails', async () => {
      fetchMock.mockResolvedValue(response({ ok: false, status: 500, statusText: 'ERR' }));
      const next = jest.fn();
      const complete = jest.fn();
      const error = jest.fn();
      fetchContentViaHttp('u').subscribe({ next, complete, error });
      await new Promise(r => setTimeout(r));
      expect(next).not.toHaveBeenCalled();
      expect(error).not.toHaveBeenCalled();
      expect(complete).toHaveBeenCalled();
    });

    it('completes without a value when fetch rejects', async () => {
      fetchMock.mockRejectedValue(new Error('network'));
      const complete = jest.fn();
      fetchContentViaHttp('u').subscribe({ complete });
      await new Promise(r => setTimeout(r));
      expect(complete).toHaveBeenCalled();
    });

    it('passes an abort signal to fetch', () => {
      fetchMock.mockReturnValue(new Promise(() => undefined));
      const sub = fetchContentViaHttp('u').subscribe();
      const signal = fetchMock.mock.calls.at(-1)?.[1]?.signal as AbortSignal;
      expect(signal).toBeInstanceOf(AbortSignal);
      sub.unsubscribe();
      expect(signal.aborted).toBe(true);
    });
  });

  describe('fetchCidContentViaHttp', () => {
    it('throws without gateways', () => {
      expect(() => fetchCidContentViaHttp('c', undefined, [])).toThrow('No IPFS gateway servers');
    });

    it('returns the first gateway result and joins the path', async () => {
      const blob = {} as Blob;
      fetchMock.mockImplementation(async (url: string) => {
        if (url.startsWith('https://fast')) return response({ blob: async () => blob });
        return new Promise(() => undefined);
      });
      const gateways = [(c: string) => `https://slow/${c}`, (c: string) => `https://fast/${c}`];
      const result = await new Promise(resolve => fetchCidContentViaHttp('cid', 'a.json', gateways).subscribe(resolve));
      expect(result).toBe(blob);
      expect(fetchMock.mock.calls.map(c => c[0])).toEqual(expect.arrayContaining(['https://fast/cid/a.json']));
    });
  });

  describe('fetchCidContent', () => {
    it('returns null when fetching fails', async () => {
      // an empty gateway list makes the underlying race throw, which is reported as null
      await expect(fetchCidContent('c', undefined, [])).resolves.toBeNull();
      expect(console.error).toHaveBeenCalled();
    });

    it('returns the blob', async () => {
      const blob = {} as Blob;
      fetchMock.mockResolvedValue(response({ blob: async () => blob }));
      await expect(fetchCidContent('c', undefined, [c => `https://g/${c}`])).resolves.toBe(blob);
    });
  });

  describe('fetchCidContentAsJson', () => {
    it('parses the blob text', async () => {
      const fetcher = jest.fn().mockResolvedValue({ text: async () => '{"a":1}' });
      await expect(fetchCidContentAsJson('c', 'p', fetcher, [])).resolves.toEqual({ a: 1 });
      expect(fetcher).toHaveBeenCalledWith('c', 'p', []);
    });

    it('returns null for invalid json', async () => {
      const fetcher = jest.fn().mockResolvedValue({ text: async () => 'nope' });
      await expect(fetchCidContentAsJson('c', undefined, fetcher)).resolves.toBeNull();
    });

    it('returns null without a blob', async () => {
      await expect(fetchCidContentAsJson('c', undefined, jest.fn().mockResolvedValue(null))).resolves.toBeNull();
    });
  });
});
