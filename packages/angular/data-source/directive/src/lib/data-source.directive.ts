import type {Injector} from '@angular/core';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Directive,
  EmbeddedViewRef,
  EventEmitter,
  Inject,
  INJECTOR,
  Input,
  isDevMode,
  NgZone,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import {BaseDataSource, BaseDataSourceViewer, DataSourceLoader} from '@rxap/data-source';
import {Required} from '@rxap/utilities';
import {filter, take, tap} from 'rxjs/operators';
import {Observable, Subscription} from 'rxjs';
import {IdOrInstanceOrToken} from '@rxap/definition';

export interface DataSourceTemplateContext<Data> {
  $implicit: Data;
  connection$: Observable<Data>;
}

export interface DataSourceErrorTemplateContext {
  $implicit: unknown | null;
  refresh: () => void;
}

@Directive({
  selector: '[rxapDataSource]',
  exportAs: 'rxapDataSource',
  standalone: true,
})
export class DataSourceDirective<Data = any>
  implements OnDestroy, OnChanges, AfterViewInit {

  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('rxapDataSourceFrom')
  @Required
  public dataSourceOrIdOrToken!: IdOrInstanceOrToken<BaseDataSource<Data>>;
  @Input('rxapDataSourceViewer')
  public viewer!: BaseDataSourceViewer;
  @Input('rxapDataSourceErrorTemplate')
  public errorTemplate?: TemplateRef<DataSourceErrorTemplateContext>;
  @Output()
  public embedded = new EventEmitter<Data>();
  @Output()
  public loaded = new EventEmitter();
  @Output()
  // eslint-disable-next-line @angular-eslint/no-output-native
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
  protected embeddedViewRef?: EmbeddedViewRef<DataSourceTemplateContext<Data>>;
  protected embeddedErrorViewRef?: EmbeddedViewRef<DataSourceErrorTemplateContext>;
  private _dataSourceLoadingSubscription: Subscription | null = null;
  private _dataSourceConnectionSubscription: Subscription | null = null;

  constructor(
    private readonly dataSourceLoader: DataSourceLoader,
    private readonly template: TemplateRef<DataSourceTemplateContext<Data>>,
    private readonly viewContainerRef: ViewContainerRef,
    @Inject(INJECTOR)
    private readonly injector: Injector,
    private readonly cdr: ChangeDetectorRef,
    private readonly zone: NgZone,
  ) {
    this.viewer = this;
  }

  /**
   * Asserts the correct type of the context for the template that `NgForOf` will render.
   *
   * The presence of this method is a signal to the Ivy template type-check compiler that the
   * `NgForOf` structural directive renders its template with a specific context type.
   */
  static ngTemplateContextGuard<T>(
    dir: DataSourceDirective<T>,
    ctx: any,
  ): ctx is DataSourceTemplateContext<T> {
    return true;
  }

  public ngOnChanges(changes: SimpleChanges) {
    const dataSourceOrIdOrTokenChange = changes['dataSourceOrIdOrToken'];
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

  public embedErrorTemplate(error: unknown | null) {
    if (!this.errorTemplate) {
      if (isDevMode()) {
        console.log('Skip error template embedding. ErrorTemplate is not defined');
      }
      return;
    }
    const context = {
      $implicit: error,
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      refresh: this.dataSource?.refresh.bind(this.dataSource) ?? (() => {
      }),
    };
    this.embeddedErrorViewRef?.destroy();
    this.embeddedViewRef?.destroy();
    this.embeddedErrorViewRef = this.viewContainerRef.createEmbeddedView(
      this.errorTemplate,
      context,
    );
    this.cdr.detectChanges();
  }

  public embedTemplate(response: any) {
    this.embeddedErrorViewRef?.destroy();
    const context = {
      $implicit: response,
      connection$: this.connection$,
    };
    if (this.embeddedViewRef && !this.hasChanged(this.embeddedViewRef.context.$implicit, response)) {
      this.embeddedViewRef.context = context;
    } else {
      this.embeddedViewRef?.destroy();
      this.embeddedViewRef = this.viewContainerRef.createEmbeddedView(
        this.template,
        context,
      );
    }
    this.embedded.emit(response);
    this.cdr.detectChanges();
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
        this.injector,
      );
    } else if (this.dataSourceOrIdOrToken instanceof BaseDataSource) {
      dataSource = this.dataSourceOrIdOrToken;
    } else if (this.dataSourceOrIdOrToken !== null) {
      dataSource = this.injector.get<BaseDataSource<Data>>(
        this.dataSourceOrIdOrToken,
      );
    }
    this._dataSourceLoadingSubscription?.unsubscribe();
    this._dataSourceLoadingSubscription =
      dataSource?.loading$.pipe(filter(Boolean)).subscribe(this.loaded) ?? null;
    return dataSource;
  }

  protected connect() {
    if (this.dataSource) {
      this.dataSource.hasError$.pipe(
        filter(Boolean),
        tap(hasError => {
          if (hasError) {
            this.embedErrorTemplate(null)
          } else {
            this.embeddedErrorViewRef?.destroy();
          }
        }),
      ).subscribe();
      this.connection$ = this.dataSource.connect(this.viewer);
      this.zone.onStable
        .pipe(
          take(1),
          tap(() => {
            this.zone.run(() => {
              this._dataSourceConnectionSubscription?.unsubscribe();
              this._dataSourceConnectionSubscription = this.connection$
                .pipe(
                  tap({
                    next: (response) => this.embedTemplate(response),
                    error: (error) => {
                      this.error.emit(error);
                      console.error(`Connection failure in ${this.dataSource!.constructor.name}: ${error.message}`, error);
                      this.embedErrorTemplate(error);
                    },
                  }),
                )
                .subscribe();
            });
          }),
        )
        .subscribe();
    }
  }

  private hasChanged(last: Data, current: Data): boolean {
    const lastKey = this.trackBy ? this.trackBy(last) : last;
    const currentKey = this.trackBy ? this.trackBy(current) : current;
    return lastKey !== currentKey;
  }
}


