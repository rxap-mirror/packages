import type { Injector } from '@angular/core';
import {
  Directive,
  Input,
  NgModule,
  TemplateRef,
  ViewContainerRef,
  SimpleChanges,
  OnChanges,
  OnDestroy,
  AfterViewInit,
  TrackByFunction,
  isDevMode,
  IterableDiffer,
  IterableDiffers,
  IterableChanges,
  IterableChangeRecord,
  EmbeddedViewRef,
  DoCheck,
  ChangeDetectorRef,
  NgZone,
  Inject,
  INJECTOR,
  Output,
  EventEmitter
} from '@angular/core';
import { Required } from '@rxap/utilities';
import {
  BaseDataSource,
  BaseDataSourceViewer,
  DataSourceLoader
} from '@rxap/data-source';
import {
  Observable,
  Subscription
} from 'rxjs';
import {
  tap,
  take,
  filter
} from 'rxjs/operators';
import { IdOrInstanceOrToken } from '@rxap/definition';

export class DataSourceCollectionTemplateContext<Data> {
  constructor(
    public $implicit: Data,
    public connection$: Observable<Data[]>,
    public index: number,
    public count: number
  ) {}

  get first(): boolean {
    return this.index === 0;
  }

  get last(): boolean {
    return this.index === this.count - 1;
  }

  get even(): boolean {
    return this.index % 2 === 0;
  }

  get odd(): boolean {
    return !this.even;
  }
}

function getTypeName(type: any): string {
  return type['name'] || typeof type;
}

class RecordViewTuple<T> {
  constructor(
    public record: any,
    public view: EmbeddedViewRef<DataSourceCollectionTemplateContext<T>>
  ) {}
}

export interface DataSourceCollectionErrorTemplateContext {
  $implicit: unknown | null;
  refresh: () => void;
}

