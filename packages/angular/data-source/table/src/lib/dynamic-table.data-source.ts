import {
  Inject,
  Injectable,
  InjectionToken,
  isDevMode,
  OnInit,
  Optional,
} from '@angular/core';
import {
  BaseDataSourceViewer,
  DataSourceViewerId,
  RXAP_DATA_SOURCE_METADATA,
} from '@rxap/data-source';
import {
  PageEvent,
  PaginatorLike,
} from '@rxap/data-source/pagination';
import { Method } from '@rxap/pattern';
import {
  clone,
  equals,
} from '@rxap/utilities';
import {
  BehaviorSubject,
  combineLatest,
  Observable,
  of,
  TeardownLogic,
} from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  retry,
  startWith,
  switchMap,
  tap,
} from 'rxjs/operators';
import {
  AbstractTableDataSource,
  FilterLike,
  Sort,
  SortLike,
} from './abstract-table.data-source';
import { TableDataSourceMetadata } from './table.data-source';
import {
  RXAP_TABLE_DATA_SOURCE_FILTER,
  RXAP_TABLE_DATA_SOURCE_PAGINATOR,
  RXAP_TABLE_DATA_SOURCE_PARAMETERS,
  RXAP_TABLE_DATA_SOURCE_SORT,
  RXAP_TABLE_METHOD,
} from './tokens';

/**
 * @deprecated removed use RXAP_TABLE_METHOD instead
 */
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
  setTotalLength?: (length: number) => void;
}

export interface DynamicTableDataSourceViewer<Parameters> extends BaseDataSourceViewer<Parameters> {
  parameters: Parameters;
}

