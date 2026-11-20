import {
  AbstractTableDataSource,
  AbstractTableDataSourceMetadata,
  FilterLike,
  RxapAbstractTableDataSource,
  SortLike,
} from './abstract-table.data-source';
import { Injectable, inject } from '@angular/core';
import {
  RXAP_TABLE_DATA_SOURCE,
  RXAP_TABLE_DATA_SOURCE_FILTER,
  RXAP_TABLE_DATA_SOURCE_PAGINATOR,
  RXAP_TABLE_DATA_SOURCE_PARAMETERS,
  RXAP_TABLE_DATA_SOURCE_SORT,
} from './tokens';
import { PaginatorLike } from '@rxap/data-source/pagination';
import {
  BaseDataSource,
  BaseDataSourceViewer,
  RXAP_DATA_SOURCE_METADATA,
} from '@rxap/data-source';
import {
  combineLatest,
  Observable,
  of,
  TeardownLogic,
} from 'rxjs';
import {
  map,
  startWith,
  switchMap,
  tap,
} from 'rxjs/operators';
import { Constructor } from '@rxap/utilities';

export type TableDataSourceMetadata = AbstractTableDataSourceMetadata

@Injectable()
export class TableDataSource<
  Data extends Record<any, any>,
  Parameters = any
> extends AbstractTableDataSource<Data> {
  private readonly dataSource = inject<BaseDataSource<Data[]>>(RXAP_TABLE_DATA_SOURCE);

  constructor() {
    const paginator = inject<PaginatorLike | null>(RXAP_TABLE_DATA_SOURCE_PAGINATOR, { optional: true }) ?? null;
    const sort = inject<SortLike | null>(RXAP_TABLE_DATA_SOURCE_SORT, { optional: true }) ?? null;
    const filter = inject<FilterLike | null>(RXAP_TABLE_DATA_SOURCE_FILTER, { optional: true }) ?? null;
    const parameters = inject<Observable<Parameters> | null>(RXAP_TABLE_DATA_SOURCE_PARAMETERS, { optional: true }) ?? null;
    const metadata = inject<TableDataSourceMetadata | null>(RXAP_DATA_SOURCE_METADATA, { optional: true }) ?? dataSource.metadata;

    super(paginator, sort, filter, parameters, metadata);
  
    const dataSource = this.dataSource;
  }

  public override refresh(): any {
    this.dataSource.refresh();
  }

  protected override _connect(
    viewer: BaseDataSourceViewer,
  ): [ Observable<Data[]>, TeardownLogic ] {
    return [
      this.dataSource.connect(viewer).pipe(
        tap((data) => this.updateTotalLength(data.length)),
        tap(() => this.loading$.disable()),
        switchMap((data) => {
          this.assertPaginator();

          if (this.paginator && this.paginator.page) {
            return combineLatest([
              this.paginator.page.pipe(
                startWith({
                  pageIndex: this.paginator.pageIndex,
                  pageSize: this.paginator.pageSize,
                  length: this.paginator.length,
                }),
              ),
              this.sort?.sortChange?.pipe(
                startWith({
                  active: this.sort?.active,
                  direction: this.sort?.direction,
                }),
              ) ?? of(null),
              this.filter?.change.pipe(startWith({})) ?? of(null),
            ]).pipe(
              map(([ page, sort, filter ]) => {
                let filteredData = data;

                if (filter) {
                  filteredData = this.applyFilterBy(filteredData, filter);
                }

                let sortData = filteredData;

                if (sort) {
                  sortData = this.applySortBy(
                    sortData,
                    sort.active,
                    sort.direction,
                  );
                }

                return this.applyPagination(
                  sortData,
                  page.pageSize,
                  page.pageIndex,
                );
              }),
            );
          }

          throw new Error('The paginator have not a defined page property!');
        }),
      ),
      () => this.dataSource.disconnect(viewer),
    ];
  }
}

export function RxapTableDataSource(
  metadataOrId: string | TableDataSourceMetadata,
  className = 'TableDataSource',
  packageName = '@rxap/data-source/table',
) {
  return function (target: Constructor<TableDataSource<any>>) {
    RxapAbstractTableDataSource(metadataOrId, className, packageName)(target);
  };
}
