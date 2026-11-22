import { Project } from 'ts-morph';
import { IsAnySchemaObject } from './any-schema-object';
import { GetParameterType } from './get-parameter-type';
import { GetRequestBody } from './get-reqeust-body';
import { GetRequestBodyType } from './get-request-body-type';
import { GetResponse } from './get-response';
import { GetResponseType } from './get-response-type';
import { GetTypeParameters } from './get-type-parameters';
import { HasOperationParameters } from './has-operation-paramters';
import { HasOperationRequestBody } from './has-operation-request-body';
import { hasResponseAdditionalProperties } from './has-response-additional-properties';
import { IgnoreOperation } from './ignore-operation';
import { IsCollectionResponse } from './is-collection-response';
import { IsHttpMethod } from './is-http-method';
import { IsOpenApiSchemaFromPath } from './is-open-api-schema-from-path';
import { IsOperationObject } from './is-operation-object';
import { IsReferenceObject } from './is-reference-object';
import { IsWithoutParameters } from './is-without-parameters';
import {
  IsArrayRefSchemaObject,
  IsRefSchemaObject,
  IsSchemaObjectNullable,
} from './ref-schema-object';
import { ResolveRef } from '../resolve-ref';
import { GenerateIndexExports } from '../generate-index-exports';
import {
  AssertWithOperationId,
  GenerateParameterToOperationObjectWithMetadata,
  HasOperationId,
} from '../types';

const json = (schema: any) => ({ content: { 'application/json': { schema } } });

