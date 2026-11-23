import {
  HttpClient,
  HttpErrorResponse,
  HttpEventType,
  HttpHeaders,
  HttpParams,
  provideHttpClient,
  withInterceptorsFromDi,
  withXhr,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { HttpDataSource } from './http.data-source';

describe('HttpDataSource requests and events', () => {
  const url = 'http://server.test/api';
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withXhr(), withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    vi.restoreAllMocks();
  });

  function create(metadata: Partial<ConstructorParameters<typeof HttpDataSource>[1]> = {}) {
    return new HttpDataSource<any>(http, { id: 'events', url, ...metadata } as any);
  }

  it('emits the http events on the matching subjects', async () => {
    const ds = create();
    const sent = vi.fn();
    const header = vi.fn();
    const download = vi.fn();
    const upload = vi.fn();
    const response = vi.fn();
    ds.onSentEvent$.subscribe(sent);
    ds.onResponseHeader$.subscribe(header);
    ds.onDownloadProgress$.subscribe(download);
    ds.onUploadProgress$.subscribe(upload);
    ds.onResponse$.subscribe(response);

    const result = ds.request$();
    const request = httpMock.expectOne(url);
    request.event({ type: HttpEventType.Sent });
    request.event({ type: HttpEventType.UploadProgress, loaded: 1, total: 2 });
    request.event({
      type: HttpEventType.ResponseHeader,
      status: 200,
      statusText: 'OK',
      headers: new HttpHeaders(),
      url,
    } as any);
    request.event({ type: HttpEventType.DownloadProgress, loaded: 2, total: 2 });
    // an unknown event type is ignored
    request.event({ type: HttpEventType.User } as any);
    request.flush({ ok: true });

    await expect(result).resolves.toEqual({ ok: true });
    expect(sent).toHaveBeenCalled();
    expect(upload).toHaveBeenCalledWith(expect.objectContaining({ loaded: 1 }));
    expect(header).toHaveBeenCalledTimes(1);
    expect(download).toHaveBeenCalledWith(expect.objectContaining({ loaded: 2 }));
    expect(response).toHaveBeenCalledWith(expect.objectContaining({ body: { ok: true } }));
  });

  it('notifies the interceptors about a response and an error', async () => {
    const ds = create();
    const interceptor = new Subject<any>();
    const seen: any[] = [];
    interceptor.subscribe((e) => seen.push(e));
    ds.interceptors!.add(interceptor);

    const ok = ds.request$();
    httpMock.expectOne(url).flush('fine');
    await ok;
    expect(seen).toHaveLength(1);
    expect(seen[0].response.body).toBe('fine');

    const failed = ds.request$();
    httpMock.expectOne(url).flush('bad', { status: 500, statusText: 'Server Error' });
    await expect(failed).rejects.toBeInstanceOf(HttpErrorResponse);
    expect(seen).toHaveLength(2);
    expect(seen[1].response).toBeInstanceOf(HttpErrorResponse);
    expect(seen[1].options).toBeDefined();
  });

  it('retries a failed request as configured', async () => {
    const ds = create({ retry: 1 });
    const result = ds.request$();
    httpMock.expectOne(url).flush('x', { status: 500, statusText: 'Server Error' });
    httpMock.expectOne(url).flush('second');
    await expect(result).resolves.toBe('second');
  });

  it('transforms the response body', async () => {
    class Upper extends HttpDataSource<string> {
      override transform(data: any): string {
        return String(data).toUpperCase();
      }
    }
    const ds = new Upper(http, { id: 'upper', url } as any);
    const result = ds.request$();
    httpMock.expectOne(url).flush('abc');
    await expect(result).resolves.toBe('ABC');
  });

  it('fails a request that exceeds the configured timeout', async () => {
    vi.useFakeTimers();
    try {
      const ds = create({ timeout: 50 });
      expect(ds.timeout).toBe(50);
      const result = ds.request$();
      const assertion = expect(result).rejects.toThrow();
      httpMock.expectOne(url);
      await vi.advanceTimersByTimeAsync(60);
      await assertion;
    } finally {
      vi.useRealTimers();
    }
  });

  describe('request$', () => {
    it('uses the given options and merges them with the last options on demand', async () => {
      const ds = create({ method: 'POST', body: { a: 1 } });
      const first = ds.request$({ url: 'first', body: { b: 2 } });
      const firstRequest = httpMock.expectOne(`${ url }/first`);
      expect(firstRequest.request.method).toBe('POST');
      expect(firstRequest.request.body).toEqual({ b: 2 });
      firstRequest.flush(1);
      await first;

      const merged = ds.request$({ params: new HttpParams().set('q', '1') }, true);
      const mergedRequest = httpMock.expectOne(`${ url }?q=1`);
      expect(mergedRequest.request.body).toEqual({ a: 1 });
      mergedRequest.flush(2);
      await merged;
    });

    it('falls back to the initial options if undefined options are passed', async () => {
      const ds = create({ headers: new HttpHeaders({ 'x-meta': 'm' }) });
      const result = ds.request$(undefined as any, true);
      const request = httpMock.expectOne(url);
      expect(request.request.headers.get('x-meta')).toBe('m');
      request.flush('ok');
      await expect(result).resolves.toBe('ok');
      const result2 = ds.request$(null as any);
      httpMock.expectOne(url).flush('ok2');
      await expect(result2).resolves.toBe('ok2');
    });
  });

  describe('url handling', () => {
    it('supports a url factory function', async () => {
      const ds = create({ url: () => 'http://server.test/dynamic' });
      const result = ds.request$();
      httpMock.expectOne('http://server.test/dynamic').flush('dyn');
      await expect(result).resolves.toBe('dyn');
    });

    it('merges metadata and option path params and encodes them', async () => {
      const ds = create({ url: 'http://server.test/{a}/{b}', pathParams: { a: 'x y', b: 'meta' } });
      const result = ds.request$({ pathParams: { b: 'over/ride' } });
      httpMock.expectOne('http://server.test/x%20y/over%2Fride').flush('ok');
      await expect(result).resolves.toBe('ok');
    });

    it('rejects a missing path param', async () => {
      const ds = create({ url: 'http://server.test/{a}' });
      await expect(async () => ds.request$({ pathParams: {} })).rejects.toThrow(
        /has not a defined value for 'a'/,
      );
    });

    it('rejects a path param object without an index signature', async () => {
      const ds = create({ url: 'http://server.test/{a}' });
      await expect(async () => ds.request$({ pathParams: 'a' as any })).rejects.toThrow(
        /has not an index signature/,
      );
    });
  });

  describe('construction', () => {
    it('throws if the http client is missing', () => {
      expect(() => new HttpDataSource<any>(undefined as any, { id: 'x', url } as any)).toThrow(
        /HttpClient is undefined/,
      );
    });

    it('uses a provided refresh subject', () => {
      const refresh$ = new Subject<any>();
      const ds = new HttpDataSource<any>(http, { id: 'x', url } as any, refresh$);
      expect(ds.refresh$).toBe(refresh$);
    });
  });

  describe('refresh and reset', () => {
    it('does not request without a viewer unless forced', async () => {
      const ds = create();
      ds.refresh();
      httpMock.expectNone(url);
      const refreshed = vi.fn();
      ds.refreshed$.subscribe(refreshed);
      ds.refresh(undefined, false, true);
      httpMock.expectOne(url).flush('forced');
      expect(refreshed).toHaveBeenCalledTimes(1);
    });

    it('merges options on refresh', () => {
      const ds = create({ body: { a: 1 }, method: 'POST' });
      ds.connect({ id: 'v' }).subscribe();
      httpMock.expectOne(url).flush('first');
      ds.refresh({ url: 'extra' }, true);
      const request = httpMock.expectOne(`${ url }/extra`);
      expect(request.request.body).toEqual({ a: 1 });
      request.flush('second');
      ds.refresh(undefined as any, true);
      httpMock.expectOne(`${ url }/extra`).flush('third');
    });

    it('reset drops the data and requests again with a fresh subscription', () => {
      const ds = create();
      const received: any[] = [];
      ds.connect({ id: 'v' }).subscribe((d) => received.push(d));
      httpMock.expectOne(url).flush('one');
      expect(received).toEqual(['one']);
      expect(ds.data).toBe('one');
      ds.reset();
      expect(ds.data).toBeUndefined();
      expect(ds.hasConnections).toBe(false);
      ds.refresh(undefined, false, true);
      httpMock.expectOne(url).flush('two');
    });

    it('does not re-init once initialised', () => {
      const ds = create();
      ds.init();
      expect(() => ds.init()).not.toThrow();
    });

    it('throws if the refresh subscription already exists on init', () => {
      const ds = create();
      (ds as any)._refreshSubscription = { unsubscribe: vi.fn() };
      expect(() => ds.init()).toThrow(/already initialised/);
    });
  });

  describe('connect', () => {
    it('removes the viewer url if it equals the data source url', () => {
      const ds = create();
      const viewer: any = { id: 'v', url };
      ds.connect(viewer).subscribe();
      httpMock.expectOne(url).flush('x');
      expect(viewer.url).toBeUndefined();
    });

    it('skips the buffered value for realtime viewers and reuses lazy data', () => {
      const ds = create();
      ds.connect({ id: 'first' }).subscribe();
      httpMock.expectOne(url).flush('x');
      ds.disconnect({ id: 'first' });

      const received: any[] = [];
      const viewer: any = { id: 'second' };
      ds.connect(viewer).subscribe((d) => received.push(d));
      expect(viewer.realtime).toBe(true);
      httpMock.expectOne(url).flush('y');
      expect(received).toEqual(['y']);
    });

    it('does not request again for a lazy viewer with equal options', () => {
      const ds = create();
      ds.connect({ id: 'first' }).subscribe();
      httpMock.expectOne(url).flush('x');
      const received: any[] = [];
      ds.connect({ id: 'lazy', lazy: true }).subscribe((d) => received.push(d));
      expect(received).toEqual(['x']);
    });
  });

  describe('derive', () => {
    it('creates a data source with merged metadata that shares the refresh subject', async () => {
      const ds = create({ headers: new HttpHeaders({ a: '1' }), body: { x: 1 } });
      const derived = ds.derive('derived', { method: 'PUT' } as any);
      expect(derived).toBeInstanceOf(HttpDataSource);
      expect(derived.id).toBe('derived');
      expect(derived.metadata.method).toBe('PUT');
      expect(derived.metadata.url).toBe(url);
      expect(derived.refresh$).toBe(ds.refresh$);
      const result = derived.request$();
      const request = httpMock.expectOne(url);
      expect(request.request.method).toBe('PUT');
      request.flush('d');
      await expect(result).resolves.toBe('d');
    });

    it('creates an isolated data source with its own refresh subject', () => {
      const ds = create();
      const derived = ds.derive('isolated', undefined, true);
      expect(derived.refresh$).not.toBe(ds.refresh$);
    });
  });
});
