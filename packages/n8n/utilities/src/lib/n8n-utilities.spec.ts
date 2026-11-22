import { mkdtempSync, mkdirSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import Keyv from 'keyv';
import { NodeOperationError } from 'n8n-workflow';
import { addFilesToResults } from './add-files-to-results';
import { BaseUrl } from './BaseUrl.credentials';
import { cached } from './cached';
import { CaptureExecutionError } from './capture-execution-error.decorator';
import { forEachItem } from './for-each-item';
import { HttpBearerAuth } from './HttpBearerAuth.credentials';
import { OpenApiNode, ResolveRef } from './open-api-node';
import { OpenApiToolNode } from './open-api-tool-node';
import { Oauth2ProxyAuth } from './Oauth2ProxyAuth.credentials';

describe('credentials', () => {
  it('BaseUrl exposes a baseUrl property', () => {
    const c = new BaseUrl();
    expect(c.name).toBe('baseUrl');
    expect(c.properties.map((p) => p.name)).toEqual(['baseUrl']);
  });

  it('HttpBearerAuth sends a bearer header', () => {
    const c = new HttpBearerAuth();
    expect(c.properties[0].typeOptions).toEqual({ password: true });
    expect((c.authenticate as any).properties.headers.Authorization).toContain('Bearer');
  });

  it('Oauth2ProxyAuth sends proxy headers', () => {
    const c = new Oauth2ProxyAuth();
    expect(c.properties.map((p) => p.name)).toEqual(['userId', 'organizationId']);
    expect(Object.keys((c.authenticate as any).properties.headers)).toEqual([
      'x-auth-request-user',
      'x-organization',
    ]);
  });
});

describe('cached', () => {
  it('calls the function directly when disabled or without keyv', async () => {
    const fn = jest.fn(async (a: number) => ({ a }));
    expect(await cached({ disabled: true, keyv: new Keyv() }, fn, 1)).toEqual({ a: 1 });
    expect(await cached({}, fn, 2)).toEqual({ a: 2 });
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('stores the result and serves it from the cache', async () => {
    const keyv = new Keyv();
    const fn = jest.fn(async (a: number) => ({ a }));
    const first = await cached({ keyv }, fn, 1);
    expect(first).toEqual({ a: 1 });
    const second: any = await cached({ keyv }, fn, 1);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(second.a).toBe(1);
    expect(typeof second.__cache__).toBe('string');
    await cached({ keyv }, fn, 2);
    expect(fn).toHaveBeenCalledTimes(2);
  });
});

describe('CaptureExecutionError', () => {
  class Host {
    constructor(public cof: boolean, public impl: () => any) {}
    continueOnFail() {
      return this.cof;
    }
    @CaptureExecutionError()
    run(): any {
      return this.impl();
    }
  }

  it('returns non promise results as-is', () => {
    expect(new Host(false, () => 5).run()).toBe(5);
  });

  it('passes successful output through', async () => {
    const out = [[{ json: { a: 1 } }]];
    await expect(new Host(false, async () => out).run()).resolves.toBe(out);
  });

  it('throws the first item error when continueOnFail is false', async () => {
    const error = new Error('x');
    await expect(
      new Host(false, async () => [[{ json: {}, error }]]).run(),
    ).rejects.toBe(error);
  });

  it('converts rejections into error items when continueOnFail is true', async () => {
    const error = new Error('boom');
    const res = await new Host(true, async () => {
      throw error;
    }).run();
    expect(res).toEqual([[{ json: error, error }]]);
  });
});

describe('forEachItem', () => {
  const ctx = (items: any[]) =>
    ({ getInputData: () => items, getNode: () => ({ name: 'n' }) }) as any;

  it('maps every item', async () => {
    const res = await forEachItem.call(ctx([{ json: { a: 1 } }, { json: { a: 2 } }]), (item, i) => ({
      json: { v: (item.json as any).a * 10, i },
    }));
    expect(res).toEqual([{ json: { v: 10, i: 0 } }, { json: { v: 20, i: 1 } }]);
  });

  it('keeps NodeOperationErrors and wraps other errors', async () => {
    const c = ctx([{ json: {} }, { json: {} }]);
    const own = new NodeOperationError({ name: 'n' } as any, 'own');
    const res = await forEachItem.call(c, (_item, i) => {
      throw i === 0 ? own : new Error('plain');
    });
    expect(res[0].error).toBe(own);
    expect(res[1].error).toBeInstanceOf(NodeOperationError);
    expect(res[1].json).toEqual({});
  });
});

describe('addFilesToResults', () => {
  it('adds all files recursively with sanitized names', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'n8n-files-'));
    mkdirSync(join(dir, 'sub'));
    writeFileSync(join(dir, 'a.txt'), 'A');
    writeFileSync(join(dir, 'sub', 'b.json'), 'B');
    const result: any = { json: {}, binary: {} };
    const prepare = jest.fn(async (buf: Buffer, path?: string) => ({
      data: buf.toString(),
      mimeType: 'x',
      fileName: path,
    }));
    await addFilesToResults(dir, dir, result, prepare as any);
    expect(Object.keys(result.binary).sort()).toEqual(['a_txt', 'sub_b_json']);
    expect(result.binary['a_txt'].data).toBe('A');
    expect(result.binary['sub_b_json'].data).toBe('B');
  });
});

