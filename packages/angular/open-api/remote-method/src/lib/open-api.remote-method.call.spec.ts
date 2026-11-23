import {
  HttpClient,
  HttpContext,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import {
  INJECTOR,
  Injectable,
  InjectionToken,
  Injector,
  runInInjectionContext,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  DEFAULT_OPEN_API_REMOTE_METHOD_META_DATA,
  DISABLE_SCHEMA_VALIDATION,
  DISABLE_VALIDATION,
  OPEN_API_OPERATION_ID,
  OPEN_API_SERVER_ID,
  OPEN_API_SERVER_INDEX,
  OpenApiConfigService,
  OpenApiHttpResponseError,
  RXAP_OPEN_API_STRICT_VALIDATOR,
  RxapOpenApiError,
} from '@rxap/open-api';
import { Subject } from 'rxjs';
import { OpenApiRemoteMethodLoader } from './open-api-remote-method.loader';
import {
  OpenApiRemoteMethod,
  RxapOpenApiRemoteMethod,
} from './open-api.remote-method';

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
        post: {
          operationId: 'createUser',
          requestBody: {
            required: true,
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
          responses: {
            200: {
              description: 'ok',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: [ 'id' ],
                    properties: { id: { type: 'string' } },
                  },
                },
              },
            },
          },
        },
      },
      '/users/{uuid}': {
        put: {
          operationId: 'updateUser',
          parameters: [
            {
              name: 'uuid',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
            {
              name: 'notify',
              in: 'query',
              required: false,
              schema: { type: 'boolean' },
            },
          ],
          responses: { 200: { description: 'ok' } },
        },
        delete: {
          operationId: 'deleteUser',
          parameters: [
            {
              name: 'uuid',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: { 204: { description: 'deleted' } },
        },
      },
    },
  };
}