@Directive({
  selector: '[rxapDataSourceCollection]',
})
export class DataSourceCollectionDirective<Data = any>
  implements OnChanges, OnDestroy, AfterViewInit, DoCheck
{
  /**
   * Asserts the correct type of the context for the template that `NgForOf` will render.
   *
   * The presence of this method is a signal to the Ivy template type-check compiler that the
   * `NgForOf` structural directive renders its template with a specific context type.
   */
  static ngTemplateContextGuard<T>(
    dir: DataSourceCollectionDirective<T>,
    ctx: any
  ): ctx is DataSourceCollectionTemplateContext<T> {
    return true;
  }

  @Input('rxapDataSourceCollectionFrom')
  @Required
  public dataSourceOrIdOrToken!: IdOrInstanceOrToken<BaseDataSource<Data[]>>;

  /**
   * A function that defines how to track changes for items in the iterable.
   *
   * When items are added, moved, or removed in the iterable,
   * the directive must re-render the appropriate DOM nodes.
   * To minimize churn in the DOM, only nodes that have changed
   * are re-rendered.
   *
   * By default, the change detector assumes that
   * the object instance identifies the node in the iterable.
   * When this function is supplied, the directive uses
   * the result of calling this function to identify the item node,
   * rather than the identity of the object itself.
   *
   * The function receives two inputs,
   * the iteration index and the node object ID.
   */
  @Input()
  set rxapDataSourceCollectionTrackBy(fn: TrackByFunction<Data>) {
    if (isDevMode() && fn != null && typeof fn !== 'function') {
      // TODO(vicb): use a log service once there is a public one available
      if (<any>console && <any>console.warn) {
        console.warn(
          `trackBy must be a function, but received ${JSON.stringify(fn)}. ` +
            `See https://angular.io/api/common/NgForOf#change-propagation for more information.`
        );
      }
    }
    this._trackByFn = fn;
  }

  get ngForTrackBy(): TrackByFunction<Data> {
    return this._trackByFn;
  }

  @Input('rxapDataSourceCollectionViewer')
  public viewer: BaseDataSourceViewer = { id: '[rxapDataSourceCollection]' };

  public dataSource: BaseDataSource<Data[]> | null = null;

  @Input('rxapDataSourceCollectionEmpty')
  public emptyTemplate?: TemplateRef<void>;

  @Input('rxapDataSourceCollectionErrorTemplate')
  public errorTemplate?: TemplateRef<DataSourceCollectionErrorTemplateContext>;

  @Output()
  public loaded = new EventEmitter();

  @Output()
  public error = new EventEmitter();

  public connection$: Observable<Data[]> | null = null;

  protected readonly subscription = new Subscription();

  protected embeddedErrorViewRef?: EmbeddedViewRef<DataSourceCollectionErrorTemplateContext>;

  protected set data(data: Data[]) {
    this._data = data;
    this._dirty = true;
  }

  private _differ: IterableDiffer<Data> | null = null;
  private _trackByFn!: TrackByFunction<Data>;

  /**
   * Holds the data that should be displayed
   * @private
   */
  private _data: Data[] | null = null;
  private _dirty = true;

  /**
   * Idecates that the data source returned a empty collection
   *
   * true - is empty
   * false - is NOT empty
   * null - unknown
   *
   * @private
   */
  private _empty: boolean | null = null;

  /**
   * Holds the empty template view ref.
   *
   * Is used to determine if a empty template is added to the
   * view. And used to destruct the empty template if the data source
   * changes from empty to not empty.
   *
   * @private
   */
  private _emptyTemplateViewRef: EmbeddedViewRef<void> | null = null;

  private _dataSourceLoadingSubscription: Subscription | null    = null;

  constructor(
    @Inject(DataSourceLoader)
    private readonly dataSourceLoader: DataSourceLoader,
    @Inject(TemplateRef)
    private readonly template: TemplateRef<
      DataSourceCollectionTemplateContext<Data>
    >,
    @Inject(ViewContainerRef)
    private readonly viewContainerRef: ViewContainerRef,
    @Inject(INJECTOR)
    private readonly injector: Injector,
    @Inject(IterableDiffers)
    private readonly differs: IterableDiffers,
    @Inject(ChangeDetectorRef)
    private readonly cdr: ChangeDetectorRef,
    @Inject(NgZone)
    private readonly zone: NgZone
  ) {}

  // TODO : handel that case: a new data source instance is provided and an open connection to the old data source exists.
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

  public ngOnDestroy(): void {
    this._differ = null;
    this._empty = null;
    this.viewContainerRef.clear();
    this.dataSource?.disconnect(this.viewer);
    this.subscription.unsubscribe();
    this._dataSourceLoadingSubscription?.unsubscribe();
  }

  protected connect() {
    if (this.dataSource) {
      this.connection$ = this.dataSource.connect(this.viewer);
      this.zone.onStable
        .pipe(
          take(1),
          tap(() => {
            this.zone.run(() => {
              this.subscription.add(
                this.connection$!.pipe(
                  tap({
                    next: (response) => {
                      this._empty = response.length === 0;
                      this._data = response;
                      this.cdr.detectChanges();
                    },
                    error: (error) => {
                      this.error.emit(error);
                      console.error(`Connection failure in ${this.dataSource!.constructor.name}: ${error.message}`, error);
                      this.embedErrorTemplate(error);
                    }
                  }),
                ).subscribe()
              );
            });
          })
        )
        .subscribe();
    } else {
      throw new Error(
        'Can not connect to the data source. The data source is not loaded!'
      );
    }
  }

  protected applyChanges(changes: IterableChanges<Data>) {
    const insertTuples: RecordViewTuple<Data>[] = [];
    changes.forEachOperation(
      (
        item: IterableChangeRecord<any>,
        adjustedPreviousIndex: number | null,
        currentIndex: number | null
      ) => {
        if (item.previousIndex == null) {
          // NgForOf is never "null" or "undefined" here because the differ detected
          // that a new item needs to be inserted from the iterable. This implies that
          // there is an iterable value for "_ngForOf".
          const view = this.viewContainerRef.createEmbeddedView(
            this.template,
            new DataSourceCollectionTemplateContext<Data>(
              null!,
              this.connection$!,
              -1,
              -1
            ),
            currentIndex === null ? undefined : currentIndex
          );
          const tuple = new RecordViewTuple<Data>(item, view);
          insertTuples.push(tuple);
        } else if (currentIndex == null) {
          this.viewContainerRef.remove(
            adjustedPreviousIndex === null ? undefined : adjustedPreviousIndex
          );
        } else if (adjustedPreviousIndex !== null) {
          const view = this.viewContainerRef.get(adjustedPreviousIndex)!;
          this.viewContainerRef.move(view, currentIndex);
          const tuple = new RecordViewTuple(
            item,
            <EmbeddedViewRef<DataSourceCollectionTemplateContext<Data>>>view
          );
          insertTuples.push(tuple);
        }
      }
    );

    for (let i = 0; i < insertTuples.length; i++) {
      this.perViewChange(insertTuples[i].view, insertTuples[i].record);
    }

    for (let i = 0, ilen = this.viewContainerRef.length; i < ilen; i++) {
      const viewRef = <
        EmbeddedViewRef<DataSourceCollectionTemplateContext<Data>>
      >this.viewContainerRef.get(i);
      viewRef.context.index = i;
      viewRef.context.count = ilen;
      viewRef.context.connection$ = this.connection$!;
    }

    changes.forEachIdentityChange((record: any) => {
      const viewRef = <
        EmbeddedViewRef<DataSourceCollectionTemplateContext<Data>>
      >this.viewContainerRef.get(record.currentIndex);
      viewRef.context.$implicit = record.item;
    });
  }

  private perViewChange(
    view: EmbeddedViewRef<DataSourceCollectionTemplateContext<Data>>,
    record: IterableChangeRecord<any>
  ) {
    view.context.$implicit = record.item;
  }

  /**
   * Applies the changes when needed.
   */
  public ngDoCheck(): void {
    if (this._empty === true) {
      this.viewContainerRef.clear();
      this._differ = null;

      // attaches the empty template if the data source is empty
      if (this.emptyTemplate) {
        this._emptyTemplateViewRef = this.viewContainerRef.createEmbeddedView(
          this.emptyTemplate
        );
      }
    } else if (this._empty === false) {
      // detach and destroy the empty template if the data source is not
      // empty any more
      if (this._emptyTemplateViewRef) {
        this._emptyTemplateViewRef.detach();
        this._emptyTemplateViewRef.destroy();
        this._emptyTemplateViewRef = null;
      }

      if (this._data) {
        this._dirty = false;
        // React on ngForOf changes only once all inputs have been initialized
        const value = this._data;
        if (!this._differ && value) {
          try {
            this._differ = this.differs.find(value).create(this.ngForTrackBy);
          } catch {
            throw new Error(
              `Cannot find a differ supporting object '${value}' of type '${getTypeName(
                value
              )}'. NgFor only supports binding to Iterables such as Arrays.`
            );
          }
        }
      }
      if (this._differ) {
        const changes = this._differ.diff(this._data);
        if (changes) {
          this.applyChanges(changes);
        }
      }
    }
  }

  protected loadDataSource(): BaseDataSource<Data[]> | null {
    let dataSource: BaseDataSource | null = null;
    if (typeof this.dataSourceOrIdOrToken === 'string') {
      dataSource = this.dataSourceLoader.load<BaseDataSource<Data[]>>(
        this.dataSourceOrIdOrToken,
        undefined,
        this.injector
      );
    } else if (this.dataSourceOrIdOrToken instanceof BaseDataSource) {
      dataSource = this.dataSourceOrIdOrToken;
    } else if (this.dataSourceOrIdOrToken !== null) {
      dataSource = this.injector.get<BaseDataSource<Data[]>>(
        this.dataSourceOrIdOrToken
      );
    }
    this._dataSourceLoadingSubscription?.unsubscribe();
    this._dataSourceLoadingSubscription =
      dataSource?.loading$.pipe(filter(Boolean)).subscribe(this.loaded) ?? null;
    return dataSource;
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
      refresh: this.dataSource?.refresh.bind(this.dataSource) ?? (() => {})
    };
    this.embeddedErrorViewRef?.destroy();
    this.viewContainerRef.clear();
    this.embeddedErrorViewRef = this.viewContainerRef.createEmbeddedView(
      this.errorTemplate,
      context
    );
    this.cdr.detectChanges();
  }

}

@NgModule({
  declarations: [DataSourceCollectionDirective],
  exports: [DataSourceCollectionDirective],
})
export class DataSourceCollectionDirectiveModule {}
