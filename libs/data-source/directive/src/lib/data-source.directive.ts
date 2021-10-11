import type { Injector } from '@angular/core';
import {
  Directive,
  NgModule,
  TemplateRef,
  ViewContainerRef,
  Input,
  OnDestroy,
  ChangeDetectorRef,
  OnChanges,
  SimpleChanges,
  NgZone,
  EmbeddedViewRef,
  AfterViewInit,
  EventEmitter,
  Output,
  INJECTOR,
  Inject
} from '@angular/core';
import {
  DataSourceLoader,
  BaseDataSource,
  BaseDataSourceViewer
} from '@rxap/data-source';
import { Required } from '@rxap/utilities';
import {
  tap,
  take,
  filter,
  catchError
} from 'rxjs/operators';
import {
  Observable,
  Subscription,
  EMPTY
} from 'rxjs';
import { IdOrInstanceOrToken } from '@rxap/definition';

export interface DataSourceTemplate<Data> {
  $implicit: Data;
  connection$: Observable<Data>;
}

@Directive({
  selector: '[rxapDataSource]',
  exportAs: 'rxapDataSource'
})
export class DataSourceDirective<Data = any>
  implements OnDestroy, OnChanges, AfterViewInit
{
  @Input('rxapDataSourceFrom')
  @Required
  public dataSourceOrIdOrToken!: IdOrInstanceOrToken<BaseDataSource<Data>>;

  @Input('rxapDataSourceViewer')
  public viewer!: BaseDataSourceViewer;

  @Output()
  public embedded = new EventEmitter<Data>();

  @Output()
  public loaded = new EventEmitter();

  @Output()
  public error = new EventEmitter();

  public dataSource: BaseDataSource<Data> | null = null;

  public connection$!: Observable<Data>;

  @Input('rxapDataSourceTrackBy')
  public trackBy?: (data: Data) => any;

  /**
   * @deprecated removed
   * @protected
   */
  protected readonly subscription = new Subscription();

  protected embeddedViewRef?: EmbeddedViewRef<DataSourceTemplate<Data>>;

  private _dataSourceLoadingSubscription: Subscription | null    = null;
  private _dataSourceConnectionSubscription: Subscription | null = null;

  constructor(
    private readonly dataSourceLoader: DataSourceLoader,
    private readonly template: TemplateRef<DataSourceTemplate<Data>>,
    private readonly viewContainerRef: ViewContainerRef,
    @Inject(INJECTOR)
    private readonly injector: Injector,
    private readonly cdr: ChangeDetectorRef,
    private readonly zone: NgZone
  ) {
    this.viewer = this;
  }

  public ngOnChanges(changes: SimpleChanges) {
    const dataSourceOrIdOrTokenChange = changes.dataSourceOrIdOrToken;
    if (dataSourceOrIdOrTokenChange) {
      this.dataSource = this.loadDataSource();
      // Dont connect to the data source on the first change.
      // Else the parent/sibling components are not initialized
      // and the parameters from the parent/sibling components can not
      // be used in the connect logic.
      // Example: The PaginationDataSource required the pageSize, but the pageSize
      // in the MatPaginator will be set after the ngOnChanges logic is called.
      // So the initial pageSize is undefined.
      if (!dataSourceOrIdOrTokenChange.firstChange) {
        this.connect();
      }
    }
  }

  public ngAfterViewInit() {
    this.connect();
  }

  public embedTemplate(response: any) {
    const context = {
      $implicit:   response,
      connection$: this.connection$
    };
    if (this.embeddedViewRef && !this.hasChanged(this.embeddedViewRef.context.$implicit, response)) {
      this.embeddedViewRef.context = context;
    } else {
      this.embeddedViewRef?.destroy();
      this.embeddedViewRef = this.viewContainerRef.createEmbeddedView(
        this.template,
        {
          $implicit:   response,
          connection$: this.connection$
        }
      );
    }
    this.embedded.emit(response);
    this.cdr.detectChanges();
  }

  private hasChanged(last: Data, current: Data): boolean {
    const lastKey    = this.trackBy ? this.trackBy(last) : last;
    const currentKey = this.trackBy ? this.trackBy(current) : current;
    return lastKey !== currentKey;
  }

  public ngOnDestroy(): void {
    this.dataSource?.disconnect(this.viewer);
    this.subscription.unsubscribe();
    this._dataSourceConnectionSubscription?.unsubscribe();
    this._dataSourceLoadingSubscription?.unsubscribe();
  }

  protected loadDataSource(): BaseDataSource<Data> | null {
    let dataSource: BaseDataSource | null = null;
    if (typeof this.dataSourceOrIdOrToken === 'string') {
      dataSource = this.dataSourceLoader.load<BaseDataSource<Data>>(
        this.dataSourceOrIdOrToken,
        undefined,
        this.injector
      );
    } else if (this.dataSourceOrIdOrToken instanceof BaseDataSource) {
      dataSource = this.dataSourceOrIdOrToken;
    } else if (this.dataSourceOrIdOrToken !== null) {
      dataSource = this.injector.get<BaseDataSource<Data>>(
        this.dataSourceOrIdOrToken
      );
    }
    this._dataSourceLoadingSubscription?.unsubscribe();
    this._dataSourceLoadingSubscription =
      dataSource?.loading$.pipe(filter(Boolean)).subscribe(this.loaded) ?? null;
    return dataSource;
  }

  protected connect() {
    if (this.dataSource) {
      this.connection$ = this.dataSource.connect(this.viewer);
      this.zone.onStable
        .pipe(
          take(1),
          tap(() => {
            this.zone.run(() => {
              this._dataSourceConnectionSubscription?.unsubscribe();
              this._dataSourceConnectionSubscription = this.connection$
                .pipe(
                  tap((response) => this.embedTemplate(response)),
                  catchError((e) => {
                    this.error.emit(e);
                    console.error(e);
                    return EMPTY;
                  })
                )
                .subscribe();
            });
          })
        )
        .subscribe();
    }
  }
}

@NgModule({
  exports: [DataSourceDirective],
  declarations: [DataSourceDirective],
})
export class DataSourceDirectiveModule {}
