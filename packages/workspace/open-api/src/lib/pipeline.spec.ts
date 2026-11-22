import { Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Project } from 'ts-morph';
import { GenerateInterfaces } from './generate-interfaces';
import { GenerateOperation } from './generate-operation';
import { LoadOpenApiConfig } from './load-open-api-config';
import { CreateComponentTypeAliasSourceFile } from './utilities/create-component-type-alias-source-file';
import { HttpRequest } from './utilities/http-request';
import * as http from 'http';
import { AddressInfo } from 'net';

const spec: any = {
  openapi: '3.0.0',
  info: { title: 't', version: '1' },
  components: { schemas: { User: { type: 'object', properties: { id: { type: 'string' } } } } },
  paths: {
    '/users': {
      get: {
        operationId: 'list-users',
        parameters: [ { name: 'limit', in: 'query', required: true, schema: { type: 'number' } } ],
        responses: { 200: { description: 'x', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/User' } } } } } },
      },
      post: {
        operationId: 'create-user',
        requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' } } } } } },
        responses: { 200: { description: 'x', content: { 'application/json': { schema: { type: 'object', properties: { id: { type: 'string' } } } } } } },
      },
      delete: { operationId: 'hidden-op', tags: [ 'hidden' ], responses: {} },
      put: { responses: {} },
    },
  },
};

describe('GenerateInterfaces', () => {
  let log: jest.SpyInstance[];
  beforeEach(() => {
    log = [ 'log', 'debug', 'warn', 'error' ].map(k => jest.spyOn(console, k as any).mockImplementation(() => undefined));
  });
  afterEach(() => log.forEach(l => l.mockRestore()));

  it('generates components, parameters, request bodies and responses', () => {
    const project = new Project({ useInMemoryFileSystem: true });
    GenerateInterfaces(spec, project);
    const paths = project.getSourceFiles().map(f => f.getFilePath());
    expect(paths).toEqual(expect.arrayContaining([
      '/components/user.ts',
      '/parameters/list-users.parameter.ts',
      '/responses/list-users.response.ts',
      '/request-bodies/create-user.request-body.ts',
      '/responses/create-user.response.ts',
    ]));
    expect(project.getSourceFile('/responses/list-users.response.ts')!.getFullText()).toContain('User[]');
    expect(project.getSourceFile('/parameters/list-users.parameter.ts')!.getFullText()).toContain('limit: number');
    expect(paths.some(p => p.includes('hidden-op'))).toBe(false);
  });

  it('GenerateOperation runs every generator and survives failures', () => {
    const project = new Project({ useInMemoryFileSystem: true });
    const ok = jest.fn();
    const failing = function failing() {
      throw new Error('boom');
    };
    GenerateOperation(spec, project, { prefix: 'x' }, [ failing, ok ]);
    expect(ok).toHaveBeenCalledTimes(2);
    expect(ok.mock.calls.map(c => c[0].operationId).sort()).toEqual([ 'create-user', 'list-users' ]);
    expect(ok.mock.calls[0][0]).toMatchObject({ options: { prefix: 'x' }, components: spec.components });
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Failed to generate [failing]'));
  });

  it('CreateComponentTypeAliasSourceFile builds alias for refs and arrays', () => {
    const project = new Project({ useInMemoryFileSystem: true });
    CreateComponentTypeAliasSourceFile(project, 'get-a', { $ref: '#/components/schemas/My-Thing' }, 'responses', 'response');
    CreateComponentTypeAliasSourceFile(project, 'list-a', { type: 'array', items: { $ref: '#/components/schemas/Thing' } }, 'responses', 'response');
    const single = project.getSourceFileOrThrow('responses/get-a.response.ts').getFullText();
    expect(single).toContain('export type GetAResponse = MyThing;');
    expect(single).toContain('../components/my-thing');
    expect(project.getSourceFileOrThrow('responses/list-a.response.ts').getFullText()).toContain('= Thing[];');
  });
});

describe('LoadOpenApiConfig', () => {
  let tree: Tree;
  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('reads json', async () => {
    tree.write('api.json', JSON.stringify(spec));
    expect(await LoadOpenApiConfig(tree, { path: 'api.json' })).toEqual(spec);
  });
  it('reads yaml', async () => {
    tree.write('api.yaml', 'openapi: 3.0.0\npaths: {}\n');
    expect(await LoadOpenApiConfig(tree, { path: 'api.yaml' })).toEqual({ openapi: '3.0.0', paths: {} });
    tree.write('api.yml', 'a: 1\n');
    expect(await LoadOpenApiConfig(tree, { path: 'api.yml' })).toEqual({ a: 1 });
  });
  it('fails for missing / unsupported / empty options', async () => {
    await expect(LoadOpenApiConfig(tree, { path: 'nope.json' })).rejects.toThrow('Could not find');
    tree.write('api.txt', 'x');
    await expect(LoadOpenApiConfig(tree, { path: 'api.txt' })).rejects.toThrow('Unsupported');
    await expect(LoadOpenApiConfig(tree, {} as any)).rejects.toThrow('Either the path or url');
  });
});

describe('HttpRequest / LoadOpenApiConfig from url', () => {
  let server: http.Server;
  let base: string;
  beforeAll(async () => {
    server = http.createServer((req, res) => {
      if (req.url === '/ok') {
        res.setHeader('content-type', 'application/json');
        res.end(JSON.stringify({ a: 1 }));
      } else if (req.url === '/text') {
        res.setHeader('content-type', 'text/plain');
        res.end('hi');
      } else if (req.url === '/badjson') {
        res.setHeader('content-type', 'application/json');
        res.end('{');
      } else {
        res.statusCode = 404;
        res.end();
      }
    });
    await new Promise<void>(r => server.listen(0, '127.0.0.1', r));
    base = `http://127.0.0.1:${ (server.address() as AddressInfo).port }`;
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });
  afterAll(() => {
    server.close();
    jest.restoreAllMocks();
  });

  it('parses json', async () => {
    expect(await HttpRequest(base + '/ok')).toEqual({ a: 1 });
    expect(await LoadOpenApiConfig(createTreeWithEmptyWorkspace(), { url: base + '/ok' })).toEqual({ a: 1 });
  });
  it('rejects for status, content-type, bad json and connection errors', async () => {
    await expect(HttpRequest(base + '/missing')).rejects.toContain('Status Code: 404');
    await expect(HttpRequest(base + '/text')).rejects.toContain('Invalid content-type');
    await expect(HttpRequest(base + '/badjson')).rejects.toBeDefined();
    await expect(HttpRequest('http://127.0.0.1:1/x')).rejects.toBeDefined();
    await expect(HttpRequest('https://127.0.0.1:1/x')).rejects.toBeDefined();
  });
});

describe('GenerateParameters with component references', () => {
  const { GenerateParameters } = jest.requireActual('./generate-parameters');
  const components: any = { parameters: { Limit: { name: 'limit', in: 'query', required: true, schema: { type: 'number' } } } };
  const op = (ref: string): any => ({ operationId: 'list', responses: {}, parameters: [ { name: 'q', in: 'query' }, { $ref: ref } ] });

  beforeEach(() => {
    [ 'log', 'debug', 'warn', 'error' ].forEach(k => jest.spyOn(console, k as any).mockImplementation(() => undefined));
  });
  afterEach(() => jest.restoreAllMocks());

  it('resolves $ref parameters from components and defaults schema to any', () => {
    const project = new Project({ useInMemoryFileSystem: true });
    GenerateParameters(op('#/components/parameters/Limit'), project, components);
    const out = project.getSourceFileOrThrow('/parameters/list.parameter.ts').getFullText();
    expect(out).toContain('limit: number');
    expect(out).toContain('q?:');
  });
  it('throws for unparsable or unknown refs', () => {
    const project = new Project({ useInMemoryFileSystem: true });
    expect(() => GenerateParameters(op('x/components/parameters/Limit'), project, components)).toThrow('Could not parse ref');
    expect(() => GenerateParameters(op('#/foo/parameters/Limit'), project, components)).toThrow('Could not parse ref');
    expect(() => GenerateParameters(op('#/components/nope/Limit'), project, components)).toThrow('does not exist');
    expect(() => GenerateParameters(op('#/components/parameters/Nope'), project, components)).toThrow('Could not find');
  });
  it('does nothing without parameters', () => {
    const project = new Project({ useInMemoryFileSystem: true });
    GenerateParameters({ operationId: 'a', responses: {} }, project, {});
    expect(project.getSourceFiles()).toHaveLength(0);
  });
});
