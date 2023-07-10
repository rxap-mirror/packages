import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {HttpClient} from '@angular/common/http';
import {OpenApiRemoteMethod, RxapOpenApiRemoteMethod} from './open-api.remote-method';
import {TestBed} from '@angular/core/testing';
import {Injector} from '@angular/core';
import {OpenApiConfigService} from '@rxap/open-api';

describe('@rxap/open-api/remote-method', () => {

  describe('OpenApiRemoteMethod', () => {

    let remoteMethod: OpenApiRemoteMethod;
    let httpMock: HttpTestingController;
    let http: HttpClient;
    let openApiService: OpenApiConfigService;
    const operation = {
      operationId: 'test-operation',
      path: '/test',
      responses: {
        200: {
          description: 'ok',
        },
      },
      method: 'PUT',
    };

    beforeEach(() => {

      TestBed.configureTestingModule({
        imports: [
          HttpClientTestingModule,
        ],
      });

      http = TestBed.inject(HttpClient);
      httpMock = TestBed.inject(HttpTestingController);
      openApiService = new OpenApiConfigService({
        openapi: '3.0',
        info: {
          title: 'Testing',
          version: '1',
        },
        servers: [{url: 'https://server.de/api'}],
        paths: {
          '/users': {
            get: {operationId: 'getAllUsers', responses: {200: {description: 'ok'}}},
            post: {operationId: 'createUser', responses: {200: {description: 'ok'}}},
          },
          '/users/{uuid}': {
            get: {operationId: 'getUserById', responses: {200: {description: 'ok'}}},
            delete: {operationId: 'deleteUserById', responses: {200: {description: 'ok'}}},
          },
          '/users/{uuid}/cars/{carUuid}': {
            get: {operationId: 'getUserCarById', responses: {200: {description: 'ok'}}},
          },
        },
      });

      remoteMethod = new OpenApiRemoteMethod(http, Injector.NULL, openApiService, {id: 'test', operation});
    });

    afterEach(() => {
      httpMock.verify();
    });

    it('should create', () => {

      let url: string;
      if (typeof remoteMethod.metadata.url === 'function') {
        url = remoteMethod.metadata.url();
      } else {
        url = remoteMethod.metadata.url;
      }

      expect(url).toBe('https://server.de/api/test');
      expect(remoteMethod.id).toBe('test-operation');

    });

    it('should create open api remote method from operationId', async () => {

      remoteMethod = new OpenApiRemoteMethod(http, Injector.NULL, openApiService, {id: 'createUser'});

      OpenApiConfigService.Config = null;

      const data = {data: 'data'};

      const result = remoteMethod.call();

      let url: string;
      if (typeof remoteMethod.metadata.url === 'function') {
        url = remoteMethod.metadata.url();
      } else {
        url = remoteMethod.metadata.url;
      }

      httpMock.expectOne(url).flush(data);

      expect(await result).toBe(data);

    });

    it('should create open api remote method from operationId defined with decorator', async () => {

      @RxapOpenApiRemoteMethod('createUser')
      class MyOperation extends OpenApiRemoteMethod {
      }

      remoteMethod = new MyOperation(http, Injector.NULL, openApiService);

      OpenApiConfigService.Config = null;

      const data = {data: 'data'};

      const result = remoteMethod.call()

      let url: string;
      if (typeof remoteMethod.metadata.url === 'function') {
        url = remoteMethod.metadata.url();
      } else {
        url = remoteMethod.metadata.url;
      }

      httpMock.expectOne(url).flush(data);

      expect(await result).toBe(data);

    });

  });

});
