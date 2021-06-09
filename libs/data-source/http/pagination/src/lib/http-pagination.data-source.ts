import {
  RXAP_PAGINATION_DATA_SOURCE,
  RXAP_PAGINATION_DATA_SOURCE_PAGINATOR,
  AbstractPaginationDataSource,
  PageEvent,
  PaginatorLike,
  AbstractPaginationDataSourceMetadata,
  RxapAbstractPaginationDataSource,
} from '@rxap/data-source/pagination';
import { Injectable, Inject, Optional } from '@angular/core';
import type { HttpDataSource } from '@rxap/data-source/http';
import {
  HttpDataSourceOptions,
  HttpDataSourceViewer,
} from '@rxap/data-source/http';
import {
  RXAP_DATA_SOURCE_METADATA,
  BaseDataSourceViewer,
} from '@rxap/data-source';
import { Observable, TeardownLogic, EMPTY } from 'rxjs';
import { tap, startWith, map, filter } from 'rxjs/operators';
import { RxapHttpPaginationDataSourceError } from './error';
import { Constructor } from '@rxap/utilities';
import { RXAP_HTTP_PAGINATION_DATA_SOURCE_TO_OPTIONS_FUNCTION } from './tokens';

export interface PaginationData<Data = any> {
  /**
   * The paged data
   */
  data: Data[];

  /**
   * The page item count
   */
  size?: number;

  /**
   * The page index
   */
  page?: number;

  /**
   * The total number of items
   */
  total: number;
}

export interface HttpPaginationDataSourceViewer extends BaseDataSourceViewer {
  readonly viewChange: Observable<PageEvent>;
}

export interface HttpPaginationDataSourceMetadata
  extends AbstractPaginationDataSourceMetadata {}

export type PageEventToHttpOptionsFunction = (
  event: PageEvent
) => HttpDataSourceOptions;

@Injectable()
export class HttpPaginationDataSource<
  Data
> extends AbstractPaginationDataSource<Data> {
  constructor(
    @Inject(RXAP_PAGINATION_DATA_SOURCE)
    private readonly dataSource: HttpDataSource<PaginationData<Data>>,
    @Optional()
    @Inject(RXAP_PAGINATION_DATA_SOURCE_PAGINATOR)
    paginator: PaginatorLike | null = null,
    @Optional()
    @Inject(RXAP_HTTP_PAGINATION_DATA_SOURCE_TO_OPTIONS_FUNCTION)
    pageEventToHttpOptions: any | null = null,
    @Optional()
    @Inject(RXAP_DATA_SOURCE_METADATA)
    metadata: HttpPaginationDataSourceMetadata = dataSource.metadata
  ) {
    super(paginator, metadata);
  }

  public pageEventToHttpOptions(event: PageEvent): HttpDataSourceOptions {
    throw new RxapHttpPaginationDataSourceError(
      'The PageEventToHttpOptionsFunction is not defined',
      ''
    );
  }

  protected _connect(
    viewer: HttpDataSourceViewer
  ): [Observable<Data[]>, TeardownLogic] {
    this.assertPaginator();

    if (viewer.viewChange && viewer.viewChange !== EMPTY) {
      console.warn('The viewChange property is readonly');
    }

    if (this.paginator === undefined || this.paginator.page === undefined) {
      throw new RxapHttpPaginationDataSourceError(
        'The paginator instance has not a page property',
        ''
      );
    }

    viewer.viewChange = this.paginator.page.pipe(
      startWith({
        pageIndex: this.paginator.pageIndex,
        pageSize: this.paginator.pageSize,
        length: this.paginator.length,
      } as PageEvent),
      tap((page) => {
        if (typeof page.pageSize !== 'number') {
          console.warn('The page size is not defined!');
        }
      }),
      filter((page) => typeof page.pageSize === 'number'),
      map((page) => this.pageEventToHttpOptions(page))
    );

    return [
      this.dataSource.connect(viewer).pipe(
        tap((paginationData) => {
          if (typeof paginationData !== 'object') {
            throw new RxapHttpPaginationDataSourceError(
              'The http data source does not return a PaginationData object. Value is not an object',
              ''
            );
          }
          if (!paginationData.hasOwnProperty('total')) {
            throw new RxapHttpPaginationDataSourceError(
              'The http data source does not return a PaginationData object. Object has not the property total',
              ''
            );
          }
          if (
            !paginationData.hasOwnProperty('data') &&
            !Array.isArray(paginationData.data)
          ) {
            throw new RxapHttpPaginationDataSourceError(
              'The http data source does not return a PaginationData object. Object has not the property data' +
                ' property of the value not an array',
              ''
            );
          }
          if (
            paginationData.size !== undefined &&
            paginationData.size !== this.paginator!.pageSize
          ) {
            console.warn(
              'The selected page size from the paginator is not equal to the page size from the PaginationData object'
            );
          }
          if (
            paginationData.page !== undefined &&
            paginationData.page !== this.paginator!.pageIndex
          ) {
            console.warn(
              'The selected page index from the paginator is not equal to the page index from the PaginationData object'
            );
          }
        }),
        tap((paginationData) => this.updateTotalLength(paginationData.total)),
        map((paginationData) => paginationData.data)
      ),
      () => this.dataSource.disconnect(viewer),
    ];
  }
}

export function RxapHttpPaginationDataSource<Data>(
  metadata: HttpPaginationDataSourceMetadata,
  className: string = 'HttpPaginationDataSource',
  packageName: string = '@rxap/data-source/http/pagination'
) {
  return function (target: Constructor<HttpPaginationDataSource<Data>>) {
    RxapAbstractPaginationDataSource(metadata, className, packageName)(target);
  };
}