describe('open-api utilities', () => {

  it('IsHttpMethod', () => {
    expect(IsHttpMethod('get')).toBe(true);
    expect(IsHttpMethod('patch')).toBe(true);
    expect(IsHttpMethod('options')).toBe(false);
  });

  it('IsAnySchemaObject', () => {
    expect(IsAnySchemaObject({ type: 'any' })).toBe(true);
    expect(IsAnySchemaObject({ type: 'string' })).toBe(false);
    expect(IsAnySchemaObject(null)).toBeFalsy();
  });

  it('parameter predicates', () => {
    expect(IsWithoutParameters({ responses: {} })).toBe(true);
    expect(IsWithoutParameters({ responses: {}, parameters: [] })).toBe(true);
    expect(IsWithoutParameters({ responses: {}, parameters: [ { name: 'a', in: 'query' } ] })).toBe(false);
    expect(HasOperationParameters({ responses: {} })).toBe(false);
    expect(HasOperationParameters({ responses: {}, parameters: [ { name: 'a', in: 'query' } ] })).toBe(true);
    expect(HasOperationRequestBody({ responses: {} })).toBe(false);
    expect(HasOperationRequestBody({ responses: {}, requestBody: { content: {} } })).toBe(true);
  });

  it('object predicates', () => {
    expect(IsOperationObject({ operationId: 'x' })).toBe(true);
    expect(IsOperationObject({})).toBe(false);
    expect(IsOperationObject(undefined)).toBe(false);
    expect(IsReferenceObject({ $ref: '#/a' })).toBe(true);
    expect(IsReferenceObject({})).toBe(false);
    expect(IsReferenceObject()).toBe(false);
    expect(IsRefSchemaObject({ $ref: 'a' })).toBeTruthy();
    expect(IsRefSchemaObject({})).toBeFalsy();
    expect(IsArrayRefSchemaObject({ type: 'array', items: { $ref: 'a' } })).toBeTruthy();
    expect(IsArrayRefSchemaObject({ type: 'array', items: { type: 'string' } })).toBeFalsy();
    expect(IsSchemaObjectNullable({ nullable: true })).toBe(true);
    expect(IsSchemaObjectNullable({ nullable: 'x' })).toBe(false);
    expect(IsSchemaObjectNullable({})).toBe(false);
    expect(IsOpenApiSchemaFromPath({ path: 'a.json' })).toBe(true);
    expect(IsOpenApiSchemaFromPath({ url: 'http://a' })).toBe(false);
  });

  it('IgnoreOperation', () => {
    const fn = IgnoreOperation([ 'internal' ]);
    expect(fn({ responses: {}, tags: [ 'internal', 'x' ] })).toBe(true);
    expect(fn({ responses: {}, tags: [ 'x' ] })).toBe(false);
    expect(fn({ responses: {} })).toBe(false);
    expect(IgnoreOperation()({ responses: {}, tags: [ 'a' ] })).toBe(false);
  });

  it('GetParameterType', () => {
    expect(GetParameterType({ responses: {} })).toBe('void');
    expect(GetParameterType({ responses: {}, operationId: 'get-user', parameters: [] })).toBe('void');
    expect(GetParameterType({
      responses: {},
      operationId: 'get-user',
      parameters: [ { name: 'a', in: 'query' } ],
    })).toMatch(/^GetUser\w*Parameter/);
  });

  describe('GetResponse', () => {
    it('prefers default over 200 over 201', () => {
      expect(GetResponse({ responses: { 200: json({ type: 'a' }), default: json({ type: 'd' }) } as any }))
        .toEqual({ type: 'd' });
      expect(GetResponse({ responses: { 201: json({ type: 'c' }), 200: json({ type: 'b' }) } as any }))
        .toEqual({ type: 'b' });
      expect(GetResponse({ responses: { 201: json({ type: 'c' }) } as any })).toEqual({ type: 'c' });
    });
    it('returns null without json schema', () => {
      expect(GetResponse({ responses: {} })).toBeNull();
      expect(GetResponse({ responses: { 200: { description: 'x' } } })).toBeNull();
      expect(GetResponse({ responses: { 200: { description: 'x', content: { 'text/plain': {} } } } })).toBeNull();
    });
    it('warns for reference responses', () => {
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
      expect(GetResponse({ responses: { 200: { $ref: '#/x' } } })).toBeNull();
      expect(warn).toHaveBeenCalled();
      warn.mockRestore();
    });
  });

  describe('GetRequestBody', () => {
    it('returns null without body', () => {
      expect(GetRequestBody({ responses: {} })).toBeNull();
    });
    it('throws for reference body', () => {
      expect(() => GetRequestBody({ responses: {}, requestBody: { $ref: '#/x' } })).toThrow();
    });
    it('picks supported content types', () => {
      const body = (ct: string) => ({ responses: {}, requestBody: { content: { [ct]: { schema: { type: ct } } } } });
      expect(GetRequestBody(body('application/json') as any)).toEqual({ type: 'application/json' });
      expect(GetRequestBody(body('application/x-www-form-urlencoded') as any))
        .toEqual({ type: 'application/x-www-form-urlencoded' });
      expect(GetRequestBody(body('multipart/form-data') as any)).toEqual({ type: 'multipart/form-data' });
      expect(GetRequestBody(body('text/plain') as any)).toBeNull();
    });
  });

  describe('GetResponseType / hasResponseAdditionalProperties / IsCollectionResponse', () => {
    it('void without operationId or response', () => {
      expect(GetResponseType({ responses: {} })).toEqual({ type: 'void', name: null });
      expect(GetResponseType({ operationId: 'a', responses: {} })).toEqual({ type: 'void', name: null });
    });
    it('void for any schema', () => {
      expect(GetResponseType({ operationId: 'a', responses: { 200: json({ type: 'any' }) } as any }).type).toBe('void');
    });
    it('named type for object', () => {
      const r = GetResponseType({ operationId: 'get-a', responses: { 200: json({ type: 'object' }) } as any });
      expect(r.name).toMatch(/^GetA/);
      expect(r.type).toBe(r.name);
    });
    it('generic type when additionalProperties', () => {
      const op: any = { operationId: 'get-a', responses: { 200: json({ type: 'object', additionalProperties: true }) } };
      expect(hasResponseAdditionalProperties(op)).toBe(true);
      expect(GetResponseType(op).type).toMatch(/<TResponse>$/);
    });
    it('hasResponseAdditionalProperties false cases', () => {
      expect(hasResponseAdditionalProperties({ responses: {} })).toBe(false);
      expect(hasResponseAdditionalProperties({ operationId: 'a', responses: { 200: json({ $ref: '#/a' }) } as any })).toBe(false);
      expect(hasResponseAdditionalProperties({ operationId: 'a', responses: { 200: json({ type: 'any' }) } as any })).toBe(false);
    });
    it('IsCollectionResponse', () => {
      expect(IsCollectionResponse({ responses: { 200: json({ type: 'array', items: {} }) } as any })).toBe(true);
      expect(IsCollectionResponse({ responses: { 200: json({ type: 'object' }) } as any })).toBe(false);
      expect(IsCollectionResponse({ responses: { 200: json({ $ref: '#/a' }) } as any })).toBe(false);
      expect(IsCollectionResponse({ responses: {} })).toBe(false);
    });
  });

  describe('GetRequestBodyType', () => {
    const op = (schema: any, extra = {}): any => ({
      operationId: 'create-a',
      responses: {},
      requestBody: { content: { 'application/json': { schema } } },
      ...extra,
    });
    it('void without body or id', () => {
      expect(GetRequestBodyType({ responses: {} } as any)).toEqual({ type: 'void', name: null });
      expect(GetRequestBodyType({ operationId: 'a', responses: {} } as any)).toEqual({ type: 'void', name: null });
    });
    it('any for any schema', () => {
      expect(GetRequestBodyType(op({ type: 'any' })).type).toBe('any');
    });
    it('named / generic / ref', () => {
      expect(GetRequestBodyType(op({ type: 'object' })).type).toMatch(/^CreateA/);
      expect(GetRequestBodyType(op({ type: 'object', additionalProperties: true })).type).toMatch(/<TRequestBody>$/);
      const ref = GetRequestBodyType(op({ $ref: '#/a' }));
      expect(ref.type).toBe(ref.name);
    });
  });

  describe('GetTypeParameters', () => {
    it('empty without operationId', () => {
      expect(GetTypeParameters({ responses: {} })).toEqual([]);
    });
    it('adds TResponse and TRequestBody', () => {
      const params = GetTypeParameters({
        operationId: 'a',
        responses: { 200: json({ additionalProperties: true }) },
        requestBody: { content: { 'application/json': { schema: { type: 'object', additionalProperties: true } } } },
      } as any);
      expect(params.map(p => p.name)).toEqual([ 'TResponse', 'TRequestBody' ]);
    });
    it('empty for concrete types', () => {
      expect(GetTypeParameters({
        operationId: 'a',
        responses: { 200: json({ type: 'object' }) },
      } as any)).toEqual([]);
    });
  });

  it('ResolveRef replaces schema refs in place', () => {
    const spec: any = { components: { schemas: { User: { type: 'object' } } } };
    const node: any = { a: { $ref: '#/components/schemas/User' }, b: [ { $ref: '#/other' } ], c: 1 };
    ResolveRef(spec, node);
    expect(node.a).toEqual({ type: 'object' });
    expect(node.b[0]).toEqual({ $ref: '#/other' });
    ResolveRef(spec, null);
    ResolveRef(spec, 'str');
  });

  it('GenerateIndexExports', () => {
    const project = new Project({ useInMemoryFileSystem: true });
    project.createSourceFile('/a/b.ts', '');
    project.createSourceFile('/c.ts', '');
    const out = GenerateIndexExports(project);
    expect(out).toContain(`export * from './lib/a/b';`);
    expect(out.split('\n')).toHaveLength(2);
  });

  describe('types', () => {
    it('HasOperationId / AssertWithOperationId', () => {
      expect(HasOperationId({ responses: {}, operationId: 'a' })).toBe(true);
      expect(() => AssertWithOperationId({ responses: {} })).toThrow('operation id');
      expect(() => AssertWithOperationId({ responses: {}, operationId: 'a' })).not.toThrow();
    });
    it('GenerateParameterToOperationObjectWithMetadata strips human props and non-2xx', () => {
      const result: any = GenerateParameterToOperationObjectWithMetadata({
        method: 'get',
        path: '/a',
        operationId: 'a',
        summary: 'sum',
        project: {} as any,
        components: {},
        options: {},
        parameters: [ { name: 'p', in: 'query', description: 'd' } ],
        responses: {
          200: { description: 'ok', content: { 'application/json': { schema: { type: 'string', example: 'x' } } } },
          404: { description: 'nf' },
        },
      } as any);
      expect(result.summary).toBeUndefined();
      expect(result.project).toBeUndefined();
      expect(result.parameters).toEqual([ { name: 'p', in: 'query' } ]);
      expect(Object.keys(result.responses)).toEqual([ '200' ]);
      expect(result.responses[200].content['application/json'].schema).toEqual({ type: 'string' });
    });
  });
});
