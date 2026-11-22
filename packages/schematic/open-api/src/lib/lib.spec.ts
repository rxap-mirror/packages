import { HostTree } from '@angular-devkit/schematics';
import { CreateProject } from '@rxap/ts-morph';
import { ClearOperation } from './clear-operation';
import { GenerateComponents } from './generate-components';
import { GenerateOperation } from './generate-operation';
import { GenerateParameters } from './generate-parameters';
import { GenerateRequestBody } from './generate-request-body';
import { GenerateResponse } from './generate-response';
import { LoadOpenApiConfig } from './load-open-api-config';
import {
  AssertWithOperationId,
  GenerateParameterToOperationObjectWithMetadata,
  HasOperationId,
} from './types';

const components: any = {
  schemas: {
    User: { type: 'object', properties: { id: { type: 'string' }, name: { type: 'string' } }, required: [ 'id' ] },
  },
  parameters: {
    Limit: { name: 'limit', in: 'query', schema: { type: 'number' } },
  },
};

describe('schematic open-api lib', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'debug').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  describe('LoadOpenApiConfig', () => {
    it('loads from a tree path', async () => {
      const host = new HostTree();
      host.create('/openapi.json', JSON.stringify({ openapi: '3.0.0' }));
      await expect(LoadOpenApiConfig(host, { path: '/openapi.json' } as any)).resolves.toEqual({ openapi: '3.0.0' });
    });
    it('throws for missing file and missing options', async () => {
      const host = new HostTree();
      await expect(LoadOpenApiConfig(host, { path: '/missing.json' } as any)).rejects.toThrow('Could not find openapi file.');
      await expect(LoadOpenApiConfig(host, {} as any)).rejects.toThrow('Either the path or url must be defined');
    });
  });

  it('ClearOperation removes directories', () => {
    const host = new HostTree();
    host.create('/lib/components/a.ts', '');
    host.create('/lib/keep/b.ts', '');
    ClearOperation([ 'components' ], '/lib')(host, {} as any);
    expect(host.exists('/lib/components/a.ts')).toBe(false);
    expect(host.exists('/lib/keep/b.ts')).toBe(true);
  });

  describe('types', () => {
    it('operation id helpers', () => {
      expect(HasOperationId({ responses: {}, operationId: 'a' })).toBe(true);
      expect(() => AssertWithOperationId({ responses: {} })).toThrow('operation id');
      expect(() => AssertWithOperationId({ responses: {}, operationId: 'a' })).not.toThrow();
    });
    it('GenerateParameterToOperationObjectWithMetadata keeps only relevant data', () => {
      const result = GenerateParameterToOperationObjectWithMetadata({
        operationId: 'a', method: 'get', path: '/a', project: {} as any, components: {}, options: {},
        responses: { 200: { description: 'ok', content: { x: { example: 1, schema: { type: 'string', description: 'd' } } } }, 404: { description: 'no' } },
        parameters: [ { name: 'x', in: 'query', description: 'human' } ],
        summary: 'dropped',
      } as any);
      expect(result).toEqual({
        operationId: 'a', method: 'get', path: '/a',
        responses: { 200: { content: { x: { schema: { type: 'string' } } } } },
        parameters: [ { name: 'x', in: 'query' } ],
      });
    });
  });

  describe('interface generators', () => {
    it('GenerateComponents creates component interfaces', () => {
      const project = CreateProject();
      GenerateComponents(components, project);
      GenerateComponents({}, project);
      const file = project.getSourceFiles().find(f => f.getFilePath().includes('components'))!;
      expect(file.getFullText()).toContain('User');
    });

    it('GenerateParameters handles refs and header params', () => {
      const project = CreateProject();
      GenerateParameters({
        operationId: 'list-users', responses: {},
        parameters: [
          { name: 'q', in: 'query', required: true, schema: { type: 'string' } },
          { name: 'x-h', in: 'header', schema: { type: 'string' } },
          { name: 'noschema', in: 'path' },
          { $ref: '#/components/parameters/Limit' },
        ],
      } as any, project, components);
      const text = project.getSourceFiles().map(f => f.getFullText()).join('\n');
      expect(text).toContain('q');
      expect(text).toContain('limit');
      GenerateParameters({ operationId: 'none', responses: {} }, project, components);
    });

    it.each([
      '#x/components/parameters/Limit',
      '#/other/parameters/Limit',
      '#/components/missing/Limit',
      '#/components/parameters/Missing',
    ])('GenerateParameters throws for bad ref %s', ref => {
      expect(() => GenerateParameters({ operationId: 'a', responses: {}, parameters: [ { $ref: ref } as any ] }, CreateProject(), components)).toThrow();
    });

    it('GenerateRequestBody and GenerateResponse create interfaces', () => {
      const project = CreateProject();
      const operation: any = {
        operationId: 'create-user', responses: { 200: { content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } } },
        requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' } } } } } },
      };
      GenerateRequestBody(operation, project, components);
      GenerateResponse(operation, project, components);
      GenerateRequestBody({ operationId: 'x', responses: {} }, project, components);
      GenerateResponse({ operationId: 'x', responses: {} }, project, components);
      const paths = project.getSourceFiles().map(f => f.getFilePath());
      expect(paths.some(p => p.includes('request-bodies'))).toBe(true);
      expect(paths.some(p => p.includes('responses'))).toBe(true);
    });
  });

  describe('GenerateOperation', () => {
    it('runs generators for each operation, skipping hidden and id-less ones', () => {
      const project = CreateProject();
      const generator = jest.fn();
      const failing = jest.fn(() => {
        throw new Error('fail');
      });
      GenerateOperation({
        openapi: '3.0.0', info: { title: 't', version: '1' },
        components,
        paths: {
          '/users': {
            get: { operationId: 'list-users', parameters: [ { name: 'q', in: 'query', schema: { type: 'string' } } ], responses: { 200: { content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/User' } } } } } } },
            post: { operationId: 'create-user', responses: {}, requestBody: { content: { 'application/json': { schema: { type: 'object' } } } } },
            parameters: [],
          },
          '/hidden': { get: { operationId: 'hidden-op', tags: [ 'hidden' ], responses: {} } },
          '/noid': { get: { operationId: '', summary: 'x', responses: {} } },
          '/empty': undefined,
        },
      } as any, project, {}, [ generator, failing ]);
      expect(generator).toHaveBeenCalledTimes(2);
      expect(generator.mock.calls[0][0]).toEqual(expect.objectContaining({ operationId: 'list-users', method: 'get', path: '/users' }));
      expect(failing).toHaveBeenCalledTimes(2);
      expect(console.error).toHaveBeenCalled();
    });

    it('supports swagger 2 style definitions and missing components', () => {
      const project = CreateProject();
      GenerateOperation({ paths: {}, definitions: { schemas: {} } } as any, project, {}, []);
      GenerateOperation({ paths: {} } as any, project, {}, []);
    });
  });
});
