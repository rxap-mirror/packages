import {
  BaseDataSource,
  BaseDataSourceViewer,
  RXAP_DATA_SOURCE_METADATA,
  RxapDataSource
} from '@rxap/data-source';
import {
  RXAP_PAGINATION_DATA_SOURCE,
  RXAP_PAGINATION_DATA_SOURCE_PAGINATOR
} from './tokens';
import {
  Inject,
  Optional,
  Injectable
} from '@angular/core';
import {
  Observable,
  TeardownLogic
} from 'rxjs';
import {
  map,
  switchMap,
  startWith,
  tap
} from 'rxjs/operators';
import { RxapPaginationDataSourceError } from './error';
import {
  AbstractPaginationDataSource,
  PaginatorLike,
  AbstractPaginationDataSourceMetadata
} from './abstract-pagination.data-source';
import { Constructor } from '@rxap/utilities';

export interface PaginationDataSourceMetadata extends AbstractPaginationDataSourceMetadata {}

@Injectable()
export class PaginationDataSource<Data> extends AbstractPaginationDataSource<Data> {

  constructor(
    @Inject(RXAP_PAGINATION_DATA_SOURCE) public readonly dataSource: BaseDataSource<Data[]>,
    @Optional() @Inject(RXAP_PAGINATION_DATA_SOURCE_PAGINATOR) paginator: PaginatorLike | null = null,
    @Optional() @Inject(RXAP_DATA_SOURCE_METADATA) metadata: PaginationDataSourceMetadata      = dataSource.metadata
  ) {
    super(paginator, metadata);
  }

  protected _connect(viewer: BaseDataSourceViewer): [ Observable<Data[]>, TeardownLogic ] {

    this.assertPaginator();

    return [
      this.dataSource.connect(viewer).pipe(
        tap(data => this.updateTotalLength(data.length)),
        switchMap(data => {

          if (!Array.isArray(data)) {
            throw new RxapPaginationDataSourceError('The source data source must be a collection data source', '');
          }

          this.assertPaginator();

          if (this.paginator && this.paginator.page) {

            return this.paginator.page.pipe(
              startWith({
                pageIndex: this.paginator.pageIndex,
                pageSize:  this.paginator.pageSize,
                length:    this.paginator.length
              }),
              map(page => this.applyPagination(data, page.pageSize, page.pageIndex))
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

export function RxapPaginationDataSource(
  metadataOrId: string | PaginationDataSourceMetadata,
  className: string   = 'PaginationDataSource',
  packageName: string = '@rxap/data-source/pagination'
) {
  return function(target: Constructor<PaginationDataSource<any>>) {
    RxapDataSource(metadataOrId, className, packageName)(target);
  };
}
