import {
  ConfigLoadError,
  ConfigLoadErrorKind,
} from './config-load-error';
import {
  ConfigLoadOptions,
  ConfigService,
} from './config.service';

function mockResponse(init: Partial<Omit<Response, 'body'>> & { body?: any, jsonError?: Error } = {}): Response {
  return {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    statusText: init.statusText ?? 'OK',
    type: init.type ?? 'basic',
    json: jest.fn(async () => {
      if (init.jsonError) {
        throw init.jsonError;
      }
      return init.body ?? {};
    }),
  } as any;
}

const URL = 'https://example.com/config.json';

interface KindCase {
  kind: ConfigLoadErrorKind;
  fetch: () => Promise<Response>;
  schema?: ConfigLoadOptions['schema'];
  status?: number;
  hasResponse: boolean;
  hook: 'onError' | 'onRequestError';
}

describe('ConfigService config load error handling', () => {

  let fetchMock: jest.Mock;
  let originalFetch: typeof fetch;

  const redirectResponse = mockResponse({ ok: false, status: 0, type: 'opaqueredirect' });
  const httpResponse = mockResponse({ ok: false, status: 503, statusText: 'Service Unavailable' });
  const parseResponse = mockResponse({ jsonError: new SyntaxError('Unexpected token <') });
  const schemaResponse = mockResponse({ body: { value: 1 } });

  const cases: KindCase[] = [
    {
      kind: 'network',
      fetch: () => Promise.reject(new TypeError('Failed to fetch')),
      hasResponse: false,
      hook: 'onError',
    },
    {
      kind: 'redirect',
      fetch: () => Promise.resolve(redirectResponse),
      status: 0,
      hasResponse: true,
      hook: 'onRequestError',
    },
    {
      kind: 'http',
      fetch: () => Promise.resolve(httpResponse),
      status: 503,
      hasResponse: true,
      hook: 'onRequestError',
    },
    {
      kind: 'parse',
      fetch: () => Promise.resolve(parseResponse),
      status: 200,
      hasResponse: true,
      hook: 'onError',
    },
    {
      kind: 'schema',
      fetch: () => Promise.resolve(schemaResponse),
      schema: { validateAsync: () => Promise.reject(new Error('value must be a string')) },
      status: 200,
      hasResponse: true,
      hook: 'onError',
    },
  ];

  beforeEach(() => {
    jest.useFakeTimers();
    originalFetch = global.fetch;
    fetchMock = jest.fn();
    global.fetch = fetchMock;
    ConfigService.Config = null;
    ConfigService.RequestOptions = {};
    ConfigService.onErrorFnc = [];
    ConfigService.onRequestErrorFnc = [];
    document.body.innerHTML = '';
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe.each(cases)('kind $kind', (testCase) => {

    it('calls the error handler instead of the default handler for a required url', async () => {
      fetchMock.mockImplementation(testCase.fetch);
      const errorHandler = jest.fn();
      const hook = jest.fn();
      if (testCase.hook === 'onError') {
        ConfigService.onErrorFnc.push(hook);
      } else {
        ConfigService.onRequestErrorFnc.push(hook);
      }

      await expect(ConfigService.Load({
        url: URL,
        schema: testCase.schema,
        errorHandler,
      })).rejects.toThrow();

      expect(errorHandler).toHaveBeenCalledTimes(1);
      const error: ConfigLoadError = errorHandler.mock.calls[0][0];
      expect(error.kind).toBe(testCase.kind);
      expect(error.url).toBe(URL);
      expect(error.required).toBe(true);
      expect(error.status).toBe(testCase.status);
      expect(error.message).toEqual(expect.any(String));
      if (testCase.hasResponse) {
        expect(error.response).toBeDefined();
      } else {
        expect(error.response).toBeUndefined();
        expect(error.cause).toBeInstanceOf(TypeError);
      }
      expect(hook).toHaveBeenCalledTimes(1);
      expect(document.getElementById('rxap-config-error')).toBeNull();
      expect(jest.getTimerCount()).toBe(0);
    });

    it('calls the error handler and resolves with null for an optional url', async () => {
      ConfigService.Config = {};
      fetchMock.mockImplementation(testCase.fetch);
      const errorHandler = jest.fn();

      await ConfigService.SideLoad(URL, 'side', false, testCase.schema, { errorHandler });

      expect(errorHandler).toHaveBeenCalledTimes(1);
      expect(errorHandler.mock.calls[0][0]).toMatchObject({ kind: testCase.kind, url: URL, required: false });
      expect(ConfigService.Config.side).toBeNull();
      expect(document.getElementById('rxap-config-error')).toBeNull();
      expect(jest.getTimerCount()).toBe(0);
    });

  });

  it('passes requestInit to fetch', async () => {
    fetchMock.mockResolvedValue(mockResponse({ body: { a: 1 } }));
    await ConfigService.Load({ url: URL, requestInit: { redirect: 'manual' } });
    expect(fetchMock).toHaveBeenCalledWith(URL, { redirect: 'manual' });
    expect(ConfigService.Config).toEqual({ a: 1 });
  });

  it('uses the error handler and requestInit from Load for SideLoad', async () => {
    const errorHandler = jest.fn();
    fetchMock.mockResolvedValueOnce(mockResponse({ body: {} }));
    await ConfigService.Load({ url: URL, errorHandler, requestInit: { redirect: 'manual' } });

    fetchMock.mockResolvedValueOnce(redirectResponse);
    await expect(ConfigService.SideLoad('https://example.com/side.json', 'side', true)).rejects.toThrow();

    expect(fetchMock).toHaveBeenLastCalledWith('https://example.com/side.json', { redirect: 'manual' });
    expect(errorHandler).toHaveBeenCalledWith(expect.objectContaining({ kind: 'redirect', required: true }));
    expect(jest.getTimerCount()).toBe(0);
  });

  it('still throws for a required url if the error handler throws', async () => {
    fetchMock.mockResolvedValue(httpResponse);
    const errorHandler = jest.fn(() => {
      throw new Error('handler failed');
    });
    await expect(ConfigService.Load({ url: URL, errorHandler })).rejects.toThrow(/non ok response/);
    expect(errorHandler).toHaveBeenCalled();
  });

  describe('without error handler', () => {

    it('shows the error overlay and schedules a reload for a required url', async () => {
      fetchMock.mockResolvedValue(mockResponse({ ok: false, status: 404, statusText: 'Not Found' }));
      const hook = jest.fn();
      ConfigService.onRequestErrorFnc.push(hook);

      await expect(ConfigService.Load({ url: URL })).rejects.toThrow(`Config not found at '${ URL }'`);

      const ul = document.getElementById('rxap-config-error');
      expect(ul).not.toBeNull();
      expect((ul!.children[0] as HTMLElement).innerText).toBe(`Config not found at '${ URL }'`);
      expect(jest.getTimerCount()).toBe(1);
      expect(hook).toHaveBeenCalledTimes(1);
    });

    it('logs a warning and resolves with null for an optional url', async () => {
      ConfigService.Config = {};
      fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

      await ConfigService.SideLoad(URL, 'side', false);

      expect(ConfigService.Config.side).toBeNull();
      expect(console.warn).toHaveBeenCalledWith(`Could not fetch config from '${ URL }': Failed to fetch`);
      expect(document.getElementById('rxap-config-error')).toBeNull();
      expect(jest.getTimerCount()).toBe(0);
    });

  });

});
