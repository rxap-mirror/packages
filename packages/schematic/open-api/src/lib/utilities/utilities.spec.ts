import { OpenAPIV3 } from 'openapi-types';
import * as http from 'http';
import { AddressInfo } from 'net';
import { IsAnySchemaObject } from './any-schema-object';
import { GetParameterType } from './get-parameter-type';
import { GetRequestBody } from './get-reqeust-body';
import { GetRequestBodyType } from './get-request-body-type';
import { GetResponse } from './get-response';
import { GetResponseType } from './get-response-type';
import { HasOperationParameters } from './has-operation-paramters';
import { HasOperationRequestBody } from './has-operation-request-body';
import { HttpRequest } from './http-request';
import { IgnoreOperation } from './ignore-operation';
import { IsCollectionResponse } from './is-collection-response';
import { IsHttpMethod } from './is-http-method';
import { IsOpenApiSchemaFromPath } from './is-open-api-schema-from-path';
import { IsOperationObject } from './is-operation-object';
import { IsReferenceObject } from './is-reference-object';
import { IsWithoutParameters } from './is-without-parameters';

const json = (schema: any): any => ({ content: { 'application/json': { schema } } });

describe('open-api utilities', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  it('type guards', () => {
    expect(IsAnySchemaObject({ type: 'any' })).toBe(true);
    expect(IsAnySchemaObject({ type: 'string' })).toBeFalsy();
    expect(IsAnySchemaObject(null)).toBeFalsy();
    expect(IsReferenceObject({ $ref: '#/x' })).toBe(true);
    expect(IsReferenceObject()).toBe(false);
    expect(IsOperationObject({ operationId: 'a' })).toBe(true);
    expect(IsOperationObject({})).toBe(false);
    expect(IsHttpMethod('get')).toBe(true);
    expect(IsHttpMethod('options')).toBe(false);
    expect(IsOpenApiSchemaFromPath({ path: 'a' } as any)).toBe(true);
    expect(IsOpenApiSchemaFromPath({ url: 'a' } as any)).toBe(false);
    expect(HasOperationParameters({ responses: {}, parameters: [ {} as any ] })).toBe(true);
    expect(HasOperationParameters({ responses: {} })).toBe(false);
    expect(HasOperationRequestBody({ responses: {}, requestBody: {} as any })).toBe(true);
    expect(HasOperationRequestBody({ responses: {} })).toBe(false);
    expect(IsWithoutParameters({ responses: {} })).toBe(true);
    expect(IsWithoutParameters({ responses: {}, parameters: [ {} as any ] })).toBe(false);
  });

  it('IgnoreOperation', () => {
    const f = IgnoreOperation([ 'hidden' ]);
    expect(f({ responses: {}, tags: [ 'hidden' ] })).toBe(true);
    expect(f({ responses: {}, tags: [ 'x' ] })).toBe(false);
    expect(f({ responses: {} })).toBe(false);
    expect(IgnoreOperation()({ responses: {}, tags: [ 'x' ] })).toBe(false);
  });

  describe('GetResponse', () => {
    it('prefers default, then 200, then 201', () => {
      expect(GetResponse({ responses: { default: json({ a: 1 }), 200: json({ b: 1 }) } } as any)).toEqual({ a: 1 });
      expect(GetResponse({ responses: { 200: json({ b: 1 }) } } as any)).toEqual({ b: 1 });
      expect(GetResponse({ responses: { 201: json({ c: 1 }) } } as any)).toEqual({ c: 1 });
    });
    it('returns null without json schema or for refs', () => {
      expect(GetResponse({ responses: { 200: { description: '' } } } as any)).toBeNull();
      expect(GetResponse({ responses: { 200: { $ref: '#/x' } } } as any)).toBeNull();
      expect(GetResponse({ responses: { 404: json({}) } } as any)).toBeNull();
      expect(GetResponse({ responses: { 200: json(undefined) } } as any)).toBeNull();
      expect(GetResponse({} as any)).toBeNull();
    });
  });

  describe('GetRequestBody', () => {
    it('returns the json schema', () => {
      expect(GetRequestBody({ responses: {}, requestBody: json({ type: 'object' }) } as any)).toEqual({ type: 'object' });
    });
    it('returns null otherwise', () => {
      expect(GetRequestBody({ responses: {} })).toBeNull();
      expect(GetRequestBody({ responses: {}, requestBody: { content: { 'text/plain': {} } } } as any)).toBeNull();
      expect(GetRequestBody({ responses: {}, requestBody: { content: { 'application/json': {} } } } as any)).toBeNull();
      expect(GetRequestBody({ responses: {}, requestBody: { content: { $ref: '#/x' } } } as any)).toBeNull();
    });
    it('throws for a reference request body', () => {
      expect(() => GetRequestBody({ responses: {}, requestBody: { $ref: '#/x' } } as any)).toThrow();
    });
  });

  describe('type name helpers', () => {
    it('GetParameterType', () => {
      expect(GetParameterType({ responses: {}, operationId: 'get-user', parameters: [ {} as any ] })).toBe('GetUserParameter');
      expect(GetParameterType({ responses: {}, operationId: 'x' })).toBe('void');
    });
    it('GetResponseType', () => {
      expect(GetResponseType({ responses: { 200: json({ type: 'object' }) }, operationId: 'get-user' } as any)).toBe('GetUserResponse');
      expect(GetResponseType({ responses: { 200: json({ type: 'any' }) }, operationId: 'x' } as any)).toBe('void');
      expect(GetResponseType({ responses: {} })).toBe('void');
    });
    it('GetRequestBodyType', () => {
      expect(GetRequestBodyType({ operationId: 'create-user', requestBody: json({ type: 'object' }), responses: {} } as any)).toBe('CreateUserRequestBody');
      expect(GetRequestBodyType({ operationId: 'x', requestBody: json({ type: 'any' }), responses: {} } as any)).toBe('any');
      expect(GetRequestBodyType({ operationId: 'x', responses: {} } as any)).toBe('void');
      expect(GetRequestBodyType({ responses: {} } as any)).toBe('void');
    });
    it('IsCollectionResponse', () => {
      expect(IsCollectionResponse({ responses: { 200: json({ type: 'array' }) } } as any)).toBe(true);
      expect(IsCollectionResponse({ responses: { 200: json({ type: 'object' }) } } as any)).toBe(false);
      expect(IsCollectionResponse({ responses: { 200: json({ type: 'any' }) } } as any)).toBe(false);
      expect(IsCollectionResponse({ responses: { 200: json({ $ref: '#/x' }) } } as any)).toBe(false);
      expect(IsCollectionResponse({ responses: {} })).toBe(false);
    });
  });

  describe('HttpRequest', () => {
    let server: http.Server;
    let url: string;
    beforeAll(done => {
      server = http.createServer((req, res) => {
        if (req.url === '/ok') {
          res.setHeader('content-type', 'application/json');
          res.end('{"a":1}');
        } else if (req.url === '/text') {
          res.setHeader('content-type', 'text/plain');
          res.end('hi');
        } else if (req.url === '/bad-json') {
          res.setHeader('content-type', 'application/json');
          res.end('{');
        } else {
          res.statusCode = 404;
          res.end();
        }
      }).listen(0, () => {
        url = `http://127.0.0.1:${ (server.address() as AddressInfo).port }`;
        done();
      });
    });
    afterAll(done => {
      server.close(done);
    });
    it('resolves json', async () => {
      await expect(HttpRequest(url + '/ok')).resolves.toEqual({ a: 1 });
    });
    it('rejects on status, content-type, invalid json and connection error', async () => {
      await expect(HttpRequest(url + '/nope')).rejects.toContain('Status Code: 404');
      await expect(HttpRequest(url + '/text')).rejects.toContain('Invalid content-type');
      await expect(HttpRequest(url + '/bad-json')).rejects.toBeDefined();
      await expect(HttpRequest('http://127.0.0.1:1/x')).rejects.toBeDefined();
      await expect(HttpRequest('https://127.0.0.1:1/x')).rejects.toBeDefined();
    });
  });

  it('OpenAPIV3 import is type only', () => {
    const doc: OpenAPIV3.Document | undefined = undefined;
    expect(doc).toBeUndefined();
  });
});
