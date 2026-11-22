import { InternalServerErrorException } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { HttpParams } from './http.params';
import { OpenApiConfigService } from './open-api-config.service';
import { OpenApiOperationCommand, IsReferenceObject } from './open-api-operation.command';
import { OpenApiOperationCommandException } from './open-api-operation-command-exception';
import { OperationCommand } from './operation-command';
import { OpenApiServerId } from './open-api-server-id';
import { OPEN_API_SERVER_CONFIG, OPEN_API_UPSTREAM_INTERCEPTOR } from './tokens';

const makeOperation = (extra: Record<string, any> = {}) => ({
  path: '/items/{id}',
  method: 'get',
  operationId: 'getItem',
  parameters: [
    { name: 'id', in: 'path', required: true },
    { name: 'q', in: 'query' },
    { name: 'X-Trace', in: 'header' },
  ],
  responses: { '200': { content: { 'application/json': {} } } },
  ...extra,
});

function commandFor(operation: any, asString = false) {
  @OperationCommand({
    operation: asString ? JSON.stringify(operation) : operation,
    operationId: operation.operationId,
    serverId: 'srv',
  })
  class Cmd extends OpenApiOperationCommand {}
  return Cmd;
}

function setup(operation: any = makeOperation(), asString = false) {
  const Cmd = commandFor(operation, asString);
  const http = { request: jest.fn() };
  const logger = { debug: jest.fn(), verbose: jest.fn(), log: jest.fn(), error: jest.fn(), warn: jest.fn() };
  const config = new OpenApiConfigService(
    [{ id: 'srv', url: 'http://up' }] as any,
    [] as any,
    { debug: jest.fn(), error: jest.fn(), verbose: jest.fn() } as any,
  );
  const cmd = new Cmd(http as any, config, logger as any) as any;
  return { cmd, http, logger, config };
}

