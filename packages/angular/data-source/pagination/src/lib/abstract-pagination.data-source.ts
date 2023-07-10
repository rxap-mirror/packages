import {BaseDataSource, BaseDataSourceMetadata, RXAP_DATA_SOURCE_METADATA, RxapDataSource} from '@rxap/data-source';
import {Inject, Injectable, Optional} from '@angular/core';
import {RXAP_PAGINATION_DATA_SOURCE_PAGINATOR} from './tokens';
import {RxapPaginationDataSourceError} from './error';
import {Constructor, IsRequiredPropertyDefined} from '@rxap/utilities';
import {Observable} from 'rxjs';

export interface PageEvent {
  /** The current page index. */
  pageIndex: number;
  /** The current page size */
  pageSize: number;
  /** The current total number of items being paged */
  length?: number;
}

export interface PaginatorLike {
  disabled?: boolean;
  /** Event emitted when the paginator changes the page size or page index. */
  page?: Observable<PageEvent>;
  /** Number of items to display on a page. By default set to 50. */
  pageSize: number;
  /** The zero-based page index of the displayed list of items. Defaulted to 0. */
  pageIndex: number;
  /** The length of the total number of items that are being paginated. Defaulted to 0. */
  length: number;

  /** Resets the pagination to the first page **/
  firstPage?(): void;
}

export type AbstractPaginationDataSourceMetadata = BaseDataSourceMetadata

@Injectable()
export abstract class AbstractPaginationDataSource<Data> extends BaseDataSource<Data[]> {

  public paginator?: PaginatorLike;

  constructor(
    @Optional()
    @Inject(RXAP_PAGINATION_DATA_SOURCE_PAGINATOR)
      paginator: PaginatorLike | null = null,
    @Optional()
    @Inject(RXAP_DATA_SOURCE_METADATA)
      metadata: AbstractPaginationDataSourceMetadata | null = null,
  ) {
    super(metadata);
    if (paginator) {
      this.paginator = paginator;
    }
  }

  public get pageIndex(): number {
    return this.paginator?.pageIndex ?? 0;
  }

  public get pageSize(): number {
    return this.paginator?.pageSize ?? this.totalLength;
  }

  private _totalLength = 0;

  public get totalLength(): number {
    return this._totalLength;
  }

  protected updateTotalLength(totalLength: number): void {
    if (this.paginator && this.paginator.length !== totalLength) {
      this.paginator.length = totalLength;
    }
    this._totalLength = totalLength;
  }

  protected assertPaginator(): void {
    if (!IsRequiredPropertyDefined(this, 'paginator')) {
      throw new RxapPaginationDataSourceError('The paginator instance is not defined!', '');
    }
  }

  protected applyPagination(data: ReadonlyArray<Data>, pageSize: number, pageIndex: number): Data[] {
    return data.slice(pageSize * pageIndex, pageSize * pageIndex + pageSize);
  }

}

export function RxapAbstractPaginationDataSource(
  metadataOrId: string | AbstractPaginationDataSourceMetadata,
  className = 'AbstractPaginationDataSource',
  packageName = '@rxap/data-source/pagination',
) {
  return function (target: Constructor<AbstractPaginationDataSource<any>>) {
    RxapDataSource(metadataOrId, className, packageName)(target);
  };
}
