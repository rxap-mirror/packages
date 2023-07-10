import {
  AbstractTableDataSource,
  AbstractTableDataSourceMetadata,
  FilterLike,
  RXAP_TABLE_DATA_SOURCE,
  RXAP_TABLE_DATA_SOURCE_FILTER,
  RXAP_TABLE_DATA_SOURCE_PAGINATOR,
  RXAP_TABLE_DATA_SOURCE_PARAMETERS,
  RXAP_TABLE_DATA_SOURCE_SORT,
  RxapAbstractTableDataSource,
  SortLike,
  TableEvent,
} from '@rxap/data-source/table';
import {
  Inject,
  Injectable,
  Optional,
} from '@angular/core';
import {
  BaseDataSourceViewer,
  RXAP_DATA_SOURCE_METADATA,
} from '@rxap/data-source';
import { PaginatorLike } from '@rxap/data-source/pagination';
import {
  PaginationData,
  RxapHttpPaginationDataSourceError,
} from '@rxap/data-source/http/pagination';
import {
  combineLatest,
  EMPTY,
  isObservable,
  Observable,
  of,
  TeardownLogic,
} from 'rxjs';
import { RxapHttpTableDataSourceError } from './error';
import {
  filter as rxjsFilter,
  map,
  startWith,
  switchMap,
  tap,
} from 'rxjs/operators';
import type { HttpDataSource } from '@rxap/data-source/http';
import {
  HttpDataSourceOptions,
  HttpDataSourceViewer,
} from '@rxap/data-source/http';
import { RXAP_HTTP_TABLE_DATA_SOURCE_TO_OPTIONS_FUNCTION } from './tokens';
import {
  Constructor,
  isPromise,
} from '@rxap/utilities';

export interface HttpTableDataSourceViewer extends BaseDataSourceViewer {
  readonly viewChange: Observable<TableEvent>;
}

export type HttpTableDataSourceMetadata = AbstractTableDataSourceMetadata

export type TableEventToHttpOptionsFunction = (
  event: TableEvent,
) =>
  | HttpDataSourceOptions
  | Observable<HttpDataSourceOptions>
  | Promise<HttpDataSourceOptions>;

@Injectable()
export class HttpTableDataSource<
  Data extends Record<any, any>,
  Parameters = any
> extends AbstractTableDataSource<Data> {
  constructor(
    @Inject(RXAP_TABLE_DATA_SOURCE)
    private readonly dataSource: HttpDataSource<PaginationData<Data>>,
    @Optional()
    @Inject(RXAP_TABLE_DATA_SOURCE_PAGINATOR)
      paginator: PaginatorLike | null = null,
    @Optional()
    @Inject(RXAP_HTTP_TABLE_DATA_SOURCE_TO_OPTIONS_FUNCTION)
      tableEventToHttpOptions: any | null = null,
    @Optional()
    @Inject(RXAP_TABLE_DATA_SOURCE_SORT)
      sort: SortLike | null = null,
    @Optional()
    @Inject(RXAP_TABLE_DATA_SOURCE_FILTER)
      filter: FilterLike | null = null,
    @Optional()
    @Inject(RXAP_TABLE_DATA_SOURCE_PARAMETERS)
      parameters: Observable<Parameters> | null = null,
    @Optional()
    @Inject(RXAP_DATA_SOURCE_METADATA)
      metadata: HttpTableDataSourceMetadata | null = dataSource.metadata,
  ) {
    super(paginator, sort, filter, parameters, metadata);
    if (tableEventToHttpOptions) {
      this.tableEventToHttpOptions = tableEventToHttpOptions;
    }
  }

  public tableEventToHttpOptions(
    event: TableEvent,
  ):
    | HttpDataSourceOptions
    | Observable<HttpDataSourceOptions>
    | Promise<HttpDataSourceOptions> {
    throw new RxapHttpTableDataSourceError(
      'The TableEventToHttpOptionsFunction is not defined',
      '',
    );
  }

  protected override _connect(
    viewer: HttpDataSourceViewer,
  ): [Observable<Data[]>, TeardownLogic] {
    this.assertPaginator();

    if (viewer.viewChange && viewer.viewChange !== EMPTY) {
      console.warn('The viewChange property is readonly');
    }

    if (this.paginator === undefined || this.paginator.page === undefined) {
      throw new RxapHttpTableDataSourceError(
        'The paginator instance has not a page property',
        '',
      );
    }

    viewer.viewChange = combineLatest([
      this.paginator.page.pipe(
        startWith({
          pageIndex: this.paginator.pageIndex,
          pageSize: this.paginator.pageSize,
          length: this.paginator.length,
        }),
        tap((page) => {
          if (typeof page.pageSize !== 'number') {
            console.warn('The page size is not defined!');
          }
        }),
        rxjsFilter((page) => typeof page.pageSize === 'number'),
      ),
      this.sort?.sortChange?.pipe(
        startWith({
          active: this.sort?.active,
          direction: this.sort?.direction,
        }),
      ) ?? of(null),
      this.filter?.change ?? of(null),
    ]).pipe(
      map(([page, sort, filter]) => ({page, sort, filter})),
      switchMap((event) => {
        const options = this.tableEventToHttpOptions(event);
        if (isPromise(options) || isObservable(options)) {
          return options;
        }
        return of(options);
      }),
    );

    return [
      this.dataSource.connect(viewer).pipe(
        tap((paginationData) => {
          if (typeof paginationData !== 'object') {
            throw new RxapHttpPaginationDataSourceError(
              'The http data source does not return a PaginationData object. Value is not an object',
              '',
            );
          }
          if (paginationData['total'] === undefined || paginationData['total'] === null) {
            throw new RxapHttpPaginationDataSourceError(
              'The http data source does not return a PaginationData object. Object has not the property total',
              '',
            );
          }
          if (
            !paginationData['data'] &&
            !Array.isArray(paginationData['data'])
          ) {
            throw new RxapHttpPaginationDataSourceError(
              'The http data source does not return a PaginationData object. Object has not the property data' +
              ' property of the value not an array',
              '',
            );
          }
          if (
            paginationData['size'] !== undefined &&
            paginationData['size'] !== this.paginator!.pageSize
          ) {
            console.warn(
              'The selected page size from the paginator is not equal to the page size from the PaginationData object',
            );
          }
          if (
            paginationData.page !== undefined &&
            paginationData.page !== this.paginator!.pageIndex
          ) {
            console.warn(
              'The selected page index from the paginator is not equal to the page index from the PaginationData object',
            );
          }
        }),
        tap((paginationData) => this.updateTotalLength(paginationData.total)),
        map((paginationData) => paginationData.data),
      ),
      () => this.dataSource.disconnect(viewer),
    ];
  }
}

export function RxapHttpTableDataSource<Data extends Record<any, any>>(
  metadata: HttpTableDataSourceMetadata,
  className = 'HttpTableDataSource',
  packageName = '@rxap/data-source/http/table',
) {
  return function (target: Constructor<HttpTableDataSource<Data>>) {
    RxapAbstractTableDataSource(metadata, className, packageName)(target);
  };
}
