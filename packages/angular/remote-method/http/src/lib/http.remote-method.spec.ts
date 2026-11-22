import { HttpClient, HttpHeaders, HttpParams, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Injectable, Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RemoteMethodLoader, RxapRemoteMethod, RxapRemoteMethodError } from '@rxap/remote-method';
import { BaseHttpRemoteMethod } from './base-http.remote-method';
import { HttpRemoteMethodLoader } from './http-remote-method.loader';
import { HttpRemoteMethod } from './http.remote-method';

@RxapRemoteMethod({ id: 'get-item', url: '/api/item/{id}', method: 'GET' })
@Injectable()
class GetItem extends HttpRemoteMethod<{ name: string }> {}

@RxapRemoteMethod({ id: 'with-fn', url: () => '/dynamic', method: 'POST', timeout: 50, retry: 1 })
@Injectable()
class WithFn extends HttpRemoteMethod {
  public events: string[] = [];
  override onSentEvent() { this.events.push('sent'); }
  override onResponse() { this.events.push('response'); }
  override transformer(response: any) { return { wrapped: response }; }
}

describe('HttpRemoteMethod', () => {
  let ctrl: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), GetItem, WithFn],
    });
    ctrl = TestBed.inject(HttpTestingController);
  });
  afterEach(() => ctrl.verify());

  it('builds the url from path params and returns the body', async () => {
    const method = TestBed.inject(GetItem);
    const promise = method.call({ pathParams: { id: 'a b' }, setHeaders: { 'X-Test': '1' } } as any);
    const req = ctrl.expectOne('/api/item/a%20b');
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('X-Test')).toBe('1');
    req.flush({ name: 'n' });
    await expect(promise).resolves.toEqual({ name: 'n' });
  });

  it('uses a url factory, transformer, hooks and the timeout from metadata', async () => {
    const method = TestBed.inject(WithFn);
    expect(method.timeout).toBe(50);
    const promise = method.call({ body: { x: 1 } });
    const req = ctrl.expectOne('/dynamic');
    expect(req.request.body).toEqual({ x: 1 });
    req.flush({ ok: true });
    await expect(promise).resolves.toEqual({ wrapped: { ok: true } });
    expect(method.events).toEqual(['sent', 'response']);
  });

  it('retries failed requests according to the metadata', async () => {
    const method = TestBed.inject(WithFn);
    const promise = method.call();
    ctrl.expectOne('/dynamic').flush('boom', { status: 500, statusText: 'err' });
    ctrl.expectOne('/dynamic').flush({ ok: 1 });
    await expect(promise).resolves.toEqual({ wrapped: { ok: 1 } });
  });

  it('rejects after retries are exhausted', async () => {
    const method = TestBed.inject(WithFn);
    const promise = method.call();
    ctrl.expectOne('/dynamic').flush('boom', { status: 500, statusText: 'err' });
    ctrl.expectOne('/dynamic').flush('boom', { status: 500, statusText: 'err' });
    await expect(promise).rejects.toBeTruthy();
  });

  it('createHttpRequestParameters defaults to an empty object', () => {
    expect(TestBed.inject(GetItem).createHttpRequestParameters()).toEqual({});
  });

  it('default hooks are no-ops', () => {
    const m = TestBed.inject(GetItem);
    expect(() => {
      m.onSentEvent({} as any);
      m.onHeaderResponse({} as any);
      m.onResponse({} as any);
      m.onProgressEvent({} as any);
    }).not.toThrow();
  });
});

describe('HttpRemoteMethod events', () => {
  it('dispatches all event types to the hooks', async () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), GetItem],
    });
    const ctrl = TestBed.inject(HttpTestingController);
    const m = TestBed.inject(GetItem);
    const spies = {
      sent: jest.spyOn(m, 'onSentEvent'),
      header: jest.spyOn(m, 'onHeaderResponse'),
      progress: jest.spyOn(m, 'onProgressEvent'),
      response: jest.spyOn(m, 'onResponse'),
    };
    const p = m.call({ pathParams: { id: '1' }, reportProgress: true } as any);
    const req = ctrl.expectOne('/api/item/1');
    req.event({ type: 3, loaded: 1 } as any); // DownloadProgress
    req.event({ type: 1, loaded: 1 } as any); // UploadProgress
    req.event({ type: 2, headers: new HttpHeaders(), status: 200, statusText: 'OK', url: '/x' } as any); // ResponseHeader
    req.flush({ name: 'z' });
    await p;
    expect(spies.sent).toHaveBeenCalledTimes(1);
    expect(spies.progress).toHaveBeenCalledTimes(2);
    expect(spies.header).toHaveBeenCalledTimes(1);
    expect(spies.response).toHaveBeenCalledTimes(1);
    ctrl.verify();
  });
});

