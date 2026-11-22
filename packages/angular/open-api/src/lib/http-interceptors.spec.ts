import { HttpContext, HttpRequest, HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { OPEN_API_SERVER_ID, OPEN_API_SERVER_INDEX } from './http-context-tokens';
import { injectOpenApiBaseUrlHttpInterceptorFn } from './http-interceptors';
import { OpenApiConfigService } from './open-api-config.service';

describe('injectOpenApiBaseUrlHttpInterceptorFn', () => {
  const getBaseUrl = jest.fn(() => 'http://api.test/v1');
  const next = jest.fn((req: HttpRequest<any>) => of(new HttpResponse({ url: req.url })));

  beforeEach(() => {
    getBaseUrl.mockClear();
    next.mockClear();
    TestBed.configureTestingModule({ providers: [{ provide: OpenApiConfigService, useValue: { getBaseUrl } }] });
  });

  const run = (url: string, ctx?: HttpContext) =>
    TestBed.runInInjectionContext(() => injectOpenApiBaseUrlHttpInterceptorFn(new HttpRequest('GET', url, { context: ctx }), next as any));

  it('passes requests without server id untouched', () => {
    run('/x');
    expect(next.mock.calls[0][0].url).toBe('/x');
    expect(getBaseUrl).not.toHaveBeenCalled();
  });

  it('prefixes relative urls with the base url', () => {
    run('/pets', new HttpContext().set(OPEN_API_SERVER_ID, 'srv').set(OPEN_API_SERVER_INDEX, 2));
    expect(getBaseUrl).toHaveBeenCalledWith(2, 'srv');
    expect(next.mock.calls[0][0].url).toBe('http://api.test/v1/pets');
  });

  it('keeps absolute urls and warns when they do not match', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    run('http://other/x', new HttpContext().set(OPEN_API_SERVER_ID, 'srv'));
    expect(warn).toHaveBeenCalled();
    expect(next.mock.calls[0][0].url).toBe('http://other/x');
    warn.mockClear();
    run('http://api.test/v1/x', new HttpContext().set(OPEN_API_SERVER_ID, 'srv'));
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
