import {
  Directive,
  TemplateRef,
  Inject,
  Input,
  Injector,
  INJECTOR,
  ViewContainerRef,
  ChangeDetectorRef,
  NgModule,
  SimpleChanges,
  OnChanges,
  EmbeddedViewRef,
  TrackByFunction,
  isDevMode,
  IterableDiffer,
  IterableDiffers,
  IterableChanges,
  IterableChangeRecord,
  DoCheck,
  OnInit,
  NgZone
} from '@angular/core';
import {
  BaseRemoteMethod,
  BaseRemoteMethodMetadata,
  RemoteMethodLoader
} from '@rxap/remote-method';
import { Required } from '@rxap/utilities';
import { IdOrInstanceOrToken } from '@rxap/definition';
import {
  first,
  tap,
  take
} from 'rxjs/operators';

export class RemoteMethodTemplateCollectionDirectiveContext<ReturnType = any> {
  constructor(
    public $implicit: ReturnType,
    public index: number,
    public count: number,
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

export interface RemoteMethodTemplateCollectionDirectiveErrorContext {
  $implicit: Error;
  message?: string;
  name?: string;
}

function getTypeName(type: any): string {
  return type['name'] || typeof type;
}

class RecordViewTuple<T> {
  constructor(public record: any, public view: EmbeddedViewRef<RemoteMethodTemplateCollectionDirectiveContext<T>>) {}
}

@Directive({
  selector: '[rxapRemoteMethodCollection]',
  exportAs: 'rxapRemoteMethodCollection'
})
export class RemoteMethodTemplateCollectionDirective<ReturnType = any,
  Parameters = any,
  Metadata extends BaseRemoteMethodMetadata = BaseRemoteMethodMetadata>
  implements OnChanges, DoCheck, OnInit {

  /**
   * Asserts the correct type of the context for the template that `NgForOf` will render.
   *
   * The presence of this method is a signal to the Ivy template type-check compiler that the
   * `NgForOf` structural directive renders its template with a specific context type.
   */
  static ngTemplateContextGuard<T>(dir: RemoteMethodTemplateCollectionDirective<T>, ctx: any):
    ctx is RemoteMethodTemplateCollectionDirectiveContext<T> {
    return true;
  }

  @Input('rxapRemoteMethodCollectionCall')
  public set remoteMethodOrIdOrToken(value: IdOrInstanceOrToken<BaseRemoteMethod<ReturnType[], Parameters, Metadata>>) {
    if (value) {
      this._remoteMethodOrIdOrToken = value;
    }
  }

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
  @Input('rxapRemoteMethodCollectionTrackBy')
  set trackBy(fn: TrackByFunction<ReturnType>) {
    if (isDevMode() && fn != null && typeof fn !== 'function') {
      // TODO(vicb): use a log service once there is a public one available
      if (<any>console && <any>console.warn) {
        console.warn(
          `trackBy must be a function, but received ${JSON.stringify(fn)}. ` +
          `See https://angular.io/api/common/NgForOf#change-propagation for more information.`);
      }
    }
    this._trackByFn = fn;
  }

  get trackBy(): TrackByFunction<ReturnType> {
    return this._trackByFn;
  }

  @Input('rxapRemoteMethodCollectionParameters')
  public parameters?: Parameters;

  @Input('rxapRemoteMethodCollectionEmpty')
  public emptyTemplate?: TemplateRef<void>;

  @Input('rxapRemoteMethodCollectionError')
  public errorTemplate?: TemplateRef<RemoteMethodTemplateCollectionDirectiveErrorContext>;

  @Input('rxapRemoteMethodCollectionWithoutParameters')
  public withoutParameters: boolean = false;

  @Required
  protected _remoteMethodOrIdOrToken!: IdOrInstanceOrToken<BaseRemoteMethod<ReturnType[], Parameters, Metadata>>;

  protected set data(data: ReturnType[]) {
    this._data  = data;
    this._dirty = true;
  }

  private _differ: IterableDiffer<ReturnType> | null = null;
  private _trackByFn!: TrackByFunction<ReturnType>;

  /**
   * Holds the data that should be displayed
   * @private
   */
  private _data: ReturnType[] | null = null;
  private _dirty = true;

  /**
   * Indicates that the remote method returned a empty collection
   *
   * true - is empty
   * false - is NOT empty
   * null - unknown
   *
   * @private
   */
  private _empty: boolean | null = null;

  /**
   * Holds the error that call of the remote method throws
   *
   * @private
   */
  private _error: Error | null = null;

  /**
   * Holds the empty template view ref.
   *
   * Is used to determine if a empty template is added to the
   * view. And used to destruct the empty template if the remote method
   * changes from empty to not empty.
   *
   * @private
   */
  private _emptyTemplateViewRef: EmbeddedViewRef<void> | null = null;

  /**
   * Holds the error template view ref.
   *
   * Is used to determine if a error template is added to the
   * view. And used to destruct the error template if the remote method
   * is called again with an error.
   *
   * @private
   */
  private _errorTemplateViewRef: EmbeddedViewRef<RemoteMethodTemplateCollectionDirectiveErrorContext> | null = null;

  constructor(
    @Inject(TemplateRef)
    private readonly template: TemplateRef<RemoteMethodTemplateCollectionDirectiveContext<ReturnType>>,
    @Inject(RemoteMethodLoader)
    protected readonly remoteMethodLoader: RemoteMethodLoader,
    @Inject(INJECTOR)
    private readonly injector: Injector,
    @Inject(ViewContainerRef)
    private readonly viewContainerRef: ViewContainerRef,
    @Inject(ChangeDetectorRef)
    protected readonly cdr: ChangeDetectorRef,
    @Inject(IterableDiffers)
    private readonly differs: IterableDiffers,
    @Inject(NgZone)
    private readonly zone: NgZone
  ) { }

  public ngOnChanges(changes: SimpleChanges) {
    const parametersChanges = changes.parameters;
    if (parametersChanges) {
      this.call(parametersChanges.currentValue);
    }
  }

  public ngOnInit() {
    if (this.withoutParameters) {
      this.call();
    }
  }

  public call(parameters?: Parameters): void {
    this.zone.onStable.pipe(
      take(1),
      tap(() => {
        this.zone.run(() => {
          this.remoteMethodLoader
              .call$(this._remoteMethodOrIdOrToken, parameters, undefined, this.injector)
              .then(response => {
                this._empty = response.length === 0;
                this._data  = response;
                this.cdr.detectChanges();
              })
              .catch(error => {
                this._error = error;
                this.cdr.detectChanges();
              });
        });
      })
    ).subscribe();
  }

  protected applyChanges(changes: IterableChanges<ReturnType>) {

    const insertTuples: RecordViewTuple<ReturnType>[] = [];
    changes.forEachOperation(
      (item: IterableChangeRecord<any>, adjustedPreviousIndex: number | null, currentIndex: number | null) => {

        if (item.previousIndex == null) {

          // NgForOf is never "null" or "undefined" here because the differ detected
          // that a new item needs to be inserted from the iterable. This implies that
          // there is an iterable value for "_ngForOf".
          const view = this.viewContainerRef.createEmbeddedView(
            this.template,
            new RemoteMethodTemplateCollectionDirectiveContext<ReturnType>(null!, -1, -1),
            currentIndex === null ? undefined : currentIndex
          );
          const tuple = new RecordViewTuple<ReturnType>(item, view);
          insertTuples.push(tuple);

        } else if (currentIndex == null) {

          this.viewContainerRef.remove(adjustedPreviousIndex === null ? undefined : adjustedPreviousIndex);

        } else if (adjustedPreviousIndex !== null) {

          const view = this.viewContainerRef.get(adjustedPreviousIndex)!;
          this.viewContainerRef.move(view, currentIndex);
          const tuple = new RecordViewTuple(item, <EmbeddedViewRef<RemoteMethodTemplateCollectionDirectiveContext<ReturnType>>>view);
          insertTuples.push(tuple);

        }

      });

    for (let i = 0; i < insertTuples.length; i++) {
      this.perViewChange(insertTuples[i].view, insertTuples[i].record);
    }

    for (let i = 0, ilen = this.viewContainerRef.length; i < ilen; i++) {
      const viewRef = <EmbeddedViewRef<RemoteMethodTemplateCollectionDirectiveContext<ReturnType>>>this.viewContainerRef.get(i);
      viewRef.context.index = i;
      viewRef.context.count = ilen;
    }

    changes.forEachIdentityChange((record: any) => {
      const viewRef =
              <EmbeddedViewRef<RemoteMethodTemplateCollectionDirectiveContext<ReturnType>>>this.viewContainerRef.get(record.currentIndex);
      viewRef.context.$implicit = record.item;
    });

  }

  private perViewChange(
    view: EmbeddedViewRef<RemoteMethodTemplateCollectionDirectiveContext<ReturnType>>, record: IterableChangeRecord<any>) {
    view.context.$implicit = record.item;
  }

  /**
   * Applies the changes when needed.
   */
  public ngDoCheck(): void {
    if (this._error !== null) {

      this.viewContainerRef.clear();
      this._differ = null;

      if (this.errorTemplate) {
        this._errorTemplateViewRef = this.viewContainerRef.createEmbeddedView(this.errorTemplate, { $implicit: this._error, message: this._error.message, name: this._error.name });
      }

    } else if (this._empty === true) {

      this.viewContainerRef.clear();
      this._differ = null;

      // attaches the empty template if the data source is empty
      if (this.emptyTemplate) {
        this._emptyTemplateViewRef = this.viewContainerRef.createEmbeddedView(this.emptyTemplate);
      }

    } else if (this._empty === false) {

      // detach and destroy the empty template if the data source is not
      // empty any more
      if (this._emptyTemplateViewRef) {
        this._emptyTemplateViewRef.detach();
        this._emptyTemplateViewRef.destroy();
        this._errorTemplateViewRef = null;
      }

      if (this._errorTemplateViewRef) {
        this._errorTemplateViewRef.detach();
        this._errorTemplateViewRef.destroy();
        this._errorTemplateViewRef = null;
      }

      if (this._data) {
        this._dirty = false;
        // React on ngForOf changes only once all inputs have been initialized
        const value = this._data;
        if (!this._differ && value) {
          try {
            this._differ = this.differs.find(value).create(this.trackBy);
          } catch {
            throw new Error(`Cannot find a differ supporting object '${value}' of type '${
              getTypeName(value)}'. NgFor only supports binding to Iterables such as Arrays.`);
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

}

@NgModule({
  declarations: [RemoteMethodTemplateCollectionDirective],
  exports: [RemoteMethodTemplateCollectionDirective]
})
export class RemoteMethodTemplateCollectionDirectiveModule {}
