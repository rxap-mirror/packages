import {
  HttpTestingController,
  HttpClientTestingModule
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { OpenApiDataSource } from './open-api.data-source';
import { OpenApiConfigService } from '@rxap/open-api';
import { OpenApiDataSourceLoader } from '@rxap/open-api/data-source';

describe('Data Source', () => {

  describe('Open Api Parser', () => {

    let httpMock: HttpTestingController;
    let http: HttpClient;
    let loader: OpenApiDataSourceLoader;

    beforeAll(() => {
      OpenApiConfigService.Config = {
        openapi:  '3.0',
        info:     {
          title:   'Testing',
          version: '1'
        },
        servers: [
          { url: 'http://server.de/api' }
        ],
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
    });

    afterAll(() => {
      OpenApiConfigService.Config = null;
    });

    beforeEach(() => {

      TestBed.configureTestingModule({
        imports: [
          HttpClientTestingModule
        ]
      });

      httpMock = TestBed.inject(HttpTestingController);
      loader   = TestBed.inject(OpenApiDataSourceLoader);
      http     = TestBed.inject(HttpClient);

      expect(loader).toBeDefined();

    });

    afterEach(() => {
      httpMock.verify();
    });

    it('should create data source', () => {

      const dataSource = loader.load('getAllUsers');

      expect(dataSource).not.toBeNull();
      expect(dataSource).toBeInstanceOf(OpenApiDataSource);
      expect(dataSource!.id).toBe('getAllUsers');
      const url: any = dataSource!.metadata.url;
      expect(typeof url).toBe('function');
      expect(url()).toBe('http://server.de/api/users');

    });

  });

});
