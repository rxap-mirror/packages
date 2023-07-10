import {
  BaseDataSource,
  BaseDataSourceViewer,
  RXAP_DATA_SOURCE_METADATA,
  RxapDataSource,
} from '@rxap/data-source';
import {
  RXAP_PAGINATION_DATA_SOURCE,
  RXAP_PAGINATION_DATA_SOURCE_PAGINATOR,
} from './tokens';
import {
  Inject,
  Injectable,
  Optional,
} from '@angular/core';
import {
  Observable,
  TeardownLogic,
} from 'rxjs';
import {
  map,
  startWith,
  switchMap,
  tap,
} from 'rxjs/operators';
import { RxapPaginationDataSourceError } from './error';
import {
  AbstractPaginationDataSource,
  AbstractPaginationDataSourceMetadata,
  PaginatorLike,
} from './abstract-pagination.data-source';
import { Constructor } from '@rxap/utilities';

export type PaginationDataSourceMetadata = AbstractPaginationDataSourceMetadata

@Injectable()
export class PaginationDataSource<Data> extends AbstractPaginationDataSource<Data> {

  constructor(
    @Inject(RXAP_PAGINATION_DATA_SOURCE) public readonly dataSource: BaseDataSource<Data[]>,
    @Optional() @Inject(RXAP_PAGINATION_DATA_SOURCE_PAGINATOR) paginator: PaginatorLike | null = null,
    @Optional() @Inject(RXAP_DATA_SOURCE_METADATA) metadata: PaginationDataSourceMetadata = dataSource.metadata,
  ) {
    super(paginator, metadata);
  }

  public override refresh(): any {
    this.dataSource.refresh();
  }

  protected override _connect(viewer: BaseDataSourceViewer): [ Observable<Data[]>, TeardownLogic ] {

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
                pageSize: this.paginator.pageSize,
                length: this.paginator.length,
              }),
              map(page => this.applyPagination(data, page.pageSize, page.pageIndex)),
            );

          }

          throw new Error('The paginator have not a defined page property!');

        }),
      ),
      () => this.dataSource.disconnect(viewer),
    ];
  }

}

export function RxapPaginationDataSource(
  metadataOrId: string | PaginationDataSourceMetadata,
  className = 'PaginationDataSource',
  packageName = '@rxap/data-source/pagination',
) {
  return function (target: Constructor<PaginationDataSource<any>>) {
    RxapDataSource(metadataOrId, className, packageName)(target);
  };
}
