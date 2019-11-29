import {
  Injectable,
  Inject,
  InjectionToken,
  Optional
} from '@angular/core';
import { DataSourceId } from './collection-data-source';
import {
  Observable,
  Subject,
  of,
  EMPTY,
  Subscriber
} from 'rxjs';
import {
  takeUntil,
  share,
  map,
  tap
} from 'rxjs/operators';
import {
  DataSourceError,
  DataSourceErrorTypes
} from './data-source.error';

export type DataSourceViewerId = string;

export interface IBaseDataSourceViewer {
  readonly id: DataSourceViewerId;
}

export const RXAP_DATA_SOURCE_TOKEN              = new InjectionToken('rxap/data-source');
export const RXAP_DATA_SOURCE_ID_TOKEN           = new InjectionToken('rxap/data-source/id');
export const RXAP_DATA_SOURCE_SOURCE_TOKEN       = new InjectionToken('rxap/data-source/source');
export const RXAP_DATA_SOURCE_TRANSFORMERS_TOKEN = new InjectionToken('rxap/data-source/transform');

export type DataSourceTransformerFunction<Data, Source = Data> = (source: Source) => Data;

export interface DataSourceTransformerToken<Data, Source = Data> {
  id: DataSourceId;
  transformer: DataSourceTransformerFunction<Data, Source>;
}

export interface IBaseDataSourceConnection<Data> extends Observable<Data> {
  unsubscribeAll(): void
}

export class BaseDataSourceConnection<Data> extends Observable<Data> implements IBaseDataSourceConnection<Data> {

  protected destroy$ = new Subject<void>();

  constructor(public readonly source$: Observable<Data>) {
    super((function(this: BaseDataSourceConnection<Data>, subscriber: Subscriber<Data>) {
      return source$.pipe(
        takeUntil(this.destroy$)
      ).subscribe(
        data => subscriber.next(data),
        error => subscriber.error(error),
        () => subscriber.complete()
      );
    }) as any);
  }

  public unsubscribeAll(): void {
    this.destroy$.next();
  }

}


@Injectable()
export class BaseDataSource<Data, Source = Data, Viewer extends IBaseDataSourceViewer = IBaseDataSourceViewer> {

  private _source!: Source;

  public get source(): Source {
    return this._source;
  }

  /**
   * Emits the DataSource collection data or null to indicate a new
   * collection data request
   */
  public readonly source$: Observable<Source>;
  private readonly viewers = new Map<DataSourceViewerId, IBaseDataSourceConnection<Data>>();

  public constructor(
    @Optional() @Inject(RXAP_DATA_SOURCE_ID_TOKEN) public readonly id: DataSourceId,
    @Optional() @Inject(RXAP_DATA_SOURCE_SOURCE_TOKEN) source: any | null             = null,
    @Optional() @Inject(RXAP_DATA_SOURCE_TRANSFORMERS_TOKEN) transformers: any | null = null
  ) {
    if (source) {
      if (source instanceof BaseDataSource) {
        this.source$ = source.connect(this.toViewer());
      } else if (source instanceof Observable) {
        this.source$ = source;
      } else {
        this.source$ = of(source);
      }
    } else {
      this.source$ = EMPTY;
    }
    this.source$.pipe(
      tap(s => this._source = s)
    ).subscribe();
    if (transformers !== null) {
      if (Array.isArray(transformers) && transformers.length) {
        const transform = transformers.find(t => t.id === this.id);
        if (transform) {
          console.log(`Use custom transformer for data source '${this.id}'`);
          this.transformer = transform.transformer;
        }
      } else if (typeof transformers === 'function') {
        this.transformer = transformers;
      }
    }
  }

  public toViewer(): IBaseDataSourceViewer {
    if (!this.id) {
      throw new DataSourceError(DataSourceErrorTypes.NO_DATA_SOURCE_ID);
    }
    return { id: this.id };
  }

  public hasViewer(viewerId: DataSourceViewerId): boolean {
    return this.viewers.has(viewerId);
  }

  public connect(viewer: Viewer): IBaseDataSourceConnection<Data> {

    const connection = new BaseDataSourceConnection(this._connect(viewer).pipe(
      map(source => this.transformer(source)),
      share()
    ));

    this.registerConnection(viewer, connection);

    return connection;
  }

  public disconnect(viewerOrId: Viewer | DataSourceViewerId): void {

    const viewerId = typeof viewerOrId === 'string' ? viewerOrId : viewerOrId.id;

    if (!this.viewers.has(viewerId)) {
      throw new Error(`The DataSourceViewer '${viewerId}' is NOT connected to the DataSource '${this.id}'!`);
    }

    // tslint:disable-next-line:no-non-null-assertion
    const connection = this.viewers.get(viewerId)!;
    this.viewers.delete(viewerId);

    connection.unsubscribeAll();

  }

  protected registerConnection(viewer: Viewer, connection: IBaseDataSourceConnection<Data>): void {
    if (this.viewers.has(viewer.id)) {
      throw new Error(`The DataSourceViewer '${viewer.id}' is already connected to the DataSource '${this.id}'!`);
    }

    this.viewers.set(viewer.id, connection);
  }

  public transformer(source: Source): Data {
    return source as any;
  }

  protected _connect(viewer: Viewer): Observable<Source> {
    return this.source$;
  }

}

