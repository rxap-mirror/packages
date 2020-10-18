import {
  OpenApiDataSource,
  OpenApiDataSourceViewer
} from './open-api.data-source';
import { RxapDataSource } from '@rxap/data-source';
import {
  HttpTestingController,
  HttpClientTestingModule
} from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import {
  OpenApiConfigService,
  OpenAPIObject
} from '@rxap/open-api';
import createSpy = jasmine.createSpy;
import {
  INJECTOR,
  Injector
} from '@angular/core';

describe('@rxap/open-api/data-source', () => {

  describe('OpenApiDataSource', () => {

    let dataSource: OpenApiDataSource<any>;
    let httpMock: HttpTestingController;
    let http: HttpClient;
    let openApiService: OpenApiConfigService;
    const operation = {
      operationId: 'test-operation',
      path:         'test',
      responses:   {
        200: {
          description: 'ok'
        }
      },
      method:      'GET'
    };

    beforeEach(() => {

      TestBed.configureTestingModule({
        imports: [
          HttpClientTestingModule
        ]
      });

      http     = TestBed.inject(HttpClient);
      httpMock = TestBed.inject(HttpTestingController);
      openApiService = new OpenApiConfigService({
        host:     'rxap.dev',
        basePath: '/api',
        openapi:  '3.0',
        info:     {
          title:   'Testing',
          version: '1'
        },
        servers: [ { url: 'https://server.de/api' } ],
        paths:    {
          '/users':                       {
            get:  { operationId: 'getAllUsers' },
            post: { operationId: 'createUser' }
          },
          '/users/{uuid}':                {
            get:    { operationId: 'getUserById' },
            delete: { operationId: 'deleteUserById' }
          },
          '/users/{uuid}/cars/{carUuid}': {
            get: { operationId: 'getUserCarById' }
          }
        }
      });

      dataSource = new OpenApiDataSource(http, openApiService, { id: 'test', operation });
    });

    afterEach(() => {
      httpMock.verify();
    });


    it('should create', () => {

      expect(dataSource.metadata.url).toBe('https://server.de/api/test');
      expect(dataSource.id).toBe('test-operation');

    });

    it('should send request to url on connect', () => {

      const data   = { data: 'data' };
      const viewer = { id: 'test' };

      const connection = dataSource.connect(viewer);

      const nextSpy     = createSpy('next');
      const errorSpy    = createSpy('error');
      const completeSpy = createSpy('complete');

      connection.subscribe(nextSpy, errorSpy, completeSpy);

      httpMock.expectOne(dataSource.metadata.url).flush(data);

      expect(nextSpy).toBeCalledTimes(1);
      expect(nextSpy).toBeCalledWith(data);
      expect(errorSpy).not.toBeCalled();
      expect(completeSpy).not.toBeCalled();

    });

    it('should create open api data source from operationId', () => {

      dataSource = new OpenApiDataSource(http, openApiService, { id: 'getAllUsers' });

      const data   = { data: 'data' };
      const viewer = { id: 'test' };

      const connection = dataSource.connect(viewer);

      const nextSpy     = createSpy('next');
      const errorSpy    = createSpy('error');
      const completeSpy = createSpy('complete');

      connection.subscribe(nextSpy, errorSpy, completeSpy);

      httpMock.expectOne(dataSource.metadata.url).flush(data);

      expect(errorSpy).not.toBeCalled();
      expect(completeSpy).not.toBeCalled();
      expect(nextSpy).toBeCalledTimes(1);
      expect(nextSpy).toBeCalledWith(data);

    });

    it('should create open api data source from operationId defined with decorator', () => {

      OpenApiConfigService.Config = {
        host:     'rxap.dev',
        basePath: '/api',
        openapi:  '3.0',
        info:     {
          title:   'Testing',
          version: '1'
        },
        servers: [ { url: 'http://server.de' } ],
        paths:    {
          '/users':                       {
            get:  { operationId: 'getAllUsers' },
            post: { operationId: 'createUser' }
          },
          '/users/{uuid}':                {
            get:    { operationId: 'getUserById' },
            delete: { operationId: 'deleteUserById' }
          },
          '/users/{uuid}/cars/{carUuid}': {
            get: { operationId: 'getUserCarById' }
          }
        }
      };

      @RxapDataSource('getAllUsers')
      class MyOperation extends OpenApiDataSource {}

      dataSource = new MyOperation(http, openApiService);

      OpenApiConfigService.Config = null;

      const data   = { data: 'data' };
      const viewer = { id: 'test' };

      const connection = dataSource.connect(viewer);

      const nextSpy     = createSpy('next');
      const errorSpy    = createSpy('error');
      const completeSpy = createSpy('complete');

      connection.subscribe(nextSpy, errorSpy, completeSpy);

      httpMock.expectOne(dataSource.metadata.url).flush(data);

      expect(errorSpy).not.toBeCalled();
      expect(completeSpy).not.toBeCalled();
      expect(nextSpy).toBeCalledTimes(1);
      expect(nextSpy).toBeCalledWith(data);

    });

    describe('should validate viewer parameters', () => {

      let config: OpenAPIObject;
      const data = { data: 'data' };

      beforeEach(() => {

          config = {
            host:     'rxap.dev',
            basePath: '/api',
            openapi:  '3.0',
            info:     {
              title:   'Testing',
              version: '1'
            },
            servers: [ { url: 'http://server.de' } ],
            paths:    {
              '/users/{uuid}':                {
                get:    {
                  operationId: 'getUserById',
                  parameters: [
                    {
                      name: 'uuid',
                      in: 'path',
                      required: true,
                      schema: {
                        type: 'string'
                      }
                    }
                  ]
                },
              },
              '/users/{uuid}/cars/{carUuid}': {
                get: {
                  operationId: 'getUserCarById',
                  parameters: [
                    {
                      name: 'uuid',
                      in: 'path',
                      required: true,
                      schema: {
                        type: 'string'
                      }
                    },
                    {
                      name: 'carUuid',
                      in: 'path',
                      required: true,
                      schema: {
                        type: 'string'
                      }
                    }
                  ]
                }
              }
            }
          };

          openApiService = new OpenApiConfigService(config);

      });

      it('getUserById', () => {

        dataSource = new OpenApiDataSource(http, openApiService, { id: 'getUserById' });

        const connection$ = dataSource.connect({
          parameters: {
            uuid: 'uuid'
          }
        });

        const nextSpy     = createSpy('next');
        const errorSpy    = createSpy('error');
        const completeSpy = createSpy('complete');

        connection$.subscribe(nextSpy, errorSpy, completeSpy);

        httpMock.expectOne(dataSource.metadata.url.replace('{uuid}', 'uuid')).flush(data);

        expect(errorSpy).not.toBeCalled();
        expect(completeSpy).not.toBeCalled();
        expect(nextSpy).toBeCalledTimes(1);
        expect(nextSpy).toBeCalledWith(data);

        expect(() => dataSource.connect({})).toThrow('Some operation parameters are required!');
        expect(() => dataSource.connect({ parameters: {} })).toThrow('The operation parameter \'uuid\' is required!');
        expect(() => dataSource.connect({ parameters: { uuid: 1 } })).toThrow('The parameter \'uuid\' is not valid against the schema!')

      });

      it('getUserCarById', () => {

        dataSource = new OpenApiDataSource(http, openApiService, { id: 'getUserCarById' });

        const connection$ = dataSource.connect({
          parameters: {
            uuid: 'uuid',
            carUuid: 'carUuid'
          }
        });

        const nextSpy     = createSpy('next');
        const errorSpy    = createSpy('error');
        const completeSpy = createSpy('complete');

        connection$.subscribe(nextSpy, errorSpy, completeSpy);

        httpMock.expectOne(dataSource.metadata.url.replace('{uuid}', 'uuid').replace('{carUuid}', 'carUuid')).flush(data);

        expect(errorSpy).not.toBeCalled();
        expect(completeSpy).not.toBeCalled();
        expect(nextSpy).toBeCalledTimes(1);
        expect(nextSpy).toBeCalledWith(data);

        expect(() => dataSource.connect({})).toThrow('Some operation parameters are required!');
        expect(() => dataSource.connect({ parameters: {} })).toThrow('The operation parameter \'uuid\' is required!');
        expect(() => dataSource.connect({ parameters: { uuid: 1 } })).toThrow('The parameter \'uuid\' is not valid against the schema!');
        expect(() => dataSource.connect({ parameters: { uuid: 1, carUuid: 'ok' } })).toThrow('The parameter \'uuid\' is not valid against the schema!');

      });

    });

  });

});
