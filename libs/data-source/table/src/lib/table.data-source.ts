import {
  AbstractTableDataSource,
  SortLike,
  FilterLike,
  AbstractTableDataSourceMetadata,
  RxapAbstractTableDataSource
} from './abstract-table.data-source';
import {
  Optional,
  Inject,
  Injectable
} from '@angular/core';
import {
  RXAP_TABLE_DATA_SOURCE_PAGINATOR,
  RXAP_TABLE_DATA_SOURCE_SORT,
  RXAP_TABLE_DATA_SOURCE_FILTER,
  RXAP_TABLE_DATA_SOURCE
} from './tokens';
import { PaginatorLike } from '@rxap/data-source/pagination';
import {
  RXAP_DATA_SOURCE_METADATA,
  BaseDataSource,
  BaseDataSourceViewer
} from '@rxap/data-source';
import {
  Observable,
  TeardownLogic,
  combineLatest,
  of
} from 'rxjs';
import {
  tap,
  switchMap,
  startWith,
  map
} from 'rxjs/operators';
import { Constructor } from '@rxap/utilities';

export interface TableDataSourceMetadata extends AbstractTableDataSourceMetadata {}

@Injectable()
export class TableDataSource<Data extends Record<any, any>> extends AbstractTableDataSource<Data> {

  constructor(
    @Inject(RXAP_TABLE_DATA_SOURCE) private readonly dataSource: BaseDataSource<Data[]>,
    @Optional() @Inject(RXAP_TABLE_DATA_SOURCE_PAGINATOR) paginator: PaginatorLike | null   = null,
    @Optional() @Inject(RXAP_TABLE_DATA_SOURCE_SORT) sort: SortLike | null                  = null,
    @Optional() @Inject(RXAP_TABLE_DATA_SOURCE_FILTER) filter: FilterLike | null            = null,
    @Optional() @Inject(RXAP_DATA_SOURCE_METADATA) metadata: TableDataSourceMetadata | null = dataSource.metadata
  ) {
    super(paginator, sort, filter, metadata);
  }

  protected _connect(viewer: BaseDataSourceViewer): [ Observable<Data[]>, TeardownLogic ] {
    return [
      this.dataSource.connect(viewer).pipe(
        tap(data => this.updateTotalLength(data.length)),
        switchMap(data => {

          this.assertPaginator();

          if (this.paginator && this.paginator.page) {

            return combineLatest([
              this.paginator.page.pipe(
                startWith({
                  pageIndex: this.paginator.pageIndex,
                  pageSize:  this.paginator.pageSize,
                  length:    this.paginator.length
                })
              ),
              this.sort?.sortChange?.pipe(
                startWith({
                  active: this.sort?.active,
                  direction: this.sort?.direction,
                })
              ) ?? of(null),
              this.filter?.change.pipe(
                startWith({})
              ) ?? of(null)
            ]).pipe(
              map(([ page, sort, filter ]) => {

                let filteredData = data;

                if (filter) {
                  filteredData = this.applyFilterBy(filteredData, filter);
                }

                let sortData = filteredData;

                if (sort) {
                  sortData = this.applySortBy(sortData, sort.active, sort.direction);
                }

                return this.applyPagination(sortData, page.pageSize, page.pageIndex);
              })
            );

          }

          throw new Error('The paginator have not a defined page property!');

        })
      ),
      () => this.dataSource.disconnect(viewer)
    ];
  }

  public refresh(): any {
    this.dataSource.refresh();
  }

}

export function RxapTableDataSource(
  metadataOrId: string | TableDataSourceMetadata,
  className: string   = 'TableDataSource',
  packageName: string = '@rxap/data-source/table'
) {
  return function(target: Constructor<TableDataSource<any>>) {
    RxapAbstractTableDataSource(metadataOrId, className, packageName)(target);
  };
}
