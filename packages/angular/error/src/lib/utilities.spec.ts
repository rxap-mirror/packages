import {
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import {
  ExtractContextFromError,
  ExtractError,
  ExtractExtraFromError,
  ExtractTagsFromError,
  PrintError,
  SimplifyHttpErrorResponse,
} from './utilities';

describe('utilities', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(console, 'table').mockImplementation(() => undefined);
    vi.spyOn(console, 'groupCollapsed').mockImplementation(() => undefined);
    vi.spyOn(console, 'groupEnd').mockImplementation(() => undefined);
  });
  afterEach(() => vi.restoreAllMocks());

  const response = (error: unknown, headers?: HttpHeaders) =>
    new HttpErrorResponse({
      error,
      status: 500,
      statusText: 'Server Error',
      url: 'http://x/api',
      headers: headers ?? new HttpHeaders({ 'x-a': ['1', '2'] }),
    });

  describe('SimplifyHttpErrorResponse', () => {
    it('uses the message of an object body', () => {
      const result = SimplifyHttpErrorResponse(response({ message: 'boom' }));
      expect(result.errorMessage).toBe('boom');
      expect(result.status).toBe(500);
      expect(result.url).toBe('http://x/api');
      expect(result.headers).toEqual({ 'x-a': ['1', '2'] });
    });

    it('falls back to the event message for an object without message', () => {
      const event = response({ a: 1 });
      expect(SimplifyHttpErrorResponse(event).errorMessage).toBe(event.message);
    });

    it('parses a json string body', () => {
      const result = SimplifyHttpErrorResponse(response('{"message":"json"}'));
      expect(result.error).toEqual({ message: 'json' });
      expect(result.errorMessage).toBe('json');
    });

    it('keeps a non json string body', () => {
      const event = response('plain text');
      const result = SimplifyHttpErrorResponse(event);
      expect(result.error).toBe('plain text');
      expect(result.errorMessage).toBe(event.message);
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('Extract*', () => {
    it('extracts a response context from http errors', () => {
      const context = ExtractContextFromError(response({}));
      expect(context['response']).toBeDefined();
    });
    it('returns an empty context for other errors', () => {
      expect(ExtractContextFromError(new Error('x'))).toEqual({});
    });
    it('returns empty extra and tags', () => {
      expect(ExtractExtraFromError(1)).toEqual({});
      expect(ExtractTagsFromError(1)).toEqual({});
    });
    it('extracts the error', () => {
      const http = response({});
      const err = new Error('x');
      expect(ExtractError(http)).toBe(http);
      expect(ExtractError(err)).toBe(err);
      expect(ExtractError('str')).toBe('str');
      expect(ExtractError(42)).toBe('Handled unknown error');
    });
  });

  describe('PrintError', () => {
    it('prints http errors with message', () => {
      PrintError(response({ message: 'm' }));
      expect(console.groupCollapsed).toHaveBeenCalledTimes(2);
      expect(console.log).toHaveBeenCalledWith('m');
      expect(console.table).toHaveBeenCalledTimes(2);
    });
    it('prints http errors without message', () => {
      PrintError(response(null));
      expect(console.log).toHaveBeenCalledWith(null);
    });
    it('prints errors and strings', () => {
      const err = new Error('x');
      PrintError(err);
      PrintError('s');
      expect(console.error).toHaveBeenCalledWith(err);
      expect(console.error).toHaveBeenCalledWith('s');
    });
    it('ignores unknown values', () => {
      PrintError(5);
      expect(console.error).not.toHaveBeenCalled();
    });
  });
});
