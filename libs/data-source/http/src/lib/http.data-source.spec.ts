import {
  TestBed,
  fakeAsync
} from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';
import { HttpDataSource } from './http.data-source';
import { Subject } from 'rxjs';
import createSpy = jasmine.createSpy;

describe('@rxap/data-source', () => {

  describe('HttpDataSource', () => {

    let dataSource: HttpDataSource<any>;
    let httpMock: HttpTestingController;
    let http: HttpClient;
    const url = 'http://server.test/api';

    beforeEach(() => {

      TestBed.configureTestingModule({
        imports: [
          HttpClientTestingModule
        ]
      });

      http     = TestBed.get(HttpClient);
      httpMock = TestBed.get(HttpTestingController);

      dataSource = new HttpDataSource<any>(http, { id: 'test', deps: [], url });
    });

    describe('with http verify', () => {

      afterEach(() => {
        httpMock.verify();
      });

      it('should emit http response without viewChange option', fakeAsync(() => {

        const viewer = { id: 'test' };
        const data   = {};

        const connection = dataSource.connect(viewer);

        const nextSpy     = createSpy('next');
        const errorSpy    = createSpy('error');
        const completeSpy = createSpy('complete');

        connection.subscribe(nextSpy, errorSpy, completeSpy);

        httpMock.expectOne(url).flush(data);

        expect(nextSpy).toBeCalledTimes(1);
        expect(nextSpy).toBeCalledWith(data);
        expect(errorSpy).not.toBeCalled();
        expect(completeSpy).not.toBeCalled();

      }));

      it('should emit http response with viewChange option', fakeAsync(() => {

        const viewChange = new Subject<any>();
        const viewer     = { id: 'test', viewChange };
        const data       = {};

        const connection = dataSource.connect(viewer);

        const nextSpy     = createSpy('next');
        const errorSpy    = createSpy('error');
        const completeSpy = createSpy('complete');

        connection.subscribe(nextSpy, errorSpy, completeSpy);
        viewChange.next();

        httpMock.expectOne(url).flush(data);

        expect(nextSpy).toBeCalledTimes(1);
        expect(nextSpy).toBeCalledWith(data);
        expect(errorSpy).not.toBeCalled();
        expect(completeSpy).not.toBeCalled();

        viewChange.next({ headers: new HttpHeaders({ 'header1': 'value' }) });

        const request = httpMock.expectOne(url);

        expect(request.request.headers.get('header1')).toEqual('value');
        request.flush(data);
        expect(nextSpy).toBeCalledTimes(2);
        expect(nextSpy).toBeCalledWith(data);
        expect(errorSpy).not.toBeCalled();
        expect(completeSpy).not.toBeCalled();

      }));

      it('should share http response with all connections', fakeAsync(() => {

        const viewer1  = { id: 'viewer1', viewChange: new Subject<any>() };
        const viewer2  = { id: 'viewer2', viewChange: new Subject<any>() };
        const viewer3  = { id: 'viewer3', viewChange: new Subject<any>() };
        const next1Spy = createSpy('next1');
        const next2Spy = createSpy('next2');
        const next3Spy = createSpy('next3');

        const connection1            = dataSource.connect(viewer1);
        const connectionSubscription = connection1.subscribe(next1Spy);
        viewer1.viewChange.next();

        httpMock.expectOne(url).flush('data1');

        expect(next1Spy).toBeCalledTimes(1);
        expect(next1Spy).toBeCalledWith('data1');

        const connection2 = dataSource.connect(viewer2);
        connection2.subscribe(next2Spy);

        expect(next2Spy).toBeCalledTimes(1);
        expect(next2Spy).toBeCalledWith('data1');

        viewer2.viewChange.next();

        httpMock.expectOne(url).flush('data2');

        expect(next1Spy).toBeCalledTimes(2);
        expect(next1Spy).toBeCalledWith('data1');
        expect(next1Spy).toBeCalledWith('data2');
        expect(next2Spy).toBeCalledTimes(2);
        expect(next2Spy).toBeCalledWith('data1');
        expect(next2Spy).toBeCalledWith('data2');

        const connection3 = dataSource.connect(viewer3);
        connection3.subscribe(next3Spy);

        expect(next3Spy).toBeCalledTimes(1);
        expect(next3Spy).toBeCalledWith('data2');

        dataSource.disconnect(viewer1);
        connectionSubscription.unsubscribe();

        viewer2.viewChange.next();

        httpMock.expectOne(url).flush('data3');

        expect(next1Spy).toBeCalledTimes(2);
        expect(next1Spy).toBeCalledWith('data1');
        expect(next1Spy).toBeCalledWith('data2');
        expect(next2Spy).toBeCalledTimes(3);
        expect(next2Spy).toBeCalledWith('data1');
        expect(next2Spy).toBeCalledWith('data2');
        expect(next2Spy).toBeCalledWith('data3');
        expect(next3Spy).toBeCalledTimes(2);
        expect(next3Spy).toBeCalledWith('data2');
        expect(next3Spy).toBeCalledWith('data3');

        viewer1.viewChange.next();


      }));

      it('should replace one url parameter', () => {

        dataSource = new HttpDataSource<any>(
          http,
          {
            id:   'test',
            deps: [],
            url:  'http://server.test/api/user/{id}'
          }
        );

        const viewer = { id: 'test', viewChange: new Subject<any>() };

        const connection = dataSource.connect(viewer);

        const nextSpy     = createSpy('next');
        const errorSpy    = createSpy('error');
        const completeSpy = createSpy('complete');

        connection.subscribe(nextSpy, errorSpy, completeSpy);

        viewer.viewChange.next({ pathParams: { id: 'my-id' } });

        httpMock.expectOne('http://server.test/api/user/my-id').flush('data');

        expect(nextSpy).toBeCalledTimes(1);
        expect(nextSpy).toBeCalledWith('data');
        expect(errorSpy).not.toBeCalled();
        expect(completeSpy).not.toBeCalled();

      });

      it('should emit error if url parameters missing', () => {

        dataSource = new HttpDataSource<any>(
          http,
          {
            id:   'test',
            deps: [],
            url:  'http://server.test/api/user/{id}/product/{pId}'
          }
        );

        const viewer = { id: 'test', viewChange: new Subject<any>() };

        const connection = dataSource.connect(viewer);

        const nextSpy     = createSpy('next');
        const errorSpy    = createSpy('error');
        const completeSpy = createSpy('complete');

        const subscription = connection.subscribe(nextSpy, errorSpy, completeSpy);

        expect(subscription.closed).toBeFalsy();

        viewer.viewChange.next({ pathParams: { id: 'my-id' } });

        expect(nextSpy).not.toBeCalled();
        expect(errorSpy).toBeCalledTimes(1);
        expect(completeSpy).not.toBeCalled();
        expect(subscription.closed).toBeTruthy();

      });

      it('should replace multiple url parameter', () => {

        dataSource = new HttpDataSource<any>(
          http,
          {
            id:   'test',
            deps: [],
            url:  'http://server.test/api/user/{id}/product/{pId}'
          }
        );

        const viewer = { id: 'test', viewChange: new Subject<any>() };

        const connection = dataSource.connect(viewer);

        const nextSpy     = createSpy('next');
        const errorSpy    = createSpy('error');
        const completeSpy = createSpy('complete');

        connection.subscribe(nextSpy, errorSpy, completeSpy);

        viewer.viewChange.next({ pathParams: { id: 'my-id', 'pId': 'p-id' } });

        httpMock
          .expectOne('http://server.test/api/user/my-id/product/p-id')
          .flush('data');

        expect(nextSpy).toBeCalledTimes(1);
        expect(nextSpy).toBeCalledWith('data');
        expect(errorSpy).not.toBeCalled();
        expect(completeSpy).not.toBeCalled();

      });

    });


    describe('should call init on first request', () => {

      let initSpy: jest.SpyInstance;

      beforeEach(() => {
        initSpy = jest.spyOn(dataSource, 'init');
      });

      it('connect', () => {

        expect(initSpy).not.toBeCalled();
        dataSource.connect({ id: 'test' });
        expect(initSpy).toBeCalled();

      });

      it('request$', () => {

        expect(initSpy).not.toBeCalled();
        dataSource.request$();
        expect(initSpy).toBeCalled();

      });

      it('refresh', () => {

        expect(initSpy).not.toBeCalled();
        dataSource.refresh();
        expect(initSpy).toBeCalled();

      });

    });

  });

});