describe('OpenApiOperationCommand', () => {
  describe('construction', () => {
    it('reads the operation from metadata (object or JSON string)', () => {
      expect(setup().cmd.operation.operationId).toBe('getItem');
      expect(setup(makeOperation(), true).cmd.operation.operationId).toBe('getItem');
      expect(setup().cmd.serverId).toBe('srv');
    });

    it('fails without @OperationCommand', () => {
      class Plain extends OpenApiOperationCommand {}
      expect(() => new Plain({} as any, {} as any, {} as any)).toThrow(InternalServerErrorException);
    });

    it('IsReferenceObject', () => {
      expect(IsReferenceObject({ $ref: '#/x' })).toBe(true);
      expect(IsReferenceObject({})).toBe(false);
      expect(IsReferenceObject(undefined)).toBe(false);
    });
  });

  describe('buildPathParams', () => {
    it('substitutes and encodes path parameters', () => {
      const { cmd } = setup();
      expect(cmd.buildPathParams('/items/{id}', { id: 'a b' })).toBe('/items/a%20b');
    });

    it('returns the path untouched without path parameters', () => {
      const { cmd } = setup(makeOperation({ parameters: [] }));
      expect(cmd.buildPathParams('/items')).toBe('/items');
    });

    it('requires parameters and values', () => {
      const { cmd } = setup();
      expect(() => cmd.buildPathParams('/items/{id}')).toThrow('are not defined');
      expect(() => cmd.buildPathParams('/items/{id}', {})).toThrow("has not a defined value for 'id'");
    });

    it('requires placeholders in the path', () => {
      const { cmd } = setup();
      expect(() => cmd.buildPathParams('/items', { id: '1' })).toThrow('should have parameters');
    });
  });

  describe('buildHeaders', () => {
    it('adds header params and the json content type', () => {
      const { cmd } = setup(makeOperation({ requestBody: { content: { 'application/json': {} } } }));
      expect(cmd.buildHeaders({ 'X-Trace': 't' })).toEqual({ 'X-Trace': 't', 'Content-Type': 'application/json' });
    });

    it('throws for missing required headers', () => {
      const { cmd } = setup(makeOperation({ parameters: [{ name: 'H', in: 'header', required: true }] }));
      expect(() => cmd.buildHeaders({})).toThrow("The header 'H' is required");
      expect(() => cmd.buildHeaders()).toThrow("The header 'H' is required");
    });
  });

  describe('buildRequestParams', () => {
    it('serializes objects and arrays, skipping empty values', () => {
      const { cmd } = setup(makeOperation({ parameters: [{ name: 'a', in: 'query' }, { name: 'b', in: 'query' }, { name: 'c', in: 'query' }, { name: 'd', in: 'query' }] }));
      expect(cmd.buildRequestParams({ a: { x: 1 }, b: [1, { y: 2 }], c: [], d: null })).toEqual({
        a: '{"x":1}',
        b: [1, '{"y":2}'],
      });
    });

    it('returns {} without query parameters', () => {
      expect(setup(makeOperation({ parameters: [] })).cmd.buildRequestParams({ a: 1 })).toEqual({});
    });

    it('throws for missing required queries', () => {
      const { cmd } = setup(makeOperation({ parameters: [{ name: 'q', in: 'query', required: true }] }));
      expect(() => cmd.buildRequestParams({})).toThrow("The query 'q' is required");
    });
  });

  describe('buildRequestBody', () => {
    const withBody = (contentType: string | null) =>
      setup(makeOperation({ requestBody: contentType ? { content: { [contentType]: {} } } : undefined })).cmd;

    it('omits the body when the operation defines none', () => {
      const { cmd, logger } = setup();
      expect(cmd.buildRequestBody({ a: 1 })).toEqual([undefined, undefined]);
      expect(logger.verbose).toHaveBeenCalled();
      expect(cmd.buildRequestBody()).toEqual([undefined, undefined]);
    });

    it('passes json bodies through', () => {
      expect(withBody('application/json').buildRequestBody({ a: 1 })).toEqual([{ a: 1 }, 'application/json']);
    });

    it('encodes form urlencoded bodies', () => {
      expect(withBody('application/x-www-form-urlencoded').buildRequestBody({ a: 'x y', b: [1, 2] })).toEqual([
        'a=x%20y&b=1&b=2',
        'application/x-www-form-urlencoded',
      ]);
    });

    it('builds multipart form data', () => {
      const [data, type] = withBody('multipart/form-data').buildRequestBody({
        s: 'str',
        n: 1,
        b: true,
        list: ['a', 'b'],
        buf: Buffer.from('x'),
        ab: new ArrayBuffer(1),
        u8: new Uint8Array(1),
        u16: new Uint16Array(1),
        u32: new Uint32Array(1),
        blob: new Blob(['x']),
      });
      expect(type).toBe('multipart/form-data');
      expect(data).toBeInstanceOf(FormData);
      expect(data.getAll('list')).toEqual(['a', 'b']);
      expect(data.get('n')).toBe('1');
      expect(data.get('b')).toBe('true');
      expect(data.get('buf')).toBeInstanceOf(Blob);
    });

    it('rejects unsupported multipart values', () => {
      expect(() => withBody('multipart/form-data').buildRequestBody({ x: { y: 1 } })).toThrow('Unsupported value type');
    });

    it('passes other content types through and warns for many', () => {
      const { cmd, logger } = setup(makeOperation({ requestBody: { content: { 'text/plain': {}, 'text/csv': {} } } }));
      expect(cmd.buildRequestBody('abc')).toEqual(['abc', 'text/plain']);
      expect(logger.warn).toHaveBeenCalled();
    });
  });

  describe('getResponseType', () => {
    it('detects json, text and default', () => {
      expect(setup().cmd.getResponseType()).toBe('json');
      expect(setup(makeOperation({ responses: { '201': { content: { 'text/plain': {} } } } })).cmd.getResponseType()).toBe('text');
      expect(setup(makeOperation({ responses: { '200': {} } })).cmd.getResponseType()).toBe('text');
      expect(setup(makeOperation({ responses: { default: {} } })).cmd.getResponseType()).toBe('json');
    });
  });

  describe('stringifyData', () => {
    it('truncates long arrays and handles FormData', () => {
      const { cmd } = setup();
      expect(cmd.stringifyData({ a: [1, 2, 3, 4, 5] })).toBe('{"a":[1,2,3,"2 more items ..."]}');
      expect(cmd.stringifyData(new FormData())).toBe('<form-data>');
    });
  });

  describe('buildRequestConfig', () => {
    it('builds the full request and applies interceptors', async () => {
      const { cmd, config } = setup(makeOperation({ requestBody: { content: { 'application/json': {} } } }));
      jest.spyOn(config, 'getInterceptors').mockReturnValue([
        { intercept: (c: any) => ({ ...c, headers: { ...c.headers, Auth: 'x' } }) },
      ]);
      const c = await cmd.buildRequestConfig({ parameters: { id: '1', q: 'z' }, body: { a: 1 } });
      expect(c).toMatchObject({
        url: 'http://up/items/1',
        method: 'get',
        params: { q: 'z' },
        data: { a: 1 },
        responseType: 'json',
        timeout: 60000,
      });
      expect(c.headers).toMatchObject({ 'Content-Type': 'application/json', Auth: 'x' });
    });

    it('skips interceptors when requested', async () => {
      const { cmd, config } = setup();
      const spy = jest.spyOn(config, 'getInterceptors');
      await cmd.buildRequestConfig({ parameters: { id: '1' }, skipInterceptors: true });
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('execute', () => {
    it('returns the response data and logs', async () => {
      const { cmd, http, logger } = setup(makeOperation({ requestBody: { content: { 'application/json': {} } } }));
      http.request.mockReturnValue(of({ status: 200, data: { ok: true } }));
      await expect(cmd.execute({ parameters: { id: '1' }, body: { a: 1 } })).resolves.toEqual({ ok: true });
      expect(logger.debug).toHaveBeenCalledWith(expect.stringContaining('GET http://up/items/1'), 'Cmd');
      expect(logger.verbose).toHaveBeenCalledWith(expect.stringContaining('RESPONSE 200'), 'Cmd');
    });

    it('logs empty responses and respects log=false', async () => {
      const { cmd, http, logger } = setup();
      http.request.mockReturnValue(of({ status: 204, data: undefined }));
      await cmd.execute({ parameters: { id: '1' } });
      expect(logger.verbose).toHaveBeenCalledWith(expect.stringContaining('<empty>'), 'Cmd');
      logger.debug.mockClear();
      cmd.log = false;
      await cmd.execute({ parameters: { id: '1' } });
      expect(logger.debug).not.toHaveBeenCalled();
    });

    it('wraps request config errors', async () => {
      const { cmd } = setup();
      await expect(cmd.execute({})).rejects.toThrow('Could not build command request config');
    });

    it('throws OpenApiOperationCommandException for axios responses', async () => {
      const { cmd, http } = setup();
      const err: any = Object.assign(new Error('fail'), {
        isAxiosError: true,
        config: { method: 'get', url: 'http://up/items/1', params: { q: 1 }, data: '{"x":1}' },
        response: { status: 404, data: { message: 'not found' } },
      });
      http.request.mockReturnValue(throwError(() => err));
      const e = await cmd.execute({ parameters: { id: '1' } }).catch((x: any) => x);
      expect(e).toBeInstanceOf(OpenApiOperationCommandException);
      expect(e.message).toBe('not found');
      expect(e.response.status).toBe(404);
      expect(e.serverId).toBe('srv');
    });

    it('falls back to the axios message', async () => {
      const { cmd, http } = setup();
      http.request.mockReturnValue(throwError(() => ({ isAxiosError: true, message: 'm', config: { method: 'get' }, response: { status: 500 } })));
      await expect(cmd.execute({ parameters: { id: '1' } })).rejects.toMatchObject({ message: 'm' });
    });

    it('maps axios errors without response and non axios errors to 500', async () => {
      const { cmd, http, logger } = setup();
      jest.spyOn(console, 'log').mockImplementation(() => undefined);
      http.request.mockReturnValue(throwError(() => ({ isAxiosError: true, message: 'net', config: { method: 'get', url: 'u' } })));
      await expect(cmd.execute({ parameters: { id: '1' } })).rejects.toBeInstanceOf(InternalServerErrorException);
      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('without response'), 'Cmd');
      http.request.mockReturnValue(throwError(() => ({ isAxiosError: true, message: 'nocfg' })));
      await expect(cmd.execute({ parameters: { id: '1' } })).rejects.toBeInstanceOf(InternalServerErrorException);
      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('without config'), 'Cmd');
      http.request.mockReturnValue(throwError(() => new Error('boom')));
      await expect(cmd.execute({ parameters: { id: '1' } })).rejects.toThrow('boom');
      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('NonAxiosError'), 'Cmd');
    });
  });
});

describe('OpenApiConfigService', () => {
  const logger: any = { debug: jest.fn(), error: jest.fn(), verbose: jest.fn() };

  @OpenApiServerId('a')
  class InterA {
    intercept(c: any) { return c; }
  }
  @OpenApiServerId('__default__')
  class InterDefault {
    intercept(c: any) { return c; }
  }
  class NoId {
    intercept(c: any) { return c; }
  }

  it('coerces single configs and finds base urls', () => {
    const s = new OpenApiConfigService({ id: 'a', url: 'http://a' } as any, [] as any, logger);
    expect(s.getBaseUrl('a')).toBe('http://a');
    expect(s.buildUrl('/p', 'a')).toBe('http://a/p');
    expect(s.buildUrl('/p')).toBe('/p');
    expect(() => s.getBaseUrl('missing')).toThrow("Could not find server config for: 'missing'");
  });

  it('logs when no server config is provided', () => {
    new OpenApiConfigService([] as any, [] as any, logger);
    expect(logger.debug).toHaveBeenCalledWith('No server config provided', 'OpenApiConfigService');
  });

  it('groups interceptors by server id and merges defaults', () => {
    const a = new InterA();
    const d = new InterDefault();
    const s = new OpenApiConfigService([] as any, [a, d] as any, logger);
    expect(s.getInterceptors('a')).toEqual([a, d]);
    expect(s.getInterceptors('other')).toEqual([d]);
  });

  it('requires the @OpenApiServerId decorator', () => {
    expect(() => new OpenApiConfigService([] as any, [new NoId()] as any, logger)).toThrow('@OpenApiServerId');
    const s = new OpenApiConfigService([] as any, [] as any, logger);
    expect(() => s.addUpstreamInterceptor(new NoId())).toThrow('@OpenApiServerId');
  });

  it('adds interceptors and server configs', () => {
    const s = new OpenApiConfigService([] as any, [] as any, logger);
    const a1 = new InterA();
    s.addUpstreamInterceptor(a1);
    s.addUpstreamInterceptor(new InterA());
    expect(s.getInterceptors('a')).toHaveLength(2);
    s.addServerConfig({ id: 'x', url: 'u' });
    expect(() => s.addServerConfig({ id: 'x', url: 'u' })).toThrow('already exists');
  });

  it('exposes injection tokens', () => {
    expect(typeof OPEN_API_SERVER_CONFIG).toBe('symbol');
    expect(typeof OPEN_API_UPSTREAM_INTERCEPTOR).toBe('symbol');
  });
});

describe('HttpParams', () => {
  it('builds query strings', () => {
    expect(HttpParams.ToHttpQueryString()).toBe('');
    expect(HttpParams.ToHttpQueryString({ a: 'x y', b: [1, 2], c: true })).toBe('?a=x%20y&b=1&b=2&c=true');
  });

  it('appends and de-duplicates values', () => {
    const p = new HttpParams();
    p.append('a', 1);
    expect(p.has('a')).toBe(true);
    p.append('a', 2);
    p.append('a', [2, 3]);
    p.append('b', 'x');
    p.append('b', ['y']);
    expect(p.toString()).toBe('a=1&a=2&a=3&b=x&b=y');
  });
});

describe('OpenApiOperationCommandException', () => {
  const make = (config: any = {}, response: any = { status: 500, data: 'd' }) =>
    new OpenApiOperationCommandException('srv', response, config, { operationId: 'op' } as any, 'rid', 'msg');

  it('builds a descriptive name', () => {
    expect(make({ method: 'get' }).name).toBe('UpstreamAPI Error - [GET] 500 op@srv');
  });

  it('sets sentry scope data', () => {
    const scope = { setExtra: jest.fn(), setTag: jest.fn() };
    make({ data: 'body', headers: { a: 1 }, url: 'u', params: { q: 1 } }).setScope(scope as any);
    expect(scope.setExtra).toHaveBeenCalledWith('upstreamRequest', { body: 'body', headers: { a: 1 }, url: 'u', params: { q: 1 } });
    expect(scope.setExtra).toHaveBeenCalledWith('upstreamResponse', { body: 'd', status: 500 });
    expect(scope.setTag).toHaveBeenCalledWith('operationId', 'op');
    expect(scope.setTag).toHaveBeenCalledWith('upstreamServerId', 'srv');
  });

  it('uses placeholders for empty data', () => {
    const scope = { setExtra: jest.fn(), setTag: jest.fn() };
    make({}).setScope(scope as any);
    expect(scope.setExtra).toHaveBeenCalledWith('upstreamRequest', { body: '<empty>', headers: '<none>', url: undefined, params: '<none>' });
  });
});