describe('@rxap/open-api/remote-method', () => {

  describe('OpenApiRemoteMethod calls', () => {

    let httpMock: HttpTestingController;
    let http: HttpClient;
    let injector: Injector;
    let openApiService: OpenApiConfigService;
    let warn: ReturnType<typeof vi.spyOn>;

    function create(
      metadata: Record<string, any> = { id: 'createUser' },
      strict: boolean | null = null,
      disableSchemaValidation: boolean | null = null,
      disableValidation: boolean | null = null,
    ): OpenApiRemoteMethod {
      return runInInjectionContext(injector, () => new OpenApiRemoteMethod(
        http,
        Injector.NULL,
        openApiService,
        metadata as any,
        strict,
        disableSchemaValidation,
        disableValidation,
      ));
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
      injector = TestBed.inject(INJECTOR);
      openApiService = new OpenApiConfigService(createConfig());
      warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      vi.spyOn(console, 'debug').mockImplementation(() => undefined);
    });

    afterEach(() => {
      httpMock.verify();
      vi.restoreAllMocks();
    });

    describe('decorator', () => {

      it('should create the remote method from an operation id with the default server index', () => {
        @RxapOpenApiRemoteMethod('createUser')
        class MyOperation extends OpenApiRemoteMethod {
        }

        const method = runInInjectionContext(injector, () => new MyOperation(http, Injector.NULL, openApiService));

        expect(method.id).toBe('createUser');
        expect(method.metadata['serverIndex']).toBe(0);
        expect((method.metadata.url as () => string)()).toBe(`${ SERVER_URL }/users`);
      });

      it('should use the server index', () => {
        @RxapOpenApiRemoteMethod('createUser', 1)
        class MyOperation extends OpenApiRemoteMethod {
        }

        const method = runInInjectionContext(injector, () => new MyOperation(http, Injector.NULL, openApiService));

        expect((method.metadata.url as () => string)()).toBe('https://second.de/api/users');
      });

      it('should use the operation object of the metadata', () => {
        const operation = {
          operationId: 'inline',
          path: '/inline',
          method: 'POST',
          responses: { 200: { description: 'ok' } },
        };

        @RxapOpenApiRemoteMethod({ operation })
        class MyOperation extends OpenApiRemoteMethod {
        }

        const method = runInInjectionContext(injector, () => new MyOperation(http, Injector.NULL, openApiService));

        expect(method.id).toBe('inline');
        expect(method.operation).toEqual(operation);
      });

      it('should use the fallback id if the operation has no operation id', () => {
        const operation: any = {
          path: '/inline',
          method: 'POST',
          operationId: undefined,
          responses: { 200: { description: 'ok' } },
        };

        @RxapOpenApiRemoteMethod({
          operation,
          fallbackId: 'fallback',
          serverId: 'custom',
        })
        class MyOperation extends OpenApiRemoteMethod {
        }

        const method = runInInjectionContext(injector, () => new MyOperation(http, Injector.NULL, openApiService, null));

        expect(method.metadata['serverId']).toBe('custom');
        expect(method.metadata['operation']).toBe(operation);
      });

      it('should create the remote method from an inline operation string', () => {
        const operation = {
          operationId: 'inline',
          path: '/inline',
          method: 'DELETE',
          responses: { 200: { description: 'ok' } },
        };

        @RxapOpenApiRemoteMethod({
          operationId: 'inline',
          operation: JSON.stringify(operation),
        })
        class MyOperation extends OpenApiRemoteMethod {
        }

        const method = runInInjectionContext(injector, () => new MyOperation(http, Injector.NULL, openApiService));

        expect(method.operation).toEqual(operation);
        expect(method.metadata.method).toBe('DELETE');
      });

      it('should throw if the operation id can not be determined', () => {
        expect(() => RxapOpenApiRemoteMethod({ operation: {} as any })(class {
        })).toThrow('The operationId for the open api remote method is not defined');
      });

    });

    describe('construction', () => {

      it('should resolve the operation and set the http context', () => {
        const method = create({
          id: 'updateUser',
          serverId: 'custom',
          serverIndex: 1,
        });

        expect(method.id).toBe('updateUser');
        expect(method.metadata.method).toBe('PUT');
        expect(method.metadata.withCredentials).toBe(true);
        expect(method.metadata['ignoreUndefined']).toBe(true);
        const context = method.metadata.context as HttpContext;
        expect(context.get(OPEN_API_OPERATION_ID)).toBe('updateUser');
        expect(context.get(OPEN_API_SERVER_ID)).toBe('custom');
        expect(context.get(OPEN_API_SERVER_INDEX)).toBe(1);
      });

      it('should respect the withCredentials and ignoreUndefined metadata', () => {
        const method = create({
          id: 'updateUser',
          withCredentials: false,
          ignoreUndefined: false,
        });

        expect(method.metadata.withCredentials).toBe(false);
        expect(method.metadata['ignoreUndefined']).toBe(false);
      });

      it('should use the base url of a registered server id', () => {
        OpenApiConfigService.InsertServer({ url: 'https://custom.de' }, 0, 'custom', openApiService.config);
        const method = create({
          id: 'createUser',
          serverId: 'custom',
        });

        expect((method.metadata.url as () => string)()).toBe('https://custom.de/users');
      });

      it('should parse an operation provided as json string', () => {
        const operation = {
          operationId: 'parsed',
          path: '/parsed',
          method: 'PUT',
        };

        const method = create({
          id: 'parsed',
          operation: JSON.stringify(operation),
        });

        expect(method.operation).toEqual(operation);
      });

      it('should throw if the operation string is not valid json', () => {
        expect(() => create({
          id: 'broken',
          operation: '{not json',
        })).toThrow('could not parse the remote method operation string into an object: OpenApiRemoteMethod');
      });

      it('should throw if the operation is not defined', () => {
        vi.spyOn(console, 'error').mockImplementation(() => undefined);

        expect(() => create({ id: 'unknown' })).toThrow('The operation \'unknown\' is not defined in the openapi-json');
      });

      it('should read the validation flags from the constructor arguments', () => {
        const method = create({ id: 'createUser' }, true, true, true);

        expect((method as any).strict).toBe(true);
        expect((method as any).disableSchemaValidation).toBe(true);
        expect((method as any).disableValidation).toBe(true);
      });

      it('should read the validation flags from the metadata', () => {
        const method = create({
          id: 'createUser',
          strict: true,
          disableSchemaValidation: true,
          disableValidation: true,
        });

        expect((method as any).strict).toBe(true);
        expect((method as any).disableSchemaValidation).toBe(true);
        expect((method as any).disableValidation).toBe(true);
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
              provide: DEFAULT_OPEN_API_REMOTE_METHOD_META_DATA,
              useValue: { id: 'createUser' },
            },
            {
              provide: RXAP_OPEN_API_STRICT_VALIDATOR,
              useValue: true,
            },
            {
              provide: DISABLE_SCHEMA_VALIDATION,
              useValue: false,
            },
            {
              provide: DISABLE_VALIDATION,
              useValue: false,
            },
            OpenApiRemoteMethod,
          ],
        });

        const method = TestBed.inject(OpenApiRemoteMethod);

        expect(method.id).toBe('createUser');
        expect((method as any).strict).toBe(true);
        expect((method as any).disableValidation).toBe(false);
      });

    });

    describe('call', () => {

      it('should send the request body and return the response body', async () => {
        const method = create();
        const executedSpy = vi.fn();
        method.executed$.subscribe(executedSpy);

        const result = method.call({ requestBody: { name: 'John' } });

        const request = httpMock.expectOne(`${ SERVER_URL }/users`);
        expect(request.request.method).toBe('POST');
        expect(request.request.body).toEqual({ name: 'John' });
        request.flush({ id: '1' });

        expect(await result).toEqual({ id: '1' });
        expect(executedSpy).toHaveBeenCalledWith({ id: '1' });
        expect(warn).not.toHaveBeenCalled();
      });

      it('should replace the path parameters and apply the query parameters', async () => {
        const method = create({ id: 'updateUser' });

        const result = method.call({
          parameters: {
            uuid: 'user-1',
            notify: true,
          },
        });

        const request = httpMock.expectOne(`${ SERVER_URL }/users/user-1?notify=true`);
        expect(request.request.method).toBe('PUT');
        expect(request.request.withCredentials).toBe(true);
        expect(request.request.context.get(OPEN_API_OPERATION_ID)).toBe('updateUser');
        request.flush({ ok: true });

        expect(await result).toEqual({ ok: true });
      });

      it('should skip undefined query parameters', async () => {
        const method = create({ id: 'updateUser' });

        const result = method.call({
          parameters: {
            uuid: 'user-1',
            notify: undefined,
          },
        });

        httpMock.expectOne(`${ SERVER_URL }/users/user-1`).flush({ ok: true });

        expect(await result).toEqual({ ok: true });
      });

      it('should return null and warn if the response body is empty', async () => {
        const method = create({ id: 'deleteUser' });

        const result = method.call({ parameters: { uuid: 'user-1' } });
        httpMock.expectOne(`${ SERVER_URL }/users/user-1`).flush(null, {
          status: 204,
          statusText: 'No Content',
        });

        expect(await result).toBeNull();
        expect(warn).toHaveBeenCalledWith('The response body is empty!');
      });

      it('should track the executions in progress', async () => {
        const method = create({ id: 'deleteUser' });

        expect(method.executionsInProgress()).toBe(0);
        const result = method.call({ parameters: { uuid: 'user-1' } });
        expect(method.executionsInProgress()).toBe(1);
        httpMock.expectOne(`${ SERVER_URL }/users/user-1`).flush(null, {
          status: 204,
          statusText: 'No Content',
        });
        await result;

        expect(method.executionsInProgress()).toBe(0);
      });

      it('should wrap a http error into an OpenApiHttpResponseError', async () => {
        const method = create({
          id: 'updateUser',
          serverId: 'custom',
        });
        OpenApiConfigService.InsertServer({ url: SERVER_URL }, 0, 'custom', openApiService.config);

        const rejection = method.call({ parameters: { uuid: 'user-1' } }).catch((error: unknown) => error);
        httpMock.expectOne(`${ SERVER_URL }/users/user-1`).flush({ message: 'boom' }, {
          status: 500,
          statusText: 'Server Error',
        });

        const error = await rejection as OpenApiHttpResponseError;
        expect(error).toBeInstanceOf(OpenApiHttpResponseError);
        expect(error).toBeInstanceOf(HttpErrorResponse);
        expect(error.status).toBe(500);
        expect(error.error).toEqual({ message: 'boom' });
        expect(error.operationId).toBe('updateUser');
        expect(error.serverId).toBe('custom');
        expect(error.name).toBe('OpenApiHttpResponseError');
        expect(method.executionsInProgress()).toBe(0);
      });

      it('should notify the interceptors about successful responses and http errors', async () => {
        const method = create({ id: 'updateUser' });
        const interceptor = new Subject<any>();
        const nextSpy = vi.fn();
        interceptor.subscribe(nextSpy);
        method.interceptors!.add(interceptor);
        const parameters = { uuid: 'user-1' };

        const success = method.call({ parameters });
        httpMock.expectOne(`${ SERVER_URL }/users/user-1`).flush({ ok: true });
        await success;

        expect(nextSpy).toHaveBeenCalledTimes(1);
        expect(nextSpy.mock.calls[0][0].response.status).toBe(200);
        expect(nextSpy.mock.calls[0][0].parameters).toBe(parameters);

        const failure = method.call({ parameters }).catch((error: unknown) => error);
        httpMock.expectOne(`${ SERVER_URL }/users/user-1`).flush('boom', {
          status: 404,
          statusText: 'Not Found',
        });
        await failure;

        expect(nextSpy).toHaveBeenCalledTimes(2);
        expect(nextSpy.mock.calls[1][0].response).toBeInstanceOf(HttpErrorResponse);
        expect(nextSpy.mock.calls[1][0].response.status).toBe(404);
        expect(nextSpy.mock.calls[1][0].parameters).toBe(parameters);
      });

      it('should retry a failed request as configured in the metadata', async () => {
        const method = create({
          id: 'updateUser',
          retry: 2,
        });

        const result = method.call({ parameters: { uuid: 'user-1' } });
        const url = `${ SERVER_URL }/users/user-1`;
        httpMock.expectOne(url).flush('boom', {
          status: 500,
          statusText: 'Server Error',
        });
        httpMock.expectOne(url).flush('boom', {
          status: 500,
          statusText: 'Server Error',
        });
        httpMock.expectOne(url).flush({ ok: true });

        expect(await result).toEqual({ ok: true });
      });

      it('should refresh the configured refreshables after the call', async () => {
        const refresh = vi.fn();

        @Injectable()
        class Refreshable {
          refresh = refresh;
        }

        const token = new InjectionToken<Refreshable>('refreshable');
        const refreshInjector = Injector.create({
          providers: [
            {
              provide: token,
              useValue: new Refreshable(),
            },
          ],
        });
        const method = runInInjectionContext(injector, () => new OpenApiRemoteMethod(
          http,
          refreshInjector,
          openApiService,
          {
            id: 'deleteUser',
            refresh: [ token ],
          } as any,
        ));

        method.pauseRefresh();
        const first = method.call({ parameters: { uuid: 'user-1' } });
        httpMock.expectOne(`${ SERVER_URL }/users/user-1`).flush({ ok: true });
        await first;
        expect(refresh).not.toHaveBeenCalled();

        method.resumeRefresh();
        const second = method.call({ parameters: { uuid: 'user-1' } });
        httpMock.expectOne(`${ SERVER_URL }/users/user-1`).flush({ ok: true });
        await second;
        expect(refresh).toHaveBeenCalledTimes(1);
      });

    });

    describe('validation', () => {

      it('should warn about missing parameters but still send the request', async () => {
        const method = create({ id: 'updateUser' });

        const result = method.call({ parameters: { uuid: 'user-1' } as any });
        httpMock.expectOne(`${ SERVER_URL }/users/user-1`).flush({ ok: true });
        await result;
        expect(warn).not.toHaveBeenCalled();

        const invalid = method.call({ parameters: { uuid: 1 } as any });
        httpMock.expectOne(`${ SERVER_URL }/users/1`).flush({ ok: true });
        await invalid;
        expect(warn).toHaveBeenCalledWith('The parameter \'uuid\' is not valid against the schema!');
      });

      it('should throw in strict mode if the parameters are invalid', async () => {
        const method = create({ id: 'updateUser' }, true);

        await expect(method.call({ parameters: { uuid: 1 } as any })).rejects.toThrow(RxapOpenApiError);
        await expect(method.call({ parameters: {} as any }))
          .rejects.toThrow('The operation parameter \'uuid\' is required!');
        await expect(method.call()).rejects.toThrow('Some operation parameters are required!');
      });

      it('should throw in strict mode if the request body is invalid', async () => {
        const method = create({ id: 'createUser' }, true);

        await expect(method.call({ requestBody: { name: 1 } })).rejects.toThrow('The request body is not valid!');
      });

      it('should warn if the response does not match the response schema', async () => {
        const method = create({ id: 'createUser' });

        const result = method.call({ requestBody: { name: 'John' } });
        httpMock.expectOne(`${ SERVER_URL }/users`).flush({ unexpected: true });
        await result;

        expect(warn).toHaveBeenCalledWith('The response is not valid ageist the operation schema!');
      });

      it('should throw in strict mode if the response does not match the response schema', async () => {
        const method = create({ id: 'createUser' }, true);

        const rejection = method.call({ requestBody: { name: 'John' } }).catch((error: unknown) => error);
        httpMock.expectOne(`${ SERVER_URL }/users`).flush({ unexpected: true });

        expect(await rejection).toBeInstanceOf(RxapOpenApiError);
        expect(method.executionsInProgress()).toBe(0);
      });

      it('should not validate anything if the validation is disabled', async () => {
        const method = create({ id: 'createUser' }, true, null, true);

        const result = method.call({ requestBody: { name: 1 } });
        httpMock.expectOne(`${ SERVER_URL }/users`).flush({ unexpected: true });

        expect(await result).toEqual({ unexpected: true });
        expect(warn).not.toHaveBeenCalled();
      });

      it('should not validate against the schema if the schema validation is disabled', async () => {
        const method = create({ id: 'createUser' }, true, true);

        const result = method.call({ requestBody: { name: 1 } });
        httpMock.expectOne(`${ SERVER_URL }/users`).flush({ unexpected: true });

        expect(await result).toEqual({ unexpected: true });
      });

    });

    describe('callWithResponse', () => {

      it('should return the full response and emit the executed body', async () => {
        const method = create({ id: 'updateUser' });
        const executedSpy = vi.fn();
        method.executed$.subscribe(executedSpy);

        const result = method.callWithResponse({ parameters: { uuid: 'user-1' } });
        httpMock.expectOne(`${ SERVER_URL }/users/user-1`).flush({ ok: true }, {
          status: 200,
          statusText: 'OK',
          headers: { 'x-custom': 'value' },
        });

        const response = await result;
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ ok: true });
        expect(response.headers.get('x-custom')).toBe('value');
        expect(executedSpy).toHaveBeenCalledWith({ ok: true });
        expect(method.executionsInProgress()).toBe(0);
      });

      it('should not emit the executed event if the response has no body', async () => {
        const method = create({ id: 'deleteUser' });
        const executedSpy = vi.fn();
        method.executed$.subscribe(executedSpy);

        const result = method.callWithResponse({ parameters: { uuid: 'user-1' } });
        httpMock.expectOne(`${ SERVER_URL }/users/user-1`).flush(null, {
          status: 204,
          statusText: 'No Content',
        });

        expect((await result).status).toBe(204);
        expect(executedSpy).not.toHaveBeenCalled();
      });

      it('should work without arguments', async () => {
        const method = create({ id: 'createUser' }, null, null, true);

        const result = method.callWithResponse();
        httpMock.expectOne(`${ SERVER_URL }/users`).flush({ id: '1' });

        expect((await result).body).toEqual({ id: '1' });
      });

      it('should reject with the http error and release the execution counter', async () => {
        const method = create({ id: 'updateUser' });

        const rejection = method.callWithResponse({ parameters: { uuid: 'user-1' } }).catch((error: unknown) => error);
        httpMock.expectOne(`${ SERVER_URL }/users/user-1`).flush('boom', {
          status: 500,
          statusText: 'Server Error',
        });

        expect(await rejection).toBeInstanceOf(HttpErrorResponse);
        expect(method.executionsInProgress()).toBe(0);
      });

    });

    describe('loader', () => {

      it('should load a remote method for a defined operation', () => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
          providers: [
            provideHttpClient(withInterceptorsFromDi()),
            provideHttpClientTesting(),
            {
              provide: OpenApiConfigService,
              useValue: openApiService,
            },
          ],
        });

        const loader = TestBed.inject(OpenApiRemoteMethodLoader);
        const method = TestBed.runInInjectionContext(() => loader.load('deleteUser'));

        expect(method).toBeInstanceOf(OpenApiRemoteMethod);
        expect(method!.id).toBe('deleteUser');
        expect(method!.metadata.method).toBe('DELETE');
        expect(method!.injector).toBeDefined();
      });

      it('should throw if the operation is not defined', () => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
          providers: [
            provideHttpClient(withInterceptorsFromDi()),
            provideHttpClientTesting(),
            {
              provide: OpenApiConfigService,
              useValue: openApiService,
            },
          ],
        });
        vi.spyOn(console, 'error').mockImplementation(() => undefined);

        const loader = TestBed.inject(OpenApiRemoteMethodLoader);

        expect(() => loader.load('unknown'))
          .toThrow('The operation \'unknown\' is not defined in the openapi-json');
      });

    });

  });

});
