import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { HttpDataSourceConnection } from '@rxap/data-source';

describe('Data Source', () => {

  describe('Http Data Source Connection', () => {

    let http: HttpClient;
    let httpMock: HttpTestingController;
    let connection: HttpDataSourceConnection<any>;
    const url = '/api/test';

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [
          HttpClientTestingModule
        ]
      });

      http       = TestBed.get(HttpClient);
      httpMock   = TestBed.get(HttpTestingController);
      connection = new HttpDataSourceConnection<any>(
        http,
        url
      );

    });

    afterEach(() => {
      httpMock.verify();
    });

    it('should emit http response', async () => {

      const data = 'data';

      connection.subscribe(response => {
        expect(response).toEqual(data);
      });

      const req = httpMock.expectOne(url);
      expect(req.request.method).toEqual('GET');

      req.flush(data);

    });


  });

  describe('Http Data Source', () => {});

});
