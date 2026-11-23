import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RXAP_DATA_SOURCE_REFRESH } from '@rxap/data-source';
import {
  DEFAULT_OPEN_API_DATA_SOURCE_META_DATA,
  DISABLE_SCHEMA_VALIDATION,
  DISABLE_VALIDATION,
  OpenApiConfigService,
  RXAP_OPEN_API_STRICT_VALIDATOR,
  RxapOpenApiError,
} from '@rxap/open-api';
import {
  EMPTY,
  Subject,
} from 'rxjs';
import {
  OpenApiDataSource,
  RxapOpenApiDataSource,
} from './open-api.data-source';

const SERVER_URL = 'https://server.de/api';

function createConfig(): any {
  return {
    openapi: '3.0.0',
    info: {
      title: 'Testing',
      version: '1',
    },
    servers: [ { url: SERVER_URL }, { url: 'https://second.de/api' } ],
    paths: {
      '/users': {
        get: {
          operationId: 'getAllUsers',
          responses: {
            200: {
              description: 'ok',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { type: 'object' },
                  },
                },
              },
            },
          },
        },
        post: {
          operationId: 'createUser',
          responses: { 200: { description: 'ok' } },
        },
      },
      '/users/{uuid}': {
        get: {
          operationId: 'getUserById',
          parameters: [
            {
              name: 'uuid',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
            {
              name: 'include',
              in: 'query',
              required: false,
              schema: { type: 'string' },
            },
            {
              name: 'x-trace',
              in: 'header',
              required: false,
              schema: { type: 'string' },
            },
          ],
          responses: {
            200: {
              description: 'ok',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: [ 'name' ],
                    properties: { name: { type: 'string' } },
                  },
                },
              },
            },
          },
        },
      },
    },
  };
}

