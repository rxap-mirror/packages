import type { Injector } from '@angular/core';
import { afterNextRender, computed, Directive, effect, EmbeddedViewRef, INJECTOR, isDevMode, IterableChangeRecord, IterableChanges, IterableDiffer, IterableDiffers, OnDestroy, signal, TemplateRef, TrackByFunction, untracked, ViewContainerRef, input, output, inject } from '@angular/core';
import {
  BaseDataSource,
  BaseDataSourceViewer,
  DataSourceLoader,
} from '@rxap/data-source';
import { IdOrInstanceOrToken } from '@rxap/definition';
import {
  Observable,
  Subscription,
} from 'rxjs';
import {
  filter,
  tap,
} from 'rxjs/operators';

export class DataSourceCollectionTemplateContext<Data> {
  constructor(
    public $implicit: Data,
    public connection$: Observable<Data[]>,
    public index: number,
    public count: number,
  ) {
  }

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
    public view: EmbeddedViewRef<DataSourceCollectionTemplateContext<T>>,
  ) {
  }
}

export interface DataSourceCollectionErrorTemplateContext {
  $implicit: unknown | null;
  refresh: () => void;
}

@Directive({
  selector: '[rxapDataSourceCollection]',
  standalone: true,
})
export class DataSourceCollectionDirective<Data = any>
  implements OnDestroy {
  private readonly dataSourceLoader = inject<DataSourceLoader>(DataSourceLoader);
  private readonly template = inject<TemplateRef<DataSourceCollectionTemplateContext<Data>>>(TemplateRef);
  private readonly viewContainerRef = inject<ViewContainerRef>(ViewContainerRef);
  private readonly injector = inject<Injector>(INJECTOR);
  private readonly differs = inject<IterableDiffers>(IterableDiffers);

  // eslint-disable-next-line @angular-eslint/no-input-rename
  public readonly dataSourceOrIdOrToken = input.required<IdOrInstanceOrToken<BaseDataSource<Data[]>>>({ alias: "rxapDataSourceCollectionFrom" });
  public readonly viewer = input<BaseDataSourceViewer>({ id: '[rxapDataSourceCollection]' }, { alias: "rxapDataSourceCollectionViewer" });
  public dataSource: BaseDataSource<Data[]> | null = null;
  // eslint-disable-next-line @angular-eslint/no-input-rename
  public readonly emptyTemplate = input<TemplateRef<void>>(undefined, { alias: "rxapDataSourceCollectionEmpty" });
  public readonly errorTemplate = input<TemplateRef<DataSourceCollectionErrorTemplateContext>>(undefined, { alias: "rxapDataSourceCollectionErrorTemplate" });
  public readonly loaded = output();
  // eslint-disable-next-line @angular-eslint/no-output-native
  public readonly error = output<unknown>();
  public connection$: Observable<Data[]> | null = null;
  protected readonly subscription = new Subscription();
  protected embeddedErrorViewRef?: EmbeddedViewRef<DataSourceCollectionErrorTemplateContext>;
  private _differ: IterableDiffer<Data> | null = null;
  /**
   * Idecates that the data source returned a empty collection
   *
   * true - is empty
   * false - is NOT empty
   * null - unknown
   *
   * @private
   */
  private readonly _empty = signal<boolean | null>(null);
  /**
   * Holds the data that should be displayed
   * @private
   */
  private readonly _data = signal<Data[] | null>(null, { equal: () => false });
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
  private _dataSourceLoadingSubscription: Subscription | null = null;

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
  public readonly rxapDataSourceCollectionTrackBy = input<TrackByFunction<Data> | undefined>(undefined);

  protected readonly trackByFn = computed(() => {
    const fn = this.rxapDataSourceCollectionTrackBy();
    if (isDevMode() && fn != null && typeof fn !== 'function') {
      console.warn(
        `trackBy must be a function, but received ${ JSON.stringify(fn) }. ` +
        `See https://angular.io/api/common/NgForOf#change-propagation for more information.`,
      );
    }
    return fn;
  });

  get ngForTrackBy(): TrackByFunction<Data> | undefined {
    return this.trackByFn();
  }

  /**
   * Asserts the correct type of the context for the template that `NgForOf` will render.
   *
   * The presence of this method is a signal to the Ivy template type-check compiler that the
   * `NgForOf` structural directive renders its template with a specific context type.
   */
  static ngTemplateContextGuard<T>(
    dir: DataSourceCollectionDirective<T>,
    ctx: any,
  ): ctx is DataSourceCollectionTemplateContext<T> {
    return true;
  }

  constructor() {
    // TODO : handel that case: a new data source instance is provided and an open connection to the old data source exists.
    effect(() => {
      this.dataSourceOrIdOrToken();
      untracked(() => {
        this.dataSource = this.loadDataSource();
        // The connection is deferred until after the first render (see connect()).
        // Else the parent/sibling components are not initialized
        // and the parameters from the parent/sibling components can not
        // be used in the connect logic.
        // Example: The PaginationDataSource required the pageSize, but the pageSize
        // in the MatPaginator will be set after the first change detection.
        this.connect();
      });
    });
    // Applies the changes when needed.
    effect(() => {
      const empty = this._empty();
      const data = this._data();
      const emptyTemplate = this.emptyTemplate();
      const trackBy = this.trackByFn();
      untracked(() => this.render(empty, data, emptyTemplate, trackBy));
    });
  }

  public ngOnDestroy(): void {
    this._differ = null;
    this._empty.set(null);
    this.viewContainerRef.clear();
    this.dataSource?.disconnect(this.viewer());
    this.subscription.unsubscribe();
    this._dataSourceLoadingSubscription?.unsubscribe();
  }

  private render(
    empty: boolean | null,
    data: Data[] | null,
    emptyTemplate: TemplateRef<void> | undefined,
    trackBy: TrackByFunction<Data> | undefined,
  ): void {
    if (empty === true) {
      this.viewContainerRef.clear();
      this._differ = null;

      // attaches the empty template if the data source is empty
      if (emptyTemplate) {
        this._emptyTemplateViewRef = this.viewContainerRef.createEmbeddedView(
          emptyTemplate,
        );
      }
    } else if (empty === false) {
      // detach and destroy the empty template if the data source is not
      // empty any more
      if (this._emptyTemplateViewRef) {
        this._emptyTemplateViewRef.detach();
        this._emptyTemplateViewRef.destroy();
        this._emptyTemplateViewRef = null;
      }

      if (data && !this._differ) {
        try {
          this._differ = this.differs.find(data).create(trackBy);
        } catch {
          throw new Error(
            `Cannot find a differ supporting object '${ data }' of type '${ getTypeName(
              data,
            ) }'. NgFor only supports binding to Iterables such as Arrays.`,
          );
        }
      }
      if (this._differ) {
        const changes = this._differ.diff(data);
        if (changes) {
          this.applyChanges(changes);
        }
      }
    }
  }

  public embedErrorTemplate(error: unknown | null) {
    const errorTemplate = this.errorTemplate();
    if (!errorTemplate) {
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
    this.viewContainerRef.clear();
    this.embeddedErrorViewRef = this.viewContainerRef.createEmbeddedView(
      errorTemplate,
      context,
    );
    this.embeddedErrorViewRef.detectChanges();
  }

  protected connect() {
    if (this.dataSource) {
      this.connection$ = this.dataSource.connect(this.viewer());
      afterNextRender(() => {
        this.subscription.add(
          this.connection$!.pipe(
            tap({
              next: (response) => {
                this._data.set(response);
                this._empty.set(response.length === 0);
              },
              error: (error) => {
                this.error.emit(error);
                console.error(
                  `Connection failure in ${ this.dataSource!.constructor.name }: ${ error.message }`,
                  error,
                );
                this.embedErrorTemplate(error);
              },
            }),
          )
            // the error is already handled in the tap above; without an error callback rxjs
            // would rethrow it asynchronously as an uncaught exception
            .subscribe({ error: () => undefined }),
        );
      }, { injector: this.injector });
    } else {
      throw new Error(
        'Can not connect to the data source. The data source is not loaded!',
      );
    }
  }

  protected applyChanges(changes: IterableChanges<Data>) {
    const insertTuples: RecordViewTuple<Data>[] = [];
    changes.forEachOperation(
      (
        item: IterableChangeRecord<any>,
        adjustedPreviousIndex: number | null,
        currentIndex: number | null,
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
              -1,
            ),
            currentIndex === null ? undefined : currentIndex,
          );
          const tuple = new RecordViewTuple<Data>(item, view);
          insertTuples.push(tuple);
        } else if (currentIndex == null) {
          this.viewContainerRef.remove(
            adjustedPreviousIndex === null ? undefined : adjustedPreviousIndex,
          );
        } else if (adjustedPreviousIndex !== null) {
          const view = this.viewContainerRef.get(adjustedPreviousIndex)!;
          this.viewContainerRef.move(view, currentIndex);
          const tuple = new RecordViewTuple(
            item,
            <EmbeddedViewRef<DataSourceCollectionTemplateContext<Data>>>view,
          );
          insertTuples.push(tuple);
        }
      },
    );

    for (let i = 0; i < insertTuples.length; i++) {
      this.perViewChange(insertTuples[i].view, insertTuples[i].record);
    }

    for (let i = 0,
           ilen = this.viewContainerRef.length; i < ilen; i++) {
      const viewRef = <
        EmbeddedViewRef<DataSourceCollectionTemplateContext<Data>>
        >this.viewContainerRef.get(i);
      viewRef.context.index = i;
      viewRef.context.count = ilen;
      viewRef.context.connection$ = this.connection$!;
      // the context is mutated from an effect and is not a signal. Without zone.js the embedded
      // view would not be refreshed by the targeted change detection run and would show stale values
      viewRef.markForCheck();
    }

    changes.forEachIdentityChange((record: any) => {
      const viewRef = <
        EmbeddedViewRef<DataSourceCollectionTemplateContext<Data>>
        >this.viewContainerRef.get(record.currentIndex);
      viewRef.context.$implicit = record.item;
      viewRef.markForCheck();
    });
  }

  protected loadDataSource(): BaseDataSource<Data[]> | null {
    let dataSource: BaseDataSource | null = null;
    const dataSourceOrIdOrToken = this.dataSourceOrIdOrToken();
    if (typeof dataSourceOrIdOrToken === 'string') {
      dataSource = this.dataSourceLoader.load<BaseDataSource<Data[]>>(
        dataSourceOrIdOrToken,
        undefined,
        this.injector,
      );
    } else if (dataSourceOrIdOrToken instanceof BaseDataSource) {
      dataSource = dataSourceOrIdOrToken;
    } else if (dataSourceOrIdOrToken !== null) {
      dataSource = this.injector.get<BaseDataSource<Data[]>>(
        dataSourceOrIdOrToken,
      );
    }
    this._dataSourceLoadingSubscription?.unsubscribe();
    this._dataSourceLoadingSubscription =
      dataSource?.loading$.pipe(filter(Boolean)).subscribe(() => this.loaded.emit()) ?? null;
    return dataSource;
  }

  private perViewChange(
    view: EmbeddedViewRef<DataSourceCollectionTemplateContext<Data>>,
    record: IterableChangeRecord<any>,
  ) {
    view.context.$implicit = record.item;
  }

}