@Injectable()
export class DynamicTableDataSource<Data extends Record<any, any> = any, Parameters = any>
  extends AbstractTableDataSource<Data, Parameters> implements OnInit {

  public paginatorMap = new Map<string, PaginatorLike>();
  public sortMap = new Map<string, SortLike>();
  public filterMap = new Map<string, FilterLike>();
  public parametersMap = new Map<string, Observable<Parameters>>();
  protected _refresh$ = new BehaviorSubject<number>(Date.now());

  constructor(
    @Optional()
    @Inject(RXAP_TABLE_METHOD)
    protected readonly method: Method<Data[], TableEvent<Parameters>>,
    @Optional()
    @Inject(RXAP_TABLE_DATA_SOURCE_PAGINATOR)
      paginator: PaginatorLike | null = null,
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
      metadata: TableDataSourceMetadata | null = method.metadata,
  ) {
    super(paginator, sort, filter, parameters, metadata);
  }

  /**
   * @deprecated use method instead
   * @private
   */
  private get remoteMethod(): Method<Data[], TableEvent<Parameters>> {
    return this.method;
  }

  // eslint-disable-next-line @angular-eslint/contextual-lifecycle
  public ngOnInit() {
    this._data$ = this.createTableDataLoader(this.paginator, this.sort, this.filter, this.parameters);
  }

  public setTotalLengthFactory(id?: string) {
    const paginator: PaginatorLike | undefined = id ? this.paginatorMap.get(id) : this.paginator;

    function setTotalLength(length: number): void {
      if (paginator) {
        paginator.length = length;
      }
    }

    return setTotalLength;
  }

  public setTotalLength(length: number, id?: string): void {
    if (id) {
      if (this.paginatorMap.has(id)) {
        this.paginatorMap.get(id)!.length = length;
      }
    } else {
      if (this.paginator) {
        this.paginator.length = length;
      }
    }
  }

  public override refresh(): any {
    this._refresh$.next(Date.now());
  }

  setPaginator(paginator: PaginatorLike | undefined, id?: string) {
    if (paginator) {
      if (id) {
        this.paginatorMap.set(id, paginator);
      } else {
        this.paginator = paginator;
      }
    }
  }

  setSort(sort: SortLike | null, id?: string) {
    if (sort) {
      if (id) {
        this.sortMap.set(id, sort);
      } else {
        this.sort = sort;
      }
    }
  }

  setFilter(tableFilter: FilterLike | undefined, id?: string) {
    if (tableFilter) {
      if (id) {
        this.filterMap.set(id, tableFilter);
      } else {
        this.filter = tableFilter;
      }
    }
  }

  setParameters(parameters: Observable<Parameters> | undefined, id?: string) {
    if (parameters) {
      if (id) {
        this.parametersMap.set(id, parameters);
      } else {
        this.parameters = parameters;
      }
    }
  }

  protected override genericRetryFunction(error: any, retryCount: number): Observable<any> {
    this.loading$.disable();
    return super.genericRetryFunction(error, retryCount);
  }

  protected override _connect(viewer: BaseDataSourceViewer): [ Observable<Data[]>, TeardownLogic ] | Observable<Data[]> {
    // call to ensure all parent logic is executed
    let data = super._connect(viewer);
    if (viewer.id && this.hasDynamicInputs(viewer.id)) {
      data = this.createTableDataLoader(
        this.paginatorMap.get(viewer.id),
        this.sortMap.get(viewer.id),
        this.filterMap.get(viewer.id),
        this.parametersMap.get(viewer.id),
        viewer.id,
      );
    }
    return data;
  }

  protected override _disconnect(viewerId: DataSourceViewerId) {
    if (this.hasDynamicInputs(viewerId)) {
      this.paginatorMap.delete(viewerId);
      this.sortMap.delete(viewerId);
      this.filterMap.delete(viewerId);
      this.parametersMap.delete(viewerId);
    }
    super._disconnect(viewerId);
  }

  protected async loadPage(tableEvent: TableEvent): Promise<Data[]> {
    try {
      return await this.method.call(tableEvent);
    } catch (e: any) {
      console.error(`Failed to load page: ${ e.message }`);
      this.handelError(e);
      this.hasError$.enable();
      this.error$.next(e);
    }
    return [];
  }

  protected override handelError(error: any) {
    if (isDevMode()) {
      console.error(`Failed to load page: ${ error.message }`, error);
    }
  }

  protected hasDynamicInputs(id: string) {
    return this.paginatorMap.has(id) || this.sortMap.has(id) || this.filterMap.has(id) || this.parametersMap.has(id);
  }

  private createTableDataLoader(
    paginatorLike?: PaginatorLike,
    sortLike?: SortLike,
    filterLike?: FilterLike,
    parametersLike?: Observable<Parameters>,
    id?: string,
  ) {
    return combineLatest([
      paginatorLike?.page?.pipe(
        startWith({
          pageIndex: paginatorLike?.pageIndex ?? 0,
          pageSize: paginatorLike?.pageSize ?? Number.MAX_SAFE_INTEGER,
          length: paginatorLike?.length,
        }),
      ) ?? of(undefined),
      sortLike?.sortChange?.pipe(
        startWith({
          active: sortLike?.active,
          direction: sortLike?.direction,
        }),
      ) ?? of(undefined),
      filterLike?.change?.pipe(tap(() => paginatorLike?.firstPage && paginatorLike?.firstPage())) ?? of(undefined),
      parametersLike ?? of(undefined),
      this._refresh$,
      this._retry$.pipe(startWith(null)),
    ]).pipe(
      debounceTime(100),
      map(([ page, sort, filter, parameters, refresh ]) => {
        const tableEvent: TableEvent = {
          page,
          start: page ? page.pageSize * page.pageIndex : 0,
          end: page ? page.pageSize * page.pageIndex + page.pageSize : Number.MAX_SAFE_INTEGER,
          sort,
          filter,
          parameters,
          refresh,
        };
        return {
          ...clone(tableEvent),
          setTotalLength: this.setTotalLengthFactory(id),
        };
      }),
      distinctUntilChanged((a, b) => equals(a, b)),
      tap(() => {
        this.loading$.enable();
        if (this.hasError$.value) {
          this.hasError$.disable();
        }
      }),
      switchMap(tableEvent => this.loadPage(tableEvent)),
      tap({
        next: () => this.loading$.disable(),
        error: error => {
          this.hasError$.enable();
          this.error$.next(error);
          this.handelError(error);
        },
      }),
      retry({
        delay: (error, retryCount) => this.genericRetryFunction(error, retryCount),
      }),
    );
  }

}
