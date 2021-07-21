import {
  Injectable,
  Optional,
  Inject,
  InjectionToken,
  OnInit
} from '@angular/core';
import {
  RXAP_DATA_SOURCE_METADATA,
  BaseDataSourceViewer
} from '@rxap/data-source';
import {
  PaginatorLike,
  PageEvent
} from '@rxap/data-source/pagination';
import {
  Observable,
  combineLatest,
  of,
  BehaviorSubject
} from 'rxjs';
import {
  startWith,
  switchMap,
  tap,
  map,
  debounceTime,
  distinctUntilChanged
} from 'rxjs/operators';
import {
  AbstractTableDataSource,
  Sort,
  SortLike,
  FilterLike
} from './abstract-table.data-source';
import { TableDataSourceMetadata } from './table.data-source';
import {
  RXAP_TABLE_DATA_SOURCE_PAGINATOR,
  RXAP_TABLE_DATA_SOURCE_SORT,
  RXAP_TABLE_DATA_SOURCE_FILTER,
  RXAP_TABLE_DATA_SOURCE_PARAMETERS
} from './tokens';
import {
  equals,
  clone
} from '@rxap/utilities';
import { Method } from '@rxap/utilities/rxjs';

export const RXAP_TABLE_REMOTE_METHOD = new InjectionToken('rxap/data-source/table/remote-method');

export interface TableEvent<Parameters = any> {
  start?: number;
  end?: number;
  page?: PageEvent | null;
  sort?: Sort | null;
  filter?: Record<string, any> | null | string;
  /** The custom table parameter */
  parameters?: Parameters;
  /** time of the last refresh call */
  refresh?: number;
  setTotalLength?: (length: number) => void
}

export interface DynamicTableDataSourceViewer<Parameters> extends BaseDataSourceViewer<Parameters> {
  parameters: Parameters;
}

@Injectable()
export class DynamicTableDataSource<Data extends Record<any, any> = any, Parameters = any>
  extends AbstractTableDataSource<Data, Parameters> implements OnInit {

  private _refresh$ = new BehaviorSubject<number>(Date.now());

  constructor(
    @Optional()
    @Inject(RXAP_TABLE_REMOTE_METHOD)
    private readonly remoteMethod: Method<Data[], TableEvent<Parameters>>,
    @Optional()
    @Inject(RXAP_TABLE_DATA_SOURCE_PAGINATOR)
      paginator: PaginatorLike | null           = null,
    @Optional()
    @Inject(RXAP_TABLE_DATA_SOURCE_SORT)
      sort: SortLike | null                     = null,
    @Optional()
    @Inject(RXAP_TABLE_DATA_SOURCE_FILTER)
      filter: FilterLike | null                 = null,
    @Optional()
    @Inject(RXAP_TABLE_DATA_SOURCE_PARAMETERS)
      parameters: Observable<Parameters> | null = null,
    @Optional()
    @Inject(RXAP_DATA_SOURCE_METADATA)
      metadata: TableDataSourceMetadata | null  = remoteMethod.metadata
  ) {
    super(paginator, sort, filter, parameters, metadata);
  }

  public ngOnInit() {
    this._data$ = combineLatest([
      this.paginator?.page?.pipe(
        startWith({
          pageIndex: this.paginator?.pageIndex ?? 0,
          pageSize:  this.paginator?.pageSize ?? Number.MAX_SAFE_INTEGER,
          length:    this.paginator?.length
        })
      ) ?? of(undefined),
      this.sort?.sortChange?.pipe(
        startWith({
          active:    this.sort?.active,
          direction: this.sort?.direction
        })
      ) ?? of(undefined),
      this.filter?.change ?? of(undefined),
      this.parameters ?? of(undefined),
      this._refresh$
    ]).pipe(
      debounceTime(100),
      map(([ page, sort, filter, parameters, refresh ]) => {
        const tableEvent: TableEvent = {
          page,
          start: page ? page.pageSize * page.pageIndex : 0,
          end:   page ? page.pageSize * page.pageIndex + page.pageSize : Number.MAX_SAFE_INTEGER,
          sort,
          filter,
          parameters,
          refresh
        };
        return {
          ...clone(tableEvent),
          setTotalLength: this.setTotalLength.bind(this)
        };
      }),
      distinctUntilChanged((a, b) => equals(a, b)),
      tap(() => this.loading$.enable()),
      switchMap(tableEvent => this.loadPage(tableEvent)),
      tap(() => this.loading$.disable())
    );
  }

  protected async loadPage(tableEvent: TableEvent): Promise<Data[]> {
    let data: Data[] = [];
    try {
      data = await this.remoteMethod.call(tableEvent);
    } catch (e) {
      console.error(`Failed to load page: ${e.message}`, e.stack);
    }
    return data;
  }

  public setTotalLength(length: number): void {
    if (this.paginator) {
      this.paginator.length = length;
    }
  }

  public refresh(): any {
    this._refresh$.next(Date.now());
  }

}