describe('ResolveRef', () => {
  it('replaces component schema refs recursively', () => {
    const spec: any = {
      components: {
        schemas: {
          A: { type: 'object', properties: { b: { $ref: '#/components/schemas/B' } } },
          B: { type: 'string' },
        },
      },
    };
    const node: any = { x: { $ref: '#/components/schemas/A' } };
    ResolveRef(spec, node);
    expect(node.x.properties.b).toEqual({ type: 'string' });
  });

  it('ignores primitives and unknown refs', () => {
    expect(() => ResolveRef({} as any, 'a')).not.toThrow();
    const node: any = { x: { $ref: '#/other/A' } };
    ResolveRef({} as any, node);
    expect(node.x.$ref).toBe('#/other/A');
  });
});

describe('OpenApiNode', () => {
  const spec = {
    openapi: '3.0.0',
    info: { title: 'Pet Store', description: 'Pets' },
    paths: {
      '/pets/{id}': {
        get: {
          operationId: 'getPet',
          tags: ['pets'],
          parameters: [
            { in: 'path', name: 'id', required: true, schema: { type: 'string' } },
            { in: 'query', name: 'q', required: false, schema: { type: 'string' } },
            { in: 'header', name: 'x-h', required: true, schema: { type: 'string' } },
          ],
          responses: { 200: { description: 'ok' } },
        },
      },
      '/pets': {
        post: {
          operationId: 'createPet',
          tags: ['pets'],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    age: { type: 'number' },
                    ok: { type: 'boolean' },
                    tags: { type: 'array', items: { type: 'string' } },
                    owner: { $ref: '#/components/schemas/Owner' },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'ok' } },
        },
        put: {
          operationId: 'untagged',
          requestBody: {
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: { file: { type: 'string', format: 'binary' }, title: { type: 'string' } },
                },
              },
            },
          },
          responses: { 200: { description: 'ok' } },
        },
      },
    },
    components: {
      schemas: { Owner: { type: 'object', properties: { name: { type: 'string' } } } },
    },
  };
  let file: string;

  class PetNode extends OpenApiNode {}
  class ServiceThing extends OpenApiNode {}

  beforeAll(() => {
    const dir = mkdtempSync(join(tmpdir(), 'n8n-openapi-'));
    file = join(dir, 'openapi.json');
    writeFileSync(file, JSON.stringify(spec));
  });

  it('throws when the file does not exist', () => {
    expect(() => new PetNode('/does/not/exist.json')).toThrow('does not exist');
  });

  it('builds the node description from the spec', () => {
    const node = new PetNode(file);
    const d = node.description;
    expect(d.displayName).toBe('Pet Store');
    expect(d.name).toBe('pet-store');
    expect(d.description).toBe('Pets');
    expect(d.defaults.name).toBe('pet-store');
    const names = d.properties.map((p) => p.name);
    expect(names[0]).toBe('skipAuthentication');
    expect(names[1]).toBe('authentication');
    expect(names).toEqual(expect.arrayContaining(['resource', 'method', 'baseUrl']));
    expect(names).toEqual(expect.arrayContaining(['queryParameters', 'pathParameters', 'headerParameters']));
    expect(d.properties.find((p) => p.name === 'authentication')!.type).toBe('options');
  });

  it('applies name overrides and suffix', () => {
    class Tool extends OpenApiToolNode {}
    const tool = new Tool(file, { name: 'custom', displayName: 'Custom' });
    expect(tool.description.name).toBe('custom-tool');
    expect(tool.description.displayName).toBe('Custom');
    expect(tool.description.inputs).toEqual([]);
    expect(() => tool.supplyData(0)).toThrow('not implemented');
  });

  it('uses a service icon fallback', () => {
    expect((new ServiceThing(file).description.icon as any).light).toBe('file:ServiceThing.png');
    expect(new PetNode(file).description.icon).toBeUndefined();
  });

  it('detects icon files next to the spec', () => {
    const dir = mkdtempSync(join(tmpdir(), 'n8n-icon-'));
    const f = join(dir, 'openapi.json');
    writeFileSync(f, JSON.stringify(spec));
    writeFileSync(join(dir, 'PetNode.svg'), '');
    expect(new PetNode(f).description.icon).toBe('file:PetNode.svg');
    writeFileSync(join(dir, 'PetNode.dark.svg'), '');
    expect(new PetNode(f).description.icon).toEqual({
      light: 'file:PetNode.svg',
      dark: 'file:PetNode.dark.svg',
    });
    writeFileSync(join(dir, 'PetNode.png'), '');
    expect(new PetNode(f).description.icon).toBe('file:PetNode.png');
  });

  describe('execute', () => {
    const makeCtx = (params: Record<string, any>, extra: any = {}) => {
      const helpers = {
        request: jest.fn(async () => '{"ok":true}'),
        requestWithAuthentication: jest.fn(async () => '[{"a":1},{"a":2}]'),
        getBinaryDataBuffer: jest.fn(async () => Buffer.from('bin')),
        ...extra.helpers,
      };
      return {
        helpers,
        getInputData: () => extra.items ?? [{ json: {}, binary: extra.binary }],
        getNodeParameter: (name: string, _i: number, def?: any) =>
          name in params ? params[name] : def,
        getCredentials: jest.fn(async () => extra.credentials ?? {}),
        getNode: () => ({ name: 'n' }),
        continueOnFail: () => false,
        logger: { debug: jest.fn() },
      } as any;
    };
    const base = {
      skipAuthentication: false,
      baseUrl: 'http://x',
      method: 'get',
      path: '/pets/{id}',
      authentication: 'httpBearerAuth',
    };
    const exec = (ctx: any) => new PetNode(file).execute.call(ctx);

    it('substitutes path, query and header parameters and authenticates', async () => {
      const ctx = makeCtx({
        ...base,
        parameterSchema: spec.paths['/pets/{id}'].get.parameters,
        pathParameters: { id: 'a b' },
        queryParameters: { q: 'x y' },
        headerParameters: { 'x-h': 'hv' },
        spread: true,
      }, { credentials: { baseUrl: 'http://cred' } });
      const [res] = await exec(ctx);
      const opts = ctx.helpers.requestWithAuthentication.mock.calls[0][1];
      expect(opts.url).toBe('/pets/a%20b');
      expect(opts.qs).toEqual({ q: 'x%20y' });
      expect(opts.headers).toEqual({ 'x-h': 'hv' });
      expect(opts.baseURL).toBe('http://cred');
      expect(res).toEqual([{ json: { a: 1 } }, { json: { a: 2 } }]);
    });

    it('reports missing required parameters', async () => {
      const params = spec.paths['/pets/{id}'].get.parameters;
      await expect(exec(makeCtx({ ...base, parameterSchema: params, pathParameters: {} }))).rejects.toThrow('path parameter "id"');
      await expect(
        exec(makeCtx({ ...base, parameterSchema: [params[1]], queryParameters: {} })),
      ).resolves.toBeDefined();
      await expect(
        exec(makeCtx({ ...base, parameterSchema: [{ ...params[1], required: true }], queryParameters: {} })),
      ).rejects.toThrow('query parameter "q"');
      await expect(
        exec(makeCtx({ ...base, parameterSchema: [params[2]], headerParameters: {} })),
      ).rejects.toThrow('header parameter "x-h"');
    });

    it('skips authentication when requested and wraps non json', async () => {
      const ctx = makeCtx({ ...base, skipAuthentication: true });
      ctx.helpers.request.mockResolvedValue('plain text');
      const [res] = await exec(ctx);
      expect(ctx.helpers.request).toHaveBeenCalled();
      expect(res).toEqual([{ json: { response: 'plain text' } }]);
    });

    it('fails without an authentication method', async () => {
      await expect(exec(makeCtx({ ...base, authentication: '' }))).rejects.toThrow('No authentication');
    });

    it('sends json, plain text bodies', async () => {
      const bodySchema = { content: { 'application/json': { schema: { type: 'object' } } } };
      const ctx = makeCtx({
        ...base, skipAuthentication: true,
        requestBodySchema: bodySchema, mediaType: 'application/json', requestBody: { a: 1 },
      });
      await exec(ctx);
      expect(ctx.helpers.request.mock.calls[0][0].body).toEqual({ a: 1 });
      expect(ctx.helpers.request.mock.calls[0][0].headers['Content-Type']).toBe('application/json');
      const ctx2 = makeCtx({
        ...base, skipAuthentication: true,
        requestBodySchema: bodySchema, mediaType: 'plain/text', requestBody: { a: 1 },
      });
      await exec(ctx2);
      expect(ctx2.helpers.request.mock.calls[0][0].body).toBe('{"a":1}');
    });

    it('builds multipart form data', async () => {
      const bodySchema = spec.paths['/pets'].put.requestBody;
      const mk = (requestBody: any, binary?: any) =>
        makeCtx({
          ...base, skipAuthentication: true,
          requestBodySchema: bodySchema, mediaType: 'multipart/form-data', requestBody,
        }, { binary });
      const ok = mk({ file: 'data', title: 't' }, { data: { fileName: 'f.txt', mimeType: 'text/plain' } });
      await exec(ok);
      expect(ok.helpers.request.mock.calls[0][0].formData).toBeDefined();
      await expect(exec(mk({ title: 't' }))).rejects.toThrow('"file" is missing');
      await expect(exec(mk({ file: 'data', title: 't' }))).rejects.toThrow('binary data');
      await expect(
        exec(mk({ file: 'data', title: 't' }, { data: { mimeType: 'x' } })),
      ).rejects.toThrow('filename');
    });
  });
});
