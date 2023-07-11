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
  Sort,
  SortLike,
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
import {
  PageEvent,
  PaginatorLike,
} from '@rxap/data-source/pagination';
import { PaginationData } from '@rxap/data-source/http/pagination';
import {
  combineLatest,
  EMPTY,
  isObservable,
  Observable,
  of,
  TeardownLogic,
} from 'rxjs';
import { RxapOpenApiDataSourceTableError } from './error';
import {
  filter as rxjsFilter,
  map,
  startWith,
  switchMap,
  tap,
} from 'rxjs/operators';
import { RXAP_OPEN_API_TABLE_DATA_SOURCE_TO_PARAMETERS_FUNCTION } from './tokens';
import {
  Constructor,
  isPromise,
} from '@rxap/utilities';
import type { OpenApiDataSource } from '@rxap/open-api/data-source';
import { OpenApiDataSourceViewer } from '@rxap/open-api/data-source';

export interface TableEvent {
  page: PageEvent;
  sort: Sort | null;
  filter: Record<string, any> | string | null;
}

export interface OpenApiTableDataSourceViewer extends BaseDataSourceViewer {
  readonly viewChange: Observable<TableEvent>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface OpenApiTableDataSourceMetadata
  extends AbstractTableDataSourceMetadata {}

export type TableEventToOpenApiParametersFunction<
  Parameters extends Record<string, any>
> = (
  event: TableEvent,
) => Parameters | Observable<Parameters> | Promise<Parameters>;

@Injectable()
export class OpenApiTableDataSource<
  Data extends object = any,
  Parameters extends Record<string, any> = any
> extends AbstractTableDataSource<Data> {
  constructor(
    @Inject(RXAP_TABLE_DATA_SOURCE)
    private readonly dataSource: OpenApiDataSource<PaginationData<Data>>,
    @Optional()
    @Inject(RXAP_TABLE_DATA_SOURCE_PAGINATOR)
      paginator: PaginatorLike | null = null,
    @Optional()
    @Inject(RXAP_OPEN_API_TABLE_DATA_SOURCE_TO_PARAMETERS_FUNCTION)
      tableEventToOpenApiParameters: any | null = null,
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
      metadata: OpenApiTableDataSourceMetadata | null = dataSource.metadata,
  ) {
    super(paginator, sort, filter, parameters, metadata);
    if (tableEventToOpenApiParameters) {
      this.tableEventToOpenApiParameters = tableEventToOpenApiParameters;
    }
  }

  public tableEventToOpenApiParameters(
    event: TableEvent,
  ): Parameters | Observable<Parameters> | Promise<Parameters> {
    return {
      page: event.page.pageIndex,
      size: event.page.pageSize,
      sortBy: event.sort?.active,
      direction: event.sort?.direction,
      filter: event.filter,
    } as any;
  }

  protected override _connect(
    viewer: OpenApiDataSourceViewer,
  ): [ Observable<Data[]>, TeardownLogic ] {
    this.assertPaginator();

    if (viewer.viewChange && viewer.viewChange !== EMPTY) {
      console.warn('The viewChange property is readonly');
    }

    if (this.paginator === undefined || this.paginator.page === undefined) {
      throw new RxapOpenApiDataSourceTableError(
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
      map(([ page, sort, filter ]) => ({
        page,
        sort,
        filter,
      })),
      switchMap((event) => {
        const options = this.tableEventToOpenApiParameters(event);
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
            throw new RxapOpenApiDataSourceTableError(
              'The open api data source does not return a PaginationData object. Value is not an object',
              '',
            );
          }
          if (!paginationData.hasOwnProperty('total')) {
            throw new RxapOpenApiDataSourceTableError(
              'The open api data source does not return a PaginationData object. Object has not the property total',
              '',
            );
          }
          if (
            !paginationData.hasOwnProperty('data') &&
            !Array.isArray(paginationData.data)
          ) {
            throw new RxapOpenApiDataSourceTableError(
              'The open api data source does not return a PaginationData object. Object has not the property data' +
              ' property of the value not an array',
              '',
            );
          }
          if (
            paginationData.size !== undefined &&
            paginationData.size !== this.paginator!.pageSize
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

export function RxapOpenApiTableDataSource<
  Data extends object,
  Parameters extends Record<string, any>
>(
  metadata: OpenApiTableDataSourceMetadata,
  className = 'OpenApiTableDataSource',
  packageName = '@rxap/open-api/data-source/table',
) {
  return function (
    target: Constructor<OpenApiTableDataSource<Data, Parameters>>,
  ) {
    RxapAbstractTableDataSource(metadata, className, packageName)(target);
  };
}