describe('@rxap/open-api/data-source', () => {

  describe('OpenApiDataSource', () => {

    let httpMock: HttpTestingController;
    let http: HttpClient;
    let openApiService: OpenApiConfigService;
    let warn: ReturnType<typeof vi.spyOn>;

    function create(
      metadata: Record<string, any> = { id: 'getAllUsers' },
      refresh$: Subject<any> | null = null,
      strict: boolean | null = null,
      disableSchemaValidation: boolean | null = null,
      disableValidation: boolean | null = null,
    ): OpenApiDataSource {
      return new OpenApiDataSource(
        http,
        openApiService,
        metadata as any,
        refresh$,
        strict,
        disableSchemaValidation,
        disableValidation,
      );
    }

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(withInterceptorsFromDi()),
          provideHttpClientTesting(),
        ],
      });

      http = TestBed.inject(HttpClient);
      httpMock = TestBed.inject(HttpTestingController);
      openApiService = new OpenApiConfigService(createConfig());
      warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      vi.spyOn(console, 'debug').mockImplementation(() => undefined);
    });

    afterEach(() => {
      httpMock.verify();
      vi.restoreAllMocks();
    });

    describe('construction', () => {

      it('should resolve the operation from the operation id', () => {
        const dataSource = create({ id: 'getAllUsers' });

        expect(dataSource.id).toBe('getAllUsers');
        expect(dataSource.operation.path).toBe('/users');
        expect(dataSource.operation.method).toBe('GET');
        expect((dataSource.metadata.url as () => string)()).toBe(`${ SERVER_URL }/users`);
        expect(dataSource.metadata.method).toBe('GET');
      });

      it('should use the provided operation object instead of the lookup', () => {
        const operation = {
          operationId: 'test-operation',
          path: '/test',
          responses: { 200: { description: 'ok' } },
          method: 'GET',
        };

        const dataSource = create({
          id: 'test',
          operation,
        } as any);

        expect(dataSource.id).toBe('test-operation');
        expect(dataSource.operation).toBe(operation);
        expect((dataSource.metadata.url as () => string)()).toBe(`${ SERVER_URL }/test`);
      });

      it('should use the server selected by the serverIndex', () => {
        const dataSource = create({
          id: 'getAllUsers',
          serverIndex: 1,
        });

        expect((dataSource.metadata.url as () => string)()).toBe('https://second.de/api/users');
      });

      it('should only support GET operations', () => {
        expect(() => create({ id: 'createUser' })).toThrow('OpenApi DataSource only supports GET Operations!');
      });

      it('should throw if the operation is not defined', () => {
        vi.spyOn(console, 'error').mockImplementation(() => undefined);

        expect(() => create({ id: 'unknown' })).toThrow('The operation \'unknown\' is not defined in the openapi-json');
      });

      it('should be constructed by the injector with the injected metadata and flags', () => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
          providers: [
            provideHttpClient(withInterceptorsFromDi()),
            provideHttpClientTesting(),
            {
              provide: OpenApiConfigService,
              useValue: openApiService,
            },
            {
              provide: DEFAULT_OPEN_API_DATA_SOURCE_META_DATA,
              useValue: { id: 'getAllUsers' },
            },
            {
              provide: RXAP_OPEN_API_STRICT_VALIDATOR,
              useValue: true,
            },
            {
              provide: DISABLE_SCHEMA_VALIDATION,
              useValue: true,
            },
            {
              provide: DISABLE_VALIDATION,
              useValue: false,
            },
            OpenApiDataSource,
          ],
        });

        const dataSource = TestBed.inject(OpenApiDataSource);

        expect(dataSource.id).toBe('getAllUsers');
        expect((dataSource as any).strict).toBe(true);
        expect((dataSource as any).disableSchemaValidation).toBe(true);
        expect((dataSource as any).disableValidation).toBe(false);
      });

      it('should read the validation flags from the metadata', () => {
        const dataSource = create({
          id: 'getAllUsers',
          strict: true,
          disableSchemaValidation: true,
          disableValidation: true,
        });

        expect((dataSource as any).strict).toBe(true);
        expect((dataSource as any).disableSchemaValidation).toBe(true);
        expect((dataSource as any).disableValidation).toBe(true);
      });

      it('should default all validation flags to false', () => {
        const dataSource = create();

        expect((dataSource as any).strict).toBe(false);
        expect((dataSource as any).disableSchemaValidation).toBe(false);
        expect((dataSource as any).disableValidation).toBe(false);
      });

      it('should use the shared refresh subject', () => {
        const refresh$ = new Subject<any>();

        expect(create({ id: 'getAllUsers' }, refresh$).refresh$).toBe(refresh$);
      });

    });

    describe('decorator', () => {

      it('should create the data source from an operation id', () => {
        @RxapOpenApiDataSource('getAllUsers')
        class MyOperation extends OpenApiDataSource {
        }

        const dataSource = new MyOperation(http, openApiService);

        expect(dataSource.id).toBe('getAllUsers');
        expect((dataSource.metadata.url as () => string)()).toBe(`${ SERVER_URL }/users`);
      });

      it('should create the data source from an operation id with a server index', () => {
        @RxapOpenApiDataSource('getAllUsers', 1)
        class MyOperation extends OpenApiDataSource {
        }

        const dataSource = new MyOperation(http, openApiService);

        expect((dataSource.metadata.url as () => string)()).toBe('https://second.de/api/users');
      });

      it('should create the data source from a metadata object', () => {
        @RxapOpenApiDataSource({
          id: 'getUserById',
          strict: true,
        })
        class MyOperation extends OpenApiDataSource {
        }

        const dataSource = new MyOperation(http, openApiService);

        expect(dataSource.id).toBe('getUserById');
        expect((dataSource as any).strict).toBe(true);
      });

    });

    describe('connect', () => {

      it('should send a GET request to the operation url and emit the response body', () => {
        const dataSource = create();
        const data = [ { id: 1 } ];
        const nextSpy = vi.fn();
        const errorSpy = vi.fn();
        const completeSpy = vi.fn();

        dataSource.connect({ id: 'test' }).subscribe({
          next: nextSpy,
          error: errorSpy,
          complete: completeSpy,
        });

        const request = httpMock.expectOne(`${ SERVER_URL }/users`);
        expect(request.request.method).toBe('GET');
        request.flush(data);

        expect(nextSpy).toHaveBeenCalledTimes(1);
        expect(nextSpy).toHaveBeenCalledWith(data);
        expect(errorSpy).not.toHaveBeenCalled();
        expect(completeSpy).not.toHaveBeenCalled();
        expect(warn).not.toHaveBeenCalled();
      });

      it('should apply the viewer parameters as path, query and header parameters', () => {
        const dataSource = create({ id: 'getUserById' });
        const nextSpy = vi.fn();
        const data = { name: 'John' };

        dataSource.connect({
          id: 'test',
          parameters: {
            uuid: 'a-b',
            include: 'cars',
            'x-trace': 'trace-1',
          },
        }).subscribe(nextSpy);

        const request = httpMock.expectOne(`${ SERVER_URL }/users/a-b?include=cars`);
        expect(request.request.headers.get('x-trace')).toBe('trace-1');
        request.flush(data);

        expect(nextSpy).toHaveBeenCalledWith(data);
        expect(warn).not.toHaveBeenCalled();
      });

      it('should validate an empty parameter object if the viewer has no parameters and no view change', () => {
        const dataSource = create({ id: 'getUserById' });
        const errorSpy = vi.fn();

        dataSource.connect({ id: 'test' }).subscribe({ error: errorSpy });

        expect(warn).toHaveBeenCalledWith('The operation parameter \'uuid\' is required!');
        // the empty parameters miss the required path parameter, the request can not be built
        expect(errorSpy).toHaveBeenCalledTimes(1);
        expect(errorSpy.mock.calls[0][0].message).toContain('has not a defined value for \'uuid\'');
        httpMock.expectNone(() => true);
      });

      it('should validate an empty parameter object if the view change is EMPTY', () => {
        const dataSource = create({ id: 'getUserById' });
        const errorSpy = vi.fn();

        dataSource.connect({
          id: 'test',
          viewChange: EMPTY,
        }).subscribe({ error: errorSpy });

        expect(warn).toHaveBeenCalledWith('The operation parameter \'uuid\' is required!');
        expect(errorSpy).toHaveBeenCalledTimes(1);
        httpMock.expectNone(() => true);
      });

      it('should not validate the missing parameters if a view change is provided', () => {
        const dataSource = create({ id: 'getUserById' });
        const viewChange = new Subject<any>();

        dataSource.connect({
          id: 'test',
          viewChange,
        }).subscribe();

        expect(warn).not.toHaveBeenCalled();
        httpMock.expectNone(() => true);
      });

      it('should warn about invalid viewer parameters but still send the request', () => {
        const dataSource = create({ id: 'getUserById' });
        const nextSpy = vi.fn();

        dataSource.connect({
          id: 'test',
          parameters: { uuid: 1 },
        }).subscribe(nextSpy);

        expect(warn).toHaveBeenCalledWith('The parameter \'uuid\' is not valid against the schema!');
        httpMock.expectOne(`${ SERVER_URL }/users/1`).flush({ name: 'John' });
        expect(nextSpy).toHaveBeenCalledWith({ name: 'John' });
      });

      it('should throw for invalid viewer parameters in strict mode', () => {
        const dataSource = create({ id: 'getUserById' }, null, true);

        expect(() => dataSource.connect({
          id: 'test',
          parameters: { uuid: 1 },
        })).toThrow(RxapOpenApiError);
        expect(() => dataSource.connect({
          id: 'test2',
          parameters: {},
        })).toThrow('The operation parameter \'uuid\' is required!');
      });

      it('should not validate the parameters if the validation is disabled', () => {
        const dataSource = create({ id: 'getUserById' }, null, true, null, true);
        const viewChange = new Subject<any>();
        const nextSpy = vi.fn();

        dataSource.connect({
          id: 'test',
          parameters: { uuid: 1 },
        }).subscribe(nextSpy);
        dataSource.connect({
          id: 'test2',
          viewChange,
        });

        httpMock.expectOne(`${ SERVER_URL }/users/1`).flush({ invalid: true });

        expect(nextSpy).toHaveBeenCalledWith({ invalid: true });
        expect(warn).not.toHaveBeenCalled();
      });

      it('should send a new request for each parameter emitted by the view change', () => {
        const dataSource = create({ id: 'getUserById' });
        const viewChange = new Subject<any>();
        const nextSpy = vi.fn();

        dataSource.connect({
          id: 'test',
          viewChange,
        }).subscribe(nextSpy);

        viewChange.next({ uuid: 'one' });
        httpMock.expectOne(`${ SERVER_URL }/users/one`).flush({ name: 'One' });

        viewChange.next({
          uuid: 'two',
          include: 'cars',
        });
        httpMock.expectOne(`${ SERVER_URL }/users/two?include=cars`).flush({ name: 'Two' });

        expect(nextSpy).toHaveBeenCalledTimes(2);
        expect(nextSpy).toHaveBeenNthCalledWith(1, { name: 'One' });
        expect(nextSpy).toHaveBeenNthCalledWith(2, { name: 'Two' });
        expect(warn).not.toHaveBeenCalled();
      });

      it('should validate the parameters emitted by the view change', () => {
        const dataSource = create({ id: 'getUserById' });
        const viewChange = new Subject<any>();

        dataSource.connect({
          id: 'test',
          viewChange,
        }).subscribe();

        viewChange.next({ uuid: 1 });

        expect(warn).toHaveBeenCalledWith('The parameter \'uuid\' is not valid against the schema!');
        httpMock.expectOne(`${ SERVER_URL }/users/1`).flush({ name: 'John' });
      });

      it('should return the existing connection for the same viewer', () => {
        const dataSource = create();
        const viewer = { id: 'test' };

        const first = dataSource.connect(viewer);
        const second = dataSource.connect(viewer);

        expect(second).toBe(first);
        // connecting triggers the request immediately
        httpMock.expectOne(`${ SERVER_URL }/users`).flush([]);
      });

    });

    describe('request', () => {

      it('should return the response body of a single request', async () => {
        const dataSource = create();

        const result = dataSource.request$();
        httpMock.expectOne(`${ SERVER_URL }/users`).flush([ { id: 1 } ]);

        expect(await result).toEqual([ { id: 1 } ]);
      });

      it('should warn if the response does not match the response schema', async () => {
        const dataSource = create();

        const result = dataSource.request$();
        httpMock.expectOne(`${ SERVER_URL }/users`).flush({ not: 'an array' });

        expect(await result).toEqual({ not: 'an array' });
        expect(warn).toHaveBeenCalledWith('The response is not valid ageist the operation schema!');
      });

      it('should throw for an invalid response in strict mode', async () => {
        const dataSource = create({ id: 'getAllUsers' }, null, true);

        const result = dataSource.request$();
        httpMock.expectOne(`${ SERVER_URL }/users`).flush({ not: 'an array' });

        await expect(result).rejects.toThrow('The response is not valid ageist the operation schema!');
      });

      it('should not validate the response if the schema validation is disabled', async () => {
        const dataSource = create({ id: 'getAllUsers' }, null, null, true);

        const result = dataSource.request$();
        httpMock.expectOne(`${ SERVER_URL }/users`).flush({ not: 'an array' });

        expect(await result).toEqual({ not: 'an array' });
        expect(warn).not.toHaveBeenCalled();
      });

      it('should not validate the response if the validation is disabled', async () => {
        const dataSource = create({ id: 'getAllUsers' }, null, true, null, true);

        const result = dataSource.request$();
        httpMock.expectOne(`${ SERVER_URL }/users`).flush({ not: 'an array' });

        expect(await result).toEqual({ not: 'an array' });
      });

      it('should notify the interceptors about a successful response', async () => {
        const dataSource = create();
        const interceptor = new Subject<any>();
        const nextSpy = vi.fn();
        interceptor.subscribe(nextSpy);
        dataSource.interceptors!.add(interceptor);

        const result = dataSource.request$();
        httpMock.expectOne(`${ SERVER_URL }/users`).flush([]);
        await result;

        expect(nextSpy).toHaveBeenCalledTimes(1);
        expect(nextSpy.mock.calls[0][0].response.status).toBe(200);
        expect(nextSpy.mock.calls[0][0].response.body).toEqual([]);
        expect(nextSpy.mock.calls[0][0].options).toBeDefined();
      });

      it('should notify the interceptors and rethrow a http error', async () => {
        const dataSource = create();
        const interceptor = new Subject<any>();
        const nextSpy = vi.fn();
        interceptor.subscribe(nextSpy);
        dataSource.interceptors!.add(interceptor);

        const result = dataSource.request$();
        const rejection = result.catch((error: unknown) => error);
        httpMock.expectOne(`${ SERVER_URL }/users`).flush('boom', {
          status: 500,
          statusText: 'Server Error',
        });

        const error = await rejection;
        expect(error).toBeInstanceOf(HttpErrorResponse);
        expect((error as HttpErrorResponse).status).toBe(500);
        expect(nextSpy).toHaveBeenCalledTimes(1);
        expect(nextSpy.mock.calls[0][0].response).toBe(error);
      });

      it('should retry a failed request as configured in the metadata', async () => {
        const dataSource = create({
          id: 'getAllUsers',
          retry: 1,
        });

        const result = dataSource.request$();
        httpMock.expectOne(`${ SERVER_URL }/users`).flush('boom', {
          status: 500,
          statusText: 'Server Error',
        });
        httpMock.expectOne(`${ SERVER_URL }/users`).flush([ { id: 1 } ]);

        expect(await result).toEqual([ { id: 1 } ]);
      });

      it('should not retry a failed request by default', async () => {
        const dataSource = create();

        const rejection = dataSource.request$().catch((error: unknown) => error);
        httpMock.expectOne(`${ SERVER_URL }/users`).flush('boom', {
          status: 503,
          statusText: 'Unavailable',
        });

        expect(await rejection).toBeInstanceOf(HttpErrorResponse);
        httpMock.expectNone(`${ SERVER_URL }/users`);
      });

      it('should emit the new data to the connected viewers on refresh', () => {
        const dataSource = create({ id: 'getUserById' });
        const nextSpy = vi.fn();

        dataSource.connect({
          id: 'test',
          parameters: { uuid: 'one' },
        }).subscribe(nextSpy);
        httpMock.expectOne(`${ SERVER_URL }/users/one`).flush({ name: 'One' });

        dataSource.refresh({
          pathParams: { uuid: 'one' },
          params: new HttpParams().set('include', 'cars'),
          headers: new HttpHeaders({ 'x-trace': '1' }),
        });
        const request = httpMock.expectOne(`${ SERVER_URL }/users/one?include=cars`);
        request.flush({ name: 'One again' });

        expect(nextSpy).toHaveBeenCalledTimes(2);
        expect(nextSpy).toHaveBeenLastCalledWith({ name: 'One again' });
      });

    });

    describe('derive', () => {

      it('should derive a data source sharing the refresh subject', () => {
        const dataSource = create({ id: 'getAllUsers' });

        const derived = dataSource.derive('derived');

        expect(derived).toBeInstanceOf(OpenApiDataSource);
        expect(derived).not.toBe(dataSource);
        expect(derived.operation.operationId).toBe('getAllUsers');
        expect(derived.refresh$).toBe(dataSource.refresh$);
      });

      it('should derive an isolated data source with its own refresh subject', () => {
        const dataSource = create({ id: 'getAllUsers' });

        const derived = dataSource.derive('derived', undefined, true);

        expect(derived.refresh$).not.toBe(dataSource.refresh$);
      });

      it('should merge the passed metadata into the derived data source', () => {
        const dataSource = create({ id: 'getAllUsers' });

        const derived = dataSource.derive('derived', {
          id: 'derived',
          serverIndex: 1,
          timeout: 5,
        } as any);

        expect((derived.metadata.url as () => string)()).toBe('https://second.de/api/users');
        expect(derived.metadata['serverIndex']).toBe(1);
      });

      it('should use the refresh subject provided through the injector', () => {
        const refresh$ = new Subject<any>();
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
          providers: [
            provideHttpClient(withInterceptorsFromDi()),
            provideHttpClientTesting(),
            {
              provide: OpenApiConfigService,
              useValue: openApiService,
            },
            {
              provide: DEFAULT_OPEN_API_DATA_SOURCE_META_DATA,
              useValue: { id: 'getAllUsers' },
            },
            {
              provide: RXAP_DATA_SOURCE_REFRESH,
              useValue: refresh$,
            },
            OpenApiDataSource,
          ],
        });

        expect(TestBed.inject(OpenApiDataSource).refresh$).toBe(refresh$);
      });

    });

  });

});
