import {PaginationDataSource} from './pagination.data-source';
import {StaticDataSource} from '@rxap/data-source';
import {PaginatorFake} from '@rxap/data-source/testing';
import {Subject} from 'rxjs';

describe('@rxap/data-source', () => {

  describe('pagination', () => {

    describe('PaginationDataSource', () => {

      let dataSource: PaginationDataSource<any>;
      let paginator: PaginatorFake;
      let matPaginator: PaginatorFake;

      beforeEach(() => {
        paginator = new PaginatorFake();
        matPaginator = paginator as any;
      });

      it('should throw if source data source is not a collection data source', () => {

        const source = new StaticDataSource<any>({}, {id: 'static'});

        dataSource = new PaginationDataSource<any>(source as any, matPaginator);

        const connection = dataSource.connect({id: 'test'});

        const nextSpy = jest.fn();
        const errorSpy = jest.fn();
        const completeSpy = jest.fn();

        connection.subscribe(
          nextSpy,
          errorSpy,
          completeSpy,
        );

        expect(nextSpy).not.toBeCalled();
        expect(errorSpy).toBeCalled();
        expect(completeSpy).not.toBeCalled();

      });

      it('should return the data paged based on the paginator state', (() => {

        const source = new StaticDataSource<any[]>([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], {id: 'static'});

        paginator.pageSize = 5;

        dataSource = new PaginationDataSource<any>(source as any, matPaginator);

        const connection = dataSource.connect({id: 'test'});

        const nextSpy = jest.fn();
        const errorSpy = jest.fn();
        const completeSpy = jest.fn();

        connection.subscribe(
          nextSpy,
          errorSpy,
          completeSpy,
        );

        expect(nextSpy).toBeCalled();
        expect(errorSpy).not.toBeCalled();
        expect(completeSpy).not.toBeCalled();

        expect(nextSpy).toBeCalledWith([1, 2, 3, 4, 5]);

        nextSpy.mockReset();

        paginator.page.next({pageSize: 5, pageIndex: 1});

        expect(nextSpy).toBeCalledWith([6, 7, 8, 9, 10]);

      }));

      it('should return the data paged to multiple connections', () => {

        const source = new StaticDataSource<any[]>([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], {id: 'static'});

        paginator.pageSize = 5;

        dataSource = new PaginationDataSource<any>(source as any, matPaginator);

        const connection1 = dataSource.connect({id: 'test1'});
        const connection2 = dataSource.connect({id: 'test2'});
        const connection3 = dataSource.connect({id: 'test3'});

        const nextSpy1 = jest.fn();
        const nextSpy2 = jest.fn();
        const nextSpy3 = jest.fn();

        connection1.subscribe(nextSpy1);

        expect(nextSpy1).toBeCalledWith([1, 2, 3, 4, 5]);
        nextSpy1.mockReset();

        paginator.next();

        expect(nextSpy1).toBeCalledWith([6, 7, 8, 9, 10]);

        connection2.subscribe(nextSpy2);
        expect(nextSpy2).toBeCalledWith([6, 7, 8, 9, 10]);

        nextSpy1.mockReset();
        nextSpy2.mockReset();

        paginator.next();

        connection3.subscribe(nextSpy3);
        expect(nextSpy1).toBeCalledWith([11, 12, 13, 14, 15]);
        expect(nextSpy2).toBeCalledWith([11, 12, 13, 14, 15]);
        expect(nextSpy3).toBeCalledWith([11, 12, 13, 14, 15]);

      });

      it('should update the paginator length', () => {

        const data = new Subject<any[]>();

        const source = new StaticDataSource<any[]>(data, {id: 'static'});

        paginator.pageSize = 5;

        dataSource = new PaginationDataSource<any>(source as any, matPaginator);

        const connection = dataSource.connect({id: 'test'});

        connection.subscribe();

        data.next([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);

        expect(paginator.length).toEqual(20);

        data.next([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

        expect(paginator.length).toEqual(10);

      });

      it('should disconnect from source data source when the data source disconnect', () => {

        const source = new StaticDataSource<any[]>([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], {id: 'static'});

        paginator.pageSize = 5;

        dataSource = new PaginationDataSource<any>(source as any, matPaginator);

        const connection = dataSource.connect({id: 'test'});

        const disconnectSpy = jest.spyOn(source, 'disconnect');

        dataSource.disconnect({id: 'test'});

        expect(disconnectSpy).toBeCalled();

      });

    });

  });

});
