import {
  HttpClient,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
  TestRequest,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import {
  RXAP_TABLE_DATA_SOURCE,
  RXAP_TABLE_DATA_SOURCE_PAGINATOR,
} from '@rxap/data-source/table';
import { PaginatorFake } from '@rxap/data-source/testing';
import { OpenApiConfigService } from '@rxap/open-api';
import { OpenApiDataSource } from '@rxap/open-api/data-source';
import {
  BehaviorSubject,
  EMPTY,
  firstValueFrom,
  of,
  Subject,
} from 'rxjs';
import { RxapOpenApiDataSourceTableError } from './error';
import {
  OpenApiTableDataSource,
  RxapOpenApiTableDataSource,
  TableEvent,
} from './open-api-table.data-source';
import { RXAP_OPEN_API_TABLE_DATA_SOURCE_TO_PARAMETERS_FUNCTION } from './tokens';
import { ToOpenApiTableDataSourcePipe } from './to-open-api-table-data-source.pipe';

const SERVER_URL = 'https://server.de/api';
const PAGE_URL = `${ SERVER_URL }/users`;

function createConfig(): any {
  const query = (name: string, type = 'string') => ({
    name,
    in: 'query',
    required: false,
    schema: { type },
  });
  return {
    openapi: '3.0.0',
    info: {
      title: 'Testing',
      version: '1',
    },
    servers: [ { url: SERVER_URL } ],
    paths: {
      '/users': {
        get: {
          operationId: 'getUserPage',
          parameters: [
            query('page', 'number'),
            query('size', 'number'),
            query('sortBy'),
            query('direction'),
            query('filter'),
            query('search'),
          ],
          responses: { 200: { description: 'ok' } },
        },
      },
    },
  };
}

describe('@rxap/open-api/data-source/table', () => {

  describe('OpenApiTableDataSource', () => {

    let httpMock: HttpTestingController;
    let http: HttpClient;
    let openApiService: OpenApiConfigService;
    let warn: ReturnType<typeof vi.spyOn>;

    function createDataSource(): OpenApiDataSource<any> {
      return new OpenApiDataSource(http, openApiService, { id: 'getUserPage' } as any);
    }

    function expectPageRequest(): TestRequest {
      return httpMock.expectOne(request => request.url === PAGE_URL);
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

    describe('tableEventToOpenApiParameters', () => {

      it('should map the table event to the page parameters', () => {
        const tableDataSource = new OpenApiTableDataSource(createDataSource(), new PaginatorFake(10, 0, 0));
        const event: TableEvent = {
          page: {
            pageIndex: 3,
            pageSize: 25,
          },
          sort: {
            active: 'name',
            direction: 'desc',
          },
          filter: { name: 'john' },
        };

        expect(tableDataSource.tableEventToOpenApiParameters(event)).toEqual({
          page: 3,
          size: 25,
          sortBy: 'name',
          direction: 'desc',
          filter: { name: 'john' },
        });
      });

      it('should handle a missing sort', () => {
        const tableDataSource = new OpenApiTableDataSource(createDataSource(), new PaginatorFake(10, 0, 0));

        expect(tableDataSource.tableEventToOpenApiParameters({
          page: {
            pageIndex: 0,
            pageSize: 10,
          },
          sort: null,
          filter: null,
        })).toEqual({
          page: 0,
          size: 10,
          sortBy: undefined,
          direction: undefined,
          filter: null,
        });
      });

      it('should use the injected to parameters function', () => {
        const toParameters = vi.fn().mockReturnValue({ search: 'custom' });
        const tableDataSource = new OpenApiTableDataSource(
          createDataSource(),
          new PaginatorFake(10, 0, 0),
          toParameters,
        );
        const event: TableEvent = {
          page: {
            pageIndex: 0,
            pageSize: 10,
          },
          sort: null,
          filter: null,
        };

        expect(tableDataSource.tableEventToOpenApiParameters(event)).toEqual({ search: 'custom' });
        expect(toParameters).toHaveBeenCalledWith(event);
      });

      it('should be constructed by the injector', () => {
        const paginator = new PaginatorFake(5, 0, 0);
        const dataSource = createDataSource();
        const toParameters = () => ({ search: 'injected' });
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
          providers: [
            provideHttpClient(withInterceptorsFromDi()),
            provideHttpClientTesting(),
            {
              provide: RXAP_TABLE_DATA_SOURCE,
              useValue: dataSource,
            },
            {
              provide: RXAP_TABLE_DATA_SOURCE_PAGINATOR,
              useValue: paginator,
            },
            {
              provide: RXAP_OPEN_API_TABLE_DATA_SOURCE_TO_PARAMETERS_FUNCTION,
              useValue: toParameters,
            },
            OpenApiTableDataSource,
          ],
        });

        const tableDataSource = TestBed.inject(OpenApiTableDataSource);

        expect(tableDataSource.paginator).toBe(paginator);
        expect(tableDataSource.id).toBe('getUserPage');
        expect(tableDataSource.tableEventToOpenApiParameters({} as any)).toEqual({ search: 'injected' });
      });

    });

    describe('connect', () => {

      it('should load the first page with the default parameters and emit the page data', () => {
        const paginator = new PaginatorFake(2, 0, 0);
        const tableDataSource = new OpenApiTableDataSource(createDataSource(), paginator);
        const nextSpy = vi.fn();

        tableDataSource.connect({ id: 'test' }).subscribe(nextSpy);

        const request = expectPageRequest();
        expect(request.request.method).toBe('GET');
        expect(request.request.params.get('page')).toBe('0');
        expect(request.request.params.get('size')).toBe('2');
        request.flush({
          total: 5,
          data: [ { id: 1 }, { id: 2 } ],
          size: 2,
          page: 0,
        });

        expect(nextSpy).toHaveBeenCalledTimes(1);
        expect(nextSpy).toHaveBeenCalledWith([ { id: 1 }, { id: 2 } ]);
        expect(paginator.length).toBe(5);
        expect(tableDataSource.totalLength).toBe(5);
      });

      it('should request a new page if the paginator changes the page', () => {
        const paginator = new PaginatorFake(2, 0, 0);
        const tableDataSource = new OpenApiTableDataSource(createDataSource(), paginator);
        const nextSpy = vi.fn();

        tableDataSource.connect({ id: 'test' }).subscribe(nextSpy);
        expectPageRequest().flush({
          total: 4,
          data: [ { id: 1 }, { id: 2 } ],
        });

        paginator.next();

        const request = expectPageRequest();
        expect(request.request.params.get('page')).toBe('1');
        request.flush({
          total: 4,
          data: [ { id: 3 }, { id: 4 } ],
        });

        expect(nextSpy).toHaveBeenCalledTimes(2);
        expect(nextSpy).toHaveBeenLastCalledWith([ { id: 3 }, { id: 4 } ]);
        expect(paginator.length).toBe(4);
      });

      it('should react to sort and filter changes', () => {
        const paginator = new PaginatorFake(10, 0, 0);
        const sortChange = new Subject<any>();
        const filterChange = new BehaviorSubject<any>({ search: 'a' });
        const toParameters = (event: TableEvent) => ({
          sortBy: event.sort?.active,
          direction: event.sort?.direction,
          search: (event.filter as any)?.search,
        });
        const tableDataSource = new OpenApiTableDataSource(
          createDataSource(),
          paginator,
          toParameters,
          {
            active: 'id',
            direction: 'asc',
            start: 'asc',
            sortChange,
          },
          {
            change: filterChange,
            current: { search: 'a' },
          },
        );
        const nextSpy = vi.fn();

        tableDataSource.connect({ id: 'test' }).subscribe(nextSpy);

        let request = expectPageRequest();
        expect(request.request.params.get('sortBy')).toBe('id');
        expect(request.request.params.get('direction')).toBe('asc');
        expect(request.request.params.get('search')).toBe('a');
        request.flush({
          total: 1,
          data: [ { id: 1 } ],
        });

        sortChange.next({
          active: 'name',
          direction: 'desc',
        });
        request = expectPageRequest();
        expect(request.request.params.get('sortBy')).toBe('name');
        expect(request.request.params.get('direction')).toBe('desc');
        request.flush({
          total: 1,
          data: [ { id: 2 } ],
        });

        filterChange.next({ search: 'b' });
        request = expectPageRequest();
        expect(request.request.params.get('search')).toBe('b');
        request.flush({
          total: 1,
          data: [ { id: 3 } ],
        });

        expect(nextSpy).toHaveBeenCalledTimes(3);
        expect(nextSpy).toHaveBeenLastCalledWith([ { id: 3 } ]);
      });

      it('should support a to parameters function returning a promise', async () => {
        const paginator = new PaginatorFake(2, 0, 0);
        const tableDataSource = new OpenApiTableDataSource(
          createDataSource(),
          paginator,
          () => Promise.resolve({ search: 'async' }),
        );
        const nextSpy = vi.fn();

        tableDataSource.connect({ id: 'test' }).subscribe(nextSpy);
        const request = await vi.waitFor(() => expectPageRequest());
        expect(request.request.params.get('search')).toBe('async');
        request.flush({
          total: 1,
          data: [ { id: 1 } ],
        });

        expect(nextSpy).toHaveBeenCalledWith([ { id: 1 } ]);
      });

      it('should support a to parameters function returning an observable', () => {
        const paginator = new PaginatorFake(2, 0, 0);
        const tableDataSource = new OpenApiTableDataSource(
          createDataSource(),
          paginator,
          () => of({ search: 'observable' }),
        );
        const nextSpy = vi.fn();

        tableDataSource.connect({ id: 'test' }).subscribe(nextSpy);
        const request = expectPageRequest();
        expect(request.request.params.get('search')).toBe('observable');
        request.flush({
          total: 1,
          data: [ { id: 1 } ],
        });

        expect(nextSpy).toHaveBeenCalledWith([ { id: 1 } ]);
      });

      it('should warn if a view change is provided because it is overwritten', () => {
        const paginator = new PaginatorFake(2, 0, 0);
        const tableDataSource = new OpenApiTableDataSource(createDataSource(), paginator);

        tableDataSource.connect({
          id: 'test',
          viewChange: new Subject<any>(),
        } as any).subscribe();

        expect(warn).toHaveBeenCalledWith('The viewChange property is readonly');
        expectPageRequest().flush({
          total: 0,
          data: [],
        });
      });

      it('should not warn for an EMPTY view change', () => {
        const paginator = new PaginatorFake(2, 0, 0);
        const tableDataSource = new OpenApiTableDataSource(createDataSource(), paginator);

        tableDataSource.connect({
          id: 'test',
          viewChange: EMPTY,
        } as any).subscribe();

        expect(warn).not.toHaveBeenCalledWith('The viewChange property is readonly');
        expectPageRequest().flush({
          total: 0,
          data: [],
        });
      });

      it('should ignore page events without a page size', () => {
        const paginator = new PaginatorFake(2, 0, 0);
        const tableDataSource = new OpenApiTableDataSource(createDataSource(), paginator);

        tableDataSource.connect({ id: 'test' }).subscribe();
        expectPageRequest().flush({
          total: 0,
          data: [],
        });

        paginator.page.next({
          pageIndex: 1,
          pageSize: undefined as any,
        });

        expect(warn).toHaveBeenCalledWith('The page size is not defined!');
        httpMock.expectNone(request => request.url === PAGE_URL);
      });

      it('should warn if the page size or page index of the response differs from the paginator', () => {
        const paginator = new PaginatorFake(2, 0, 0);
        const tableDataSource = new OpenApiTableDataSource(createDataSource(), paginator);

        tableDataSource.connect({ id: 'test' }).subscribe();
        expectPageRequest().flush({
          total: 10,
          data: [ { id: 1 } ],
          size: 5,
          page: 3,
        });

        expect(warn).toHaveBeenCalledWith(
          'The selected page size from the paginator is not equal to the page size from the PaginationData object',
        );
        expect(warn).toHaveBeenCalledWith(
          'The selected page index from the paginator is not equal to the page index from the PaginationData object',
        );
      });

      it('should disconnect the open api data source if the viewer disconnects', () => {
        const dataSource = createDataSource();
        const disconnect = vi.spyOn(dataSource, 'disconnect');
        const paginator = new PaginatorFake(2, 0, 0);
        const tableDataSource = new OpenApiTableDataSource(dataSource, paginator);
        const viewer = { id: 'test' };

        tableDataSource.connect(viewer).subscribe();
        expectPageRequest().flush({
          total: 0,
          data: [],
        });

        tableDataSource.disconnect(viewer);

        expect(disconnect).toHaveBeenCalledWith(viewer);
        expect(tableDataSource.isConnected(viewer)).toBe(false);
      });

      describe('invalid configuration', () => {

        it('should throw if no paginator is defined', () => {
          const tableDataSource = new OpenApiTableDataSource(createDataSource());

          expect(() => tableDataSource.connect({ id: 'test' })).toThrow('The paginator instance is not defined!');
        });

        it('should throw if the paginator has no page property', () => {
          const tableDataSource = new OpenApiTableDataSource(createDataSource(), {
            pageSize: 10,
            pageIndex: 0,
            length: 0,
          });

          expect(() => tableDataSource.connect({ id: 'test' })).toThrow(RxapOpenApiDataSourceTableError);
          expect(() => tableDataSource.connect({ id: 'test2' }))
            .toThrow('The paginator instance has not a page property');
        });

      });

      describe('invalid response', () => {

        async function responseError(body: any): Promise<Error> {
          const paginator = new PaginatorFake(2, 0, 0);
          const tableDataSource = new OpenApiTableDataSource(createDataSource(), paginator);
          const errorPromise: Promise<Error> = firstValueFrom(tableDataSource.connect({ id: 'test' })).then(() => new Error('no error'), (e: Error) => e);

          expectPageRequest().flush(body);

          return errorPromise;
        }

        it('should fail if the response is not an object', async () => {
          const error = await responseError('text');

          expect(error).toBeInstanceOf(RxapOpenApiDataSourceTableError);
          expect(error.message).toContain('Value is not an object');
        });

        it('should fail if the response has no total', async () => {
          const error = await responseError({ data: [] });

          expect(error).toBeInstanceOf(RxapOpenApiDataSourceTableError);
          expect(error.message).toContain('Object has not the property total');
        });

        it('should fail if the response has no data', async () => {
          const error = await responseError({ total: 1 });

          expect(error).toBeInstanceOf(RxapOpenApiDataSourceTableError);
          expect(error.message).toContain('Object has not the property data');
        });

      });

    });

    describe('decorator', () => {

      it('should apply the metadata to the table data source', () => {
        @RxapOpenApiTableDataSource({ id: 'decorated-table' })
        class DecoratedTableDataSource extends OpenApiTableDataSource {
        }

        const tableDataSource = new DecoratedTableDataSource(createDataSource(), new PaginatorFake(2, 0, 0));

        expect(tableDataSource.getMetadata()!.id).toBe('decorated-table');
      });

    });

    describe('ToOpenApiTableDataSourcePipe', () => {

      it('should create an open api table data source', () => {
        const pipe = new ToOpenApiTableDataSourcePipe();
        const paginator = new PaginatorFake(2, 0, 0);
        const toParameters = () => ({ search: 'pipe' });

        const tableDataSource = pipe.transform(createDataSource(), paginator, toParameters);

        expect(tableDataSource).toBeInstanceOf(OpenApiTableDataSource);
        expect(tableDataSource.paginator).toBe(paginator);
        expect(tableDataSource.tableEventToOpenApiParameters({} as any)).toEqual({ search: 'pipe' });
      });

      it('should pass the sort and filter to the table data source', () => {
        const pipe = new ToOpenApiTableDataSourcePipe();
        const sort = {
          active: 'name',
          direction: 'asc' as const,
          start: 'asc' as const,
        };
        const filter = {
          change: of({}),
          current: {},
        };

        const tableDataSource = pipe.transform(createDataSource(), new PaginatorFake(2, 0, 0), undefined, sort, filter);

        expect(tableDataSource.sort).toBe(sort);
        expect(tableDataSource.filter).toBe(filter);
      });

    });

  });

});
