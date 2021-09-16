import {
  ChangeDetectorRef,
  Directive,
  Inject,
  InjectionToken,
  Input,
  NgModule,
  OnDestroy,
  OnInit,
  Optional
} from '@angular/core';
import type { MatPaginator } from '@angular/material/paginator';
import type { Observable } from 'rxjs';
import { Subscription } from 'rxjs';
import { MatSort } from '@angular/material/sort';
import type {
  AbstractTableDataSource,
  FilterLike
} from '@rxap/data-source/table';
import {
  DynamicTableDataSource,
  TableEvent,
  SortLike
} from '@rxap/data-source/table';
import { BaseRemoteMethod } from '@rxap/remote-method';
import { PaginatorLike } from '@rxap/data-source/pagination';
import { CdkTable } from '@angular/cdk/table';
import { TableFilterService } from './table-filter/table-filter.service';
import {
  debounceTime,
  delay,
  filter,
  tap
} from 'rxjs/operators';
import { Required } from '@rxap/utilities';
import {
  Method,
  ToggleSubject
} from '@rxap/utilities/rxjs';
import { pipeDataSource } from '@rxap/data-source';

// TODO : add migration schematic
export const RXAP_TABLE_METHOD                   = new InjectionToken(
  'rxap/material/table-system/table-method'
);
/**
 * @deprecated use TABLE_METHOD instead
 */
export const TABLE_REMOTE_METHOD                 = RXAP_TABLE_METHOD;
export const TABLE_REMOTE_METHOD_ADAPTER_FACTORY = new InjectionToken(
  'table-remote-method-adapter-factory'
);
export const RXAP_TABLE_FILTER                   = new InjectionToken('rxap/material-table-system/table-filter');
export const TABLE_DATA_SOURCE                   = new InjectionToken('table-data-source');

export type TableRemoteMethodAdapterFactory<
  Data extends Record<string, any> = Record<string, any>
> = (
  method: Method,
  paginator?: PaginatorLike,
  sort?: SortLike | null,
  filter?: FilterLike | null,
  parameters?: Observable<Record<string, any>>
) => BaseRemoteMethod<Data[], TableEvent>;

@Directive({
  selector:
            'table[mat-table][rxapTableDataSource],mat-table[rxapTableDataSource]',
  exportAs: 'rxapTableDataSource'
})
export class TableDataSourceDirective<Data extends Record<string, any> = any>
  implements OnInit, OnDestroy {
  /**
   * @deprecated use dataSource instead
   */
  @Input('rxapTableDataSource')
  public set setDataSource(dataSource: AbstractTableDataSource<Data> | '') {
    if (typeof dataSource !== 'string') {
      this.dataSource = dataSource;
    }
  }

  @Input()
  public paginator?: MatPaginator;

  public readonly loading$ = new ToggleSubject(true);

  @Input()
  @Required
  public id!: string;
  @Input()
  public parameters?: Observable<Record<string, any>>;
  @Input()
  public dataSource?: AbstractTableDataSource<Data>;

  public method?: Method<Data[], TableEvent>;

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

  constructor(
    @Inject(CdkTable)
    private readonly matTable: CdkTable<Data>,
    protected readonly cdr: ChangeDetectorRef,
    @Optional()
    @Inject(RXAP_TABLE_METHOD)
    private readonly sourceMethod: Method<Data[] | any,
      TableEvent | any> | null,
    @Optional()
    @Inject(TABLE_DATA_SOURCE)
    private readonly sourceDataSource: AbstractTableDataSource<Data> | null,
    @Optional()
    @Inject(TABLE_REMOTE_METHOD_ADAPTER_FACTORY)
      adapterFactory: any,
    @Optional()
    @Inject(MatSort)
    private readonly matSort: MatSort | null,
    @Optional()
    @Inject(TableFilterService)
    private readonly tableFilter: TableFilterService | null,
    @Optional()
    @Inject(RXAP_TABLE_FILTER)
    private readonly _tableFilter: FilterLike | null
  ) {
    this.matTable.trackBy = this.trackBy;
    this.adapterFactory = adapterFactory;
  }

  private trackBy(index: number, item: Data): string | number {
    return item.uuid ?? index;
  }

  public ngOnInit() {
    const tableFilter = this._tableFilter ?? this.tableFilter ?? undefined;
    if (this.sourceMethod) {
      if (this.adapterFactory) {
        this.method = this.adapterFactory(
          this.sourceMethod,
          this.paginator,
          this.matSort,
          tableFilter,
          this.parameters
        );
      } else {
        this.method = this.sourceMethod;
      }
      this.dataSource = new DynamicTableDataSource<Data>(
        this.method,
        this.paginator,
        this.matSort,
        tableFilter,
        this.parameters,
        this.method.metadata ?? { id: this.id }
      );
    } else if (this.sourceDataSource) {
      this.dataSource = this.sourceDataSource;
    } else if (!this.dataSource) {
      throw new Error(
        'The TABLE_DATA_SOURCE and TABLE_METHOD token are not defined!'
      );
    }
    this.dataSource.paginator  = this.paginator;
    this.dataSource.sort       = this.matSort ?? undefined;
    this.dataSource.filter     = tableFilter;
    this.dataSource.parameters = this.parameters;
    this._subscription.add(
      this.dataSource.loading$.pipe(
        tap(loading => this.loading$.next(!!loading))
      ).subscribe()
    );
    this.matTable.dataSource = pipeDataSource(this.dataSource, tap(rowList => rowList.forEach((element: any) => {
      element.__metadata__ = { loading$: new ToggleSubject() };
    })));
    // TODO : remove hack to trigger change detection after data source refresh (machine-definition -> physical unit)
    this._subscription.add(
      this.loading$
          .pipe(
            filter((loading) => !loading),
            debounceTime(2000),
            tap(() => this.cdr.detectChanges()),
            tap(() => this.cdr.markForCheck()),
            delay(500),
            tap(() => this.cdr.detectChanges()),
          tap(() => this.cdr.markForCheck()),
          delay(500),
          tap(() => this.cdr.detectChanges()),
          tap(() => this.cdr.markForCheck()),
          delay(500),
          tap(() => this.cdr.detectChanges()),
          tap(() => this.cdr.markForCheck()),
          delay(500),
          tap(() => this.cdr.detectChanges()),
          tap(() => this.cdr.markForCheck()),
          delay(500),
          tap(() => this.cdr.detectChanges()),
          tap(() => this.cdr.markForCheck()),
          delay(500)
        )
        .subscribe()
    );
  }

  public ngOnDestroy() {
    this._subscription.unsubscribe();
  }

  public refresh() {
    this.dataSource?.refresh();
  }
}

@NgModule({
  exports: [TableDataSourceDirective],
  declarations: [TableDataSourceDirective],
})
export class TableDataSourceModule {}
