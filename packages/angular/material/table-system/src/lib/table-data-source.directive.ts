import { CdkTable } from '@angular/cdk/table';
import { ChangeDetectorRef, Directive, InjectionToken, isDevMode, OnDestroy, OnInit, input, inject, linkedSignal } from '@angular/core';
import type { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { pipeDataSource } from '@rxap/data-source';
import { PaginatorLike } from '@rxap/data-source/pagination';
import {
  AbstractTableDataSource,
  DynamicTableDataSource,
  FilterLike,
  RXAP_TABLE_METHOD,
  SortLike,
  TableEvent,
} from '@rxap/data-source/table';
import { Method } from '@rxap/pattern';
import { ToggleSubject } from '@rxap/rxjs';
import {
  Observable,
  Subject,
  Subscription,
} from 'rxjs';
import { tap } from 'rxjs/operators';
import { TableFilterService } from './table-filter/table-filter.service';

export { RXAP_TABLE_METHOD } from '@rxap/data-source/table';

/**
 * @deprecated use TABLE_METHOD instead
 */
export const TABLE_REMOTE_METHOD = RXAP_TABLE_METHOD;
export const TABLE_REMOTE_METHOD_ADAPTER_FACTORY = new InjectionToken(
  'table-remote-method-adapter-factory',
);
export const RXAP_TABLE_FILTER = new InjectionToken('rxap/material-table-system/table-filter');
export const TABLE_DATA_SOURCE = new InjectionToken('table-data-source');

export type TableRemoteMethodAdapterFactory<
  Data extends Record<string, any> = Record<string, any>
> = (
  method: Method,
  paginator?: PaginatorLike,
  sort?: SortLike | null,
  filter?: FilterLike | null,
  parameters?: Observable<Record<string, any>>,
) => Method<Data[], TableEvent>;

@Directive({
  selector: 'table[mat-table][rxapTableDataSource],mat-table[rxapTableDataSource]',
  exportAs: 'rxapTableDataSource',
  standalone: true,
})
export class TableDataSourceDirective<Data extends Record<string, any> = any>
  implements OnInit, OnDestroy {
  private readonly matTable = inject<CdkTable<Data>>(CdkTable);
  protected readonly cdr = inject(ChangeDetectorRef);
  private readonly sourceMethod = inject<Method<Data[] | any, TableEvent | any> | null>(RXAP_TABLE_METHOD, { optional: true });
  private readonly sourceDataSource = inject<AbstractTableDataSource<Data> | null>(TABLE_DATA_SOURCE, { optional: true });
  private readonly matSort = inject<MatSort | null>(MatSort, { optional: true });
  private readonly tableFilter = inject<TableFilterService | null>(TableFilterService, { optional: true });
  private readonly _tableFilter = inject<FilterLike | null>(RXAP_TABLE_FILTER, { optional: true });

  /**
   * @deprecated use dataSource instead
   */
  public readonly deprecatedDataSource = input<AbstractTableDataSource<Data> | ''>('', { alias: 'rxapTableDataSource' });

  public readonly dataSourceInput = input<AbstractTableDataSource<Data> | undefined>(undefined, { alias: 'dataSource' });

  public readonly paginator = input<MatPaginator>();

  public readonly loading$ = new ToggleSubject(true);

  public readonly id = input.required<string>();
  public readonly parameters = input<Observable<Record<string, any>>>();
  /**
   * The current data source. Initialised with the dataSource input - if not defined the
   * data source is created from the TABLE_DATA_SOURCE or RXAP_TABLE_METHOD token on init.
   */
  public readonly dataSource = linkedSignal<AbstractTableDataSource<Data> | undefined>(() => {
    const deprecated = this.deprecatedDataSource();
    return this.dataSourceInput() ?? (deprecated !== '' ? deprecated : undefined);
  });

  public method?: Method<Data[], TableEvent>;

  public readonly hasError$ = new ToggleSubject();

  public readonly error$ = new Subject<unknown>();

  public get lastRefreshed(): Date | null {
    return this.dataSource()?.lastRefreshed ?? null;
  }

  /**
   * @deprecated use method instead
   */
  public get remoteMethod(): Method<Data[], TableEvent> | undefined {
    return this.method;
  }

  /**
   * @deprecated use sourceMethod instead
   */
  public get sourceRemoteMethod(): Method<
    Data[] | any,
    TableEvent | any
  > | null {
    return this.sourceMethod;
  }

  protected _subscription = new Subscription();

  private readonly adapterFactory: TableRemoteMethodAdapterFactory<Data> | null =
    null;

  constructor() {
    const adapterFactory = inject<TableRemoteMethodAdapterFactory<Data> | null>(TABLE_REMOTE_METHOD_ADAPTER_FACTORY, { optional: true });

    this.matTable.trackBy = this.trackBy;
    this.adapterFactory = adapterFactory;
    this.retry = this.retry.bind(this);
    this.refresh = this.refresh.bind(this);
    this.reset = this.reset.bind(this);
  }

  private trackBy(index: number, item: Data): string | number {
    return item['uuid'] ?? index;
  }

  public ngOnInit() {
    const tableFilter = this._tableFilter ?? this.tableFilter ?? undefined;
    let dataSource = this.dataSource();
    if (!dataSource) {
      if (this.sourceDataSource) {
        dataSource = this.sourceDataSource;
      } else if (this.sourceMethod) {
        if (this.adapterFactory) {
          this.method = this.adapterFactory(
            this.sourceMethod,
            this.paginator(),
            this.matSort,
            tableFilter,
            this.parameters(),
          );
        } else {
          this.method = this.sourceMethod;
        }
        dataSource = new DynamicTableDataSource<Data>(
          this.method,
          this.paginator(),
          this.matSort,
          tableFilter,
          this.parameters(),
          this.method.metadata ?? { id: this.id() },
        );
      }
      if (!dataSource) {
        throw new Error(
          'The TABLE_DATA_SOURCE and RXAP_TABLE_METHOD token are not defined!',
        );
      }
      this.dataSource.set(dataSource);
    }
    dataSource.paginator = this.paginator();
    dataSource.sort = this.matSort ?? undefined;
    dataSource.filter = tableFilter;
    dataSource.parameters = this.parameters();
    const id = this.id();
    if (dataSource instanceof DynamicTableDataSource) {
      dataSource.setPaginator(this.paginator(), id);
      dataSource.setSort(this.matSort, id);
      dataSource.setFilter(tableFilter, id);
      dataSource.setParameters(this.parameters(), id);
    }
    this._subscription.add(
      dataSource.loading$.pipe(
        tap(loading => this.loading$.next(!!loading)),
      ).subscribe(),
    );
    this._subscription.add(
      dataSource.hasError$.pipe(
        tap(hasError => this.hasError$.next(!!hasError)),
      ).subscribe(),
    );
    this._subscription.add(
      dataSource.error$.pipe(
        tap(error => this.error$.next(error)),
      ).subscribe(),
    );
    // create the id property for the mat table component.
    // the instance of the mat table component is used as viewer object
    // with the set of the id property it is possible to use the same data source
    // instance for multiple table component simultaneously
    // on connect the data source can then use the correct paginator/matSort/tableFilter/parameters instance
    // to create the TableEvent objects
    Reflect.set(this.matTable, 'id', id);
    this.matTable.dataSource = pipeDataSource(dataSource, tap(rowList => {
      if (rowList.some((element: any) => !element.__metadata__)) {
        if (isDevMode()) {
          console.debug('Ensure to use the NormalizeTableRow function to normalize the table row!');
        }
        rowList.forEach((element: any) => {
          element.__metadata__ ??= {};
          element.__metadata__.loading$ ??= new ToggleSubject();
        });
      }
    }));
  }

  public ngOnDestroy() {
    this._subscription?.unsubscribe();
  }

  public refresh() {
    this.dataSource()?.refresh();
  }

  public retry() {
    this.dataSource()?.retry();
  }

  public reset() {
    if (this.tableFilter) {
      this.tableFilter.reset();
    } else {
      this.dataSource()?.reset();
    }
  }

}


