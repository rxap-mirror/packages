import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { RxapOpenApiError } from './error';
import { OPEN_API_OPERATION, OPEN_API_OPERATION_ID, OPEN_API_SERVER_ID, OPEN_API_SERVER_INDEX } from './http-context-tokens';
import { OpenApiHttpResponseError } from './open-api-http-response.error';
import { DISABLE_SCHEMA_VALIDATION, DISABLE_VALIDATION } from './tokens';
import { HttpContext } from '@angular/common/http';

describe('open-api errors and tokens', () => {
  it('RxapOpenApiError carries message and scope', () => {
    const e = new RxapOpenApiError('boom', 'C', 'S');
    expect(e).toBeInstanceOf(Error);
    expect(e.message).toContain('boom');
    expect(new RxapOpenApiError('x').message).toContain('x');
  });

  it('OpenApiHttpResponseError wraps the response', () => {
    const inner = new HttpErrorResponse({
      error: { a: 1 }, status: 404, statusText: 'NF', url: 'http://x', headers: new HttpHeaders({ a: 'b' }),
    });
    const e = new OpenApiHttpResponseError(inner, { id: 'op', serverId: 'srv' } as any);
    expect(e.status).toBe(404);
    expect(e.error).toEqual({ a: 1 });
    expect(e.url).toBe('http://x');
    expect(e.operationId).toBe('op');
    expect(e.serverId).toBe('srv');
    expect(e.httpErrorResponse).toBe(inner);
    expect(e.name).toBe('OpenApiHttpResponseError');
    const noUrl = new OpenApiHttpResponseError(new HttpErrorResponse({ status: 500 }), { id: 'o' } as any);
    expect(noUrl.url).toBeNull();
  });

  it('http context tokens have defaults', () => {
    const ctx = new HttpContext();
    expect(ctx.get(OPEN_API_OPERATION_ID)).toBe('');
    expect(ctx.get(OPEN_API_SERVER_ID)).toBeNull();
    expect(ctx.get(OPEN_API_SERVER_INDEX)).toBe(0);
    expect(ctx.get(OPEN_API_OPERATION)).toBe('');
  });

  it('validation is disabled by default', () => {
    expect(TestBed.inject(DISABLE_SCHEMA_VALIDATION)).toBe(true);
    expect(TestBed.inject(DISABLE_VALIDATION)).toBe(true);
  });
});
