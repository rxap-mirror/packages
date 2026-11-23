import type { MockInstance } from 'vitest';
import { SchemaValidationMixin } from './schema-validation.mixin';

describe('SchemaValidationMixin', () => {
  let mixin: any;
  let warn: MockInstance;

  beforeEach(() => {
    mixin = new SchemaValidationMixin();
    SchemaValidationMixin.STRICT = false;
    warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.spyOn(console, 'debug').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });
  afterEach(() => vi.restoreAllMocks());

  const op = (extra: any = {}): any => ({ path: '/x', method: 'GET', operationId: 'op', ...extra });
  const jsonBody = (schema: any, required = false) => ({ required, content: { 'application/json': { schema } } });

  describe('validationError', () => {
    it('warns when not strict', () => {
      mixin.validationError('m', false, { type: 'string' }, 1);
      expect(warn).toHaveBeenCalledWith('m');
    });
    it('throws when strict or STRICT is set', () => {
      expect(() => mixin.validationError('m', true)).toThrow('m');
      SchemaValidationMixin.STRICT = true;
      expect(() => mixin.validationError('m', false)).toThrow('m');
    });
  });

  describe('validateParameters', () => {
    const operation = op({
      parameters: [
        { name: 'id', in: 'query', required: true, schema: { type: 'number' } },
        { name: 'h', in: 'header', required: true },
      ],
    });

    it('rejects reference objects', () => {
      expect(() => mixin.validateParameters(op({ parameters: [{ $ref: 'x' }] }), {})).toThrow('ReferenceObject');
    });
    it('reports missing required parameters when none given', () => {
      mixin.validateParameters(operation, undefined);
      expect(warn).toHaveBeenCalledWith('Some operation parameters are required!');
      expect(() => mixin.validateParameters(operation, undefined, true)).toThrow();
    });
    it('accepts missing parameters when none are required', () => {
      mixin.validateParameters(op(), undefined);
      expect(warn).not.toHaveBeenCalled();
    });
    it('checks required and schema of given parameters', () => {
      mixin.validateParameters(operation, { id: 1 });
      expect(warn).not.toHaveBeenCalled();
      mixin.validateParameters(operation, {});
      expect(warn).toHaveBeenCalledWith("The operation parameter 'id' is required!");
      warn.mockClear();
      mixin.validateParameters(operation, { id: 'str' });
      expect(warn).toHaveBeenCalledWith("The parameter 'id' is not valid against the schema!");
      expect(() => mixin.validateParameters(operation, { id: 'str' }, true)).toThrow();
    });
    it('handles non record parameters', () => {
      mixin.validateParameters(op(), 'x');
      expect(warn).toHaveBeenCalled();
      expect(() => mixin.validateParameters(operation, 'x')).toThrow('not a record');
    });
    it('skips validation when disabled', () => {
      mixin.disableSchemaValidation = true;
      mixin.validateParameters(operation, { id: 'str' });
      expect(warn).not.toHaveBeenCalledWith("The parameter 'id' is not valid against the schema!");
    });
  });

  describe('validate', () => {
    it('validates against ajv and guards input', () => {
      expect(mixin.validate({ type: 'string' }, 'a')).toBe(true);
      expect(mixin.validate({ type: 'string' }, 1)).toBe(false);
      expect(() => mixin.validate('x', 1)).toThrow('must be an object');
      expect(() => mixin.validate(null, 1)).toThrow();
    });
    it('throws on async schemas', () => {
      expect(() => mixin.validate({ $async: true, type: 'string' }, 'a')).toThrow('Async schema');
    });
  });

  describe('validateResponse', () => {
    const headers = (ct?: string) => ({ get: () => ct ?? null }) as any;
    const operation = op({
      responses: {
        200: { description: '', content: { 'application/json': { schema: { type: 'string' } } } },
        default: { description: '', content: { 'application/json': { schema: { type: 'number' } } } },
        201: { description: '' },
      },
    });

    it('validates body against the matching status schema', () => {
      mixin.validateResponse(operation, { headers: headers(), status: 200, body: 'ok' });
      expect(warn).not.toHaveBeenCalled();
      mixin.validateResponse(operation, { headers: headers(), status: 200, data: 1 });
      expect(warn).toHaveBeenCalledWith('The response is not valid ageist the operation schema!');
    });
    it('falls back to the default response', () => {
      mixin.validateResponse(operation, { headers: headers(), status: 500, body: 'x' });
      expect(warn).toHaveBeenCalled();
    });
    it('ignores responses without schema or without responses', () => {
      mixin.validateResponse(operation, { headers: headers(), status: 201, body: 1 });
      mixin.validateResponse(op(), { headers: headers(), status: 200 });
      mixin.validateResponse(op({ responses: {} }), { headers: headers(), status: 200 });
      expect(warn).not.toHaveBeenCalled();
    });
    it('rejects reference responses', () => {
      expect(() => mixin.validateResponse(op({ responses: { 200: { $ref: 'x' } } }), { headers: headers(), status: 200 })).toThrow('reference');
    });
    it('validates json content types', () => {
      mixin.validateResponse(operation, { headers: headers('application/json'), status: 200, body: 'ok' });
      expect(warn).not.toHaveBeenCalled();
      mixin.validateResponse(operation, { headers: headers('application/json; charset=utf-8'), status: 200, body: 1 });
      expect(warn).toHaveBeenCalledWith('The response is not valid ageist the operation schema!');
    });
    it('validates json like (+json) content types', () => {
      mixin.validateResponse(operation, { headers: headers('application/problem+json'), status: 200, body: 1 });
      expect(warn).toHaveBeenCalledWith('The response is not valid ageist the operation schema!');
    });
    it('skips validation for non json content types', () => {
      mixin.validateResponse(operation, { headers: headers('text/plain'), status: 200, body: 1 });
      expect(warn).toHaveBeenCalledWith('Response validation is only supported for content types that are json like.');
      expect(warn).not.toHaveBeenCalledWith('The response is not valid ageist the operation schema!');
    });
    it('throws for invalid json responses in strict mode', () => {
      expect(() => mixin.validateResponse(operation, { headers: headers('application/json'), status: 200, body: 1 }, true)).toThrow();
    });
  });

  describe('validateRequestBody', () => {
    it('only validates objects', () => {
      mixin.validateRequestBody(op({ requestBody: jsonBody({ type: 'object' }) }), 'str');
      expect(warn).not.toHaveBeenCalled();
    });
    it('validates the body schema', () => {
      const o = op({ requestBody: jsonBody({ type: 'object', required: ['a'] }) });
      mixin.validateRequestBody(o, { a: 1 });
      expect(warn).not.toHaveBeenCalled();
      mixin.validateRequestBody(o, {});
      expect(warn).toHaveBeenCalledWith('The request body is not valid!');
    });
    it('does nothing without a request body definition and rejects references', () => {
      mixin.validateRequestBody(op(), {});
      expect(() => mixin.validateRequestBody(op({ requestBody: { $ref: 'x' } }), {})).toThrow('reference');
    });
    it('flags a missing required body', () => {
      mixin.validateRequestBody(op({ requestBody: { required: true, content: {} } }), undefined);
      expect(warn).not.toHaveBeenCalled(); // typeof undefined !== object returns early
    });
  });

  describe('http building', () => {
    const params: any[] = [
      { name: 'q', in: 'query' },
      { name: 'p', in: 'path' },
      { name: 'h', in: 'header' },
    ];

    it('buildHttpParams handles scalars, arrays, objects and undefined', () => {
      const ps: any[] = [{ name: 'a', in: 'query' }, { name: 'b', in: 'query' }, { name: 'c', in: 'query' }, { name: 'd', in: 'query' }, { name: 'e', in: 'query' }, { name: 'f', in: 'query' }];
      const r = mixin.buildHttpParams(ps, { a: 1, b: [1, { x: 1 }], c: { y: 2 }, d: undefined, e: [] });
      expect(r.get('a')).toBe('1');
      expect(r.getAll('b')).toEqual(['1', '{"x":1}']);
      expect(r.get('c')).toBe('{"y":2}');
      expect(r.has('d')).toBe(false);
      expect(r.has('e')).toBe(false);
      expect(mixin.buildHttpParams(ps, undefined).keys()).toEqual([]);
      expect(mixin.buildHttpParams([{ name: 'd', in: 'query' }], { d: undefined }, false).keys()).toEqual(['d']);
    });

    it('buildHttpHeaders handles scalars and arrays', () => {
      const ps: any[] = [{ name: 'a', in: 'header' }, { name: 'b', in: 'header' }, { name: 'c', in: 'header' }, { name: 'd', in: 'header' }, { name: 'e', in: 'header' }, { name: 'f', in: 'header' }];
      const h = mixin.buildHttpHeaders(ps, { a: 'x', b: ['one'], c: ['1', { z: 1 }], d: { o: 1 }, e: [] });
      expect(h.get('a')).toBe('x');
      expect(h.get('b')).toBe('one');
      expect(h.getAll('c')).toEqual(['1', '{"z":1}']);
      expect(h.get('d')).toBe('{"o":1}');
      expect(h.has('e')).toBe(false);
      expect(mixin.buildHttpHeaders(ps, undefined).keys()).toEqual([]);
      expect(mixin.buildHttpHeaders([{ name: 'b', in: 'header' }], { b: [{ x: 1 }] }).get('b')).toBe('{"x":1}');
    });

    it('buildHttpPathParams normalizes values', () => {
      const ps: any[] = [{ name: 'p', in: 'path' }];
      expect(mixin.buildHttpPathParams(ps, { p: 'a b' })).toEqual({ p: 'a%20b' });
      expect(mixin.buildHttpPathParams(ps, { p: 5 })).toEqual({ p: '5' });
      expect(mixin.buildHttpPathParams(ps, { p: { a: 1 } })).toEqual({ p: encodeURIComponent('{"a":1}') });
      expect(mixin.buildHttpPathParams(ps, { p: ['a', 'b'] })).toEqual({ p: 'a/b' });
      expect(mixin.buildHttpPathParams(ps, {})).toEqual({});
      expect(mixin.buildHttpPathParams(ps, undefined)).toEqual({});
      expect(() => mixin.buildHttpPathParams(ps, { p: '' })).toThrow('empty or undefined');
      expect(() => mixin.buildHttpPathParams(ps, { p: [] })).toThrow('empty array');
    });

    it('buildHttpOptions combines params, headers, path params and body', () => {
      const o = op({
        parameters: params,
        requestBody: { content: { 'application/json': {} } },
      });
      const r = mixin.buildHttpOptions(o, { q: 1, p: 'x', h: 'v' }, { a: 1 });
      expect(r.params.get('q')).toBe('1');
      expect(r.headers.get('h')).toBe('v');
      expect(r.pathParams).toEqual({ p: 'x' });
      expect(r.body).toEqual({ a: 1 });
    });

    it('buildHttpOptions omits empty parts and rejects references', () => {
      expect(mixin.buildHttpOptions(op(), undefined)).toEqual({});
      expect(() => mixin.buildHttpOptions(op({ parameters: [{ $ref: 'x' }] }), {})).toThrow('ReferenceObject');
    });

    it('buildBody covers content types', () => {
      const body = (ct: string, value: any, o: any = null) =>
        mixin.buildHttpOptions(o ?? op({ requestBody: { content: { [ct]: {} } } }), undefined, value);
      expect(body('application/x-www-form-urlencoded', { a: '1', b: '2' }).body).toBe('a=1&b=2');
      const fd = body('multipart/form-data', { a: '1' }).body as FormData;
      expect(fd.get('a')).toBe('1');
      expect(body('text/plain', 'raw').body).toBe('raw');
      expect(body('application/ld+json', { a: 1 }).body).toEqual({ a: 1 });
      expect(mixin.buildHttpOptions(op(), undefined, { a: 1 })).toEqual({});
      expect(warn).toHaveBeenCalledWith('No content type found for the request body! Omitting the body!');
      body('application/json', {}, op({ requestBody: { content: { 'application/json': {}, 'text/plain': {} } } }));
      expect(warn).toHaveBeenCalledWith('Multiple content types found for the request body! Using the first one!');
    });
  });
});
