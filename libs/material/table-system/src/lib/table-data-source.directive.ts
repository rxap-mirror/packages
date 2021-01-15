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
import { MatPaginator } from '@angular/material/paginator';
import {
  EMPTY,
  Observable,
  Subscription
} from 'rxjs';
import { MatSort } from '@angular/material/sort';
import {
  AbstractTableDataSource,
  DynamicTableDataSource,
  TableEvent
} from '@rxap/data-source/table';
import { BaseRemoteMethod } from '@rxap/remote-method';
import { PaginatorLike } from '@rxap/data-source/pagination';
import { CdkTable } from '@angular/cdk/table';
import { OpenApiRemoteMethod } from '@rxap/open-api/remote-method';
import { TableFilterService } from './table-filter/table-filter.service';
import {
  debounceTime,
  delay,
  filter,
  tap
} from 'rxjs/operators';

export const TABLE_REMOTE_METHOD                 = new InjectionToken('table-remote-method');
export const TABLE_REMOTE_METHOD_ADAPTER_FACTORY = new InjectionToken('table-remote-method-adapter-factory');
export const TABLE_DATA_SOURCE                   = new InjectionToken('table-data-source');

export type TableRemoteMethodAdapterFactory<Data extends Record<string, any> = Record<string, any>> = (
  remoteMethod: OpenApiRemoteMethod,
  paginator?: PaginatorLike
) => BaseRemoteMethod<Data[], TableEvent>;

@Directive({
  selector: 'table[mat-table][rxapTableDataSource],mat-table[rxapTableDataSource]',
  exportAs: 'rxapTableDataSource'
})
export class TableDataSourceDirective<Data extends Record<string, any> = any> implements OnInit, OnDestroy {

  @Input()
  private paginator?: MatPaginator;

  @Input()
  private parameters?: Observable<Record<string, any>>;

  public loading$: Observable<boolean> = EMPTY;

  @Input('rxapTableDataSource')
  public dataSource?: AbstractTableDataSource<Data>;

  public remoteMethod?: BaseRemoteMethod<Data[], TableEvent>;

  protected _subscription = new Subscription();

  private readonly adapterFactory: TableRemoteMethodAdapterFactory<Data> | null = null;

  constructor(
    @Inject(CdkTable)
    private readonly matTable: CdkTable<Data>,
    protected readonly cdr: ChangeDetectorRef,
    @Optional()
    @Inject(TABLE_REMOTE_METHOD)
    private readonly sourceRemoteMethod: OpenApiRemoteMethod<Data[] | any, TableEvent | any> | null = null,
    @Optional()
    @Inject(TABLE_DATA_SOURCE)
    private readonly sourceDataSource: AbstractTableDataSource<Data> | null                         = null,
    @Optional()
    @Inject(TABLE_REMOTE_METHOD_ADAPTER_FACTORY)
      adapterFactory: any                                                                           = null,
    @Optional()
    @Inject(MatSort)
    private readonly matSort: MatSort | null                                                        = null,
    @Optional()
    @Inject(TableFilterService)
    private readonly tableFilter: TableFilterService | null                                         = null
  ) {
    this.matTable.trackBy = this.trackBy;
    this.adapterFactory   = adapterFactory;
  }

  private trackBy(index: number, item: Data): string | number {
    return item.uuid ?? index;
  }

  public ngOnInit() {
    if (this.sourceRemoteMethod) {
      if (this.adapterFactory) {
        this.remoteMethod = this.adapterFactory(this.sourceRemoteMethod, this.paginator);
      } else {
        this.remoteMethod = this.sourceRemoteMethod;
      }
      this.dataSource = new DynamicTableDataSource<Data>(
        this.remoteMethod,
        this.paginator,
        this.matSort,
        this.tableFilter,
        this.parameters
      );
    } else if (this.sourceDataSource) {
      this.dataSource = this.sourceDataSource;
    } else if (!this.dataSource) {
      throw new Error('The TABLE_DATA_SOURCE and TABLE_REMOTE_METHOD token are not defined!');
    }
    this.dataSource.paginator  = this.paginator;
    this.dataSource.sort       = this.matSort ?? undefined;
    this.dataSource.filter     = this.tableFilter ?? undefined;
    this.dataSource.parameters = this.parameters;
    this.loading$              = this.dataSource.loading$;
    this.matTable.dataSource   = this.dataSource;
    // TODO : remove hack to trigger change detection after data source refresh (machine-definition -> physical unit)
    this._subscription.add(this.loading$.pipe(
      filter(loading => !loading),
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
    ).subscribe());
  }

  public ngOnDestroy() {
    this._subscription.unsubscribe();
  }

  public refresh() {
    this.dataSource?.refresh();
  }

}

@NgModule({
  exports:      [ TableDataSourceDirective ],
  declarations: [ TableDataSourceDirective ]
})
export class TableDataSourceModule {
}