describe('BaseHttpRemoteMethod', () => {
  @RxapRemoteMethod({
    id: 'base',
    url: '/u/{a}/{b}',
    method: 'GET',
    headers: new HttpHeaders({ A: 'b' }),
    params: new HttpParams().set('q', '1'),
    withCredentials: true,
    responseType: 'text',
  })
  @Injectable()
  class Impl extends BaseHttpRemoteMethod {
    protected _call() { return Promise.resolve(this._httpRequest); }
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), Impl] });
  });

  it('initialises the request from the metadata', async () => {
    const req: any = await TestBed.inject(Impl).call();
    expect(req.url).toBe('/u/{a}/{b}');
    expect(req.method).toBe('GET');
    expect(req.headers.get('A')).toBe('b');
    expect(req.params.get('q')).toBe('1');
    expect(req.withCredentials).toBe(true);
    expect(req.responseType).toBe('text');
  });

  it('defaults the timeout to 60 seconds', () => {
    expect(TestBed.inject(Impl).timeout).toBe(60000);
  });

  it('buildUrlWithParams substitutes and encodes values', () => {
    const m = TestBed.inject(Impl);
    expect(m.buildUrlWithParams('/u/{a}/{b}', { a: 'x/y', b: 2 })).toBe('/u/x%2Fy/2');
    expect(m.buildUrlWithParams('/plain')).toBe('/plain');
    expect(m.buildUrlWithParams('/nothing', { a: 1 })).toBe('/nothing');
  });

  it('buildUrlWithParams validates the params', () => {
    const m = TestBed.inject(Impl);
    expect(() => m.buildUrlWithParams('/u/{a}', { b: 1 })).toThrow(/not a defined value for 'a'/);
    expect(() => m.buildUrlWithParams('/u/{a}', 'str' as any)).toThrow(RxapRemoteMethodError);
  });

  it('updateRequest merges parameters and resolves path params', async () => {
    const m = TestBed.inject(Impl);
    m.init();
    const req = m.updateRequest({ pathParams: { a: 1, b: 2 }, setHeaders: { X: 'y' }, body: { k: 1 } } as any);
    expect(req.url).toBe('/u/1/2');
    expect(req.body).toEqual({ k: 1 });
    expect(req.headers.get('X')).toBe('y');
    expect(req.withCredentials).toBe(true);
  });

  it('validates the constructor arguments', () => {
    TestBed.runInInjectionContext(() => {
      expect(() => new (Impl as any)(undefined, Injector.NULL, null)).toThrow(/HttpClient is undefined/);
      expect(() => new (Impl as any)({}, Injector.NULL, null)).toThrow(/not an instance of HttpClinent/);
    });
  });

  it('prefers the HttpClient from DI', () => {
    expect(TestBed.inject(Impl).http).toBe(TestBed.inject(HttpClient));
  });
});

describe('HttpRemoteMethodLoader', () => {
  it('calls an HttpRemoteMethod', async () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), GetItem] });
    const loader = TestBed.inject(HttpRemoteMethodLoader);
    const ctrl = TestBed.inject(HttpTestingController);
    const p = loader.request$(GetItem, { pathParams: { id: 5 } });
    ctrl.expectOne('/api/item/5').flush({ name: 'five' });
    await expect(p).resolves.toEqual({ name: 'five' });
  });

  it('rejects other remote methods', () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const other = { call: jest.fn() };
    jest.spyOn(TestBed.inject(RemoteMethodLoader), 'load').mockReturnValue(other as any);
    expect(() => TestBed.inject(HttpRemoteMethodLoader).request$('x' as any, {})).toThrow(/not a HttpRemoteMethod/);
  });
});
