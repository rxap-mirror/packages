import {
  Inject,
  Injectable,
  isDevMode,
  Optional,
} from '@angular/core';
import {
  BaseDefinition,
  BaseDefinitionMetadata,
  DefinitionMetadata,
  RXAP_DEFINITION_METADATA,
} from '@rxap/definition';
import {
  CloneObservable,
  ToggleSubject,
} from '@rxap/rxjs';
import {
  clone,
  Constructor,
  deepMerge,
  GenerateRandomString,
} from '@rxap/utilities';
import {
  EMPTY,
  firstValueFrom,
  Observable,
  ReplaySubject,
  Subject,
  TeardownLogic,
} from 'rxjs';
import {
  finalize,
  startWith,
  take,
  takeUntil,
  tap,
} from 'rxjs/operators';

export type DataSourceViewerId = string;

export interface BaseDataSourceViewer<View = any> {
  id?: DataSourceViewerId;
  viewChange?: Observable<View>;
  /**
   * Indicates weather the data source should restore the last value from local storage
   */
  restore?: boolean;

  [key: string]: any;
}

export interface BaseDataSourceMetadata extends BaseDefinitionMetadata {
  /**
   * Indicates weather the data source should restore the last value from local storage
   */
  restore?: boolean;
}

@Injectable()
export class BaseDataSource<
  Data = any,
  Metadata extends BaseDataSourceMetadata = BaseDataSourceMetadata,
  Viewer extends BaseDataSourceViewer = BaseDataSourceViewer
> extends BaseDefinition<Metadata> {
  public readonly change$ = new Subject<Data>();
  /**
   * Indicates weather the data source is currently loading new data
   */
  public loading$: Observable<boolean> = EMPTY;
  public readonly hasError$ = new ToggleSubject();
  public readonly error$ = new ReplaySubject<Error>(1);
  protected _connectedViewer = new Map<DataSourceViewerId, Observable<Data>>();
  protected _connectedViewerTeardown = new Map<
    DataSourceViewerId,
    TeardownLogic
  >();
  protected _data$: Observable<Data> = EMPTY;
  /**
   * a map of viewer to view id.
   * Allows to create a view id from the viewer object reference
   * @protected
   */
  protected _viewerIds = new Map<Viewer, string>();
  protected _retry$ = new Subject<void>();

  constructor(
    @Optional()
    @Inject(RXAP_DEFINITION_METADATA)
      metadata: Metadata | null = null,
  ) {
    super(metadata);
  }

  protected _data?: Data;

  public get data() {
    return clone(this._data);
  }

  public get hasConnections(): boolean {
    return this._connectedViewer.size > 0;
  }

  public getViewerId(viewer: Viewer): string {
    if (viewer.id) {
      return viewer.id;
    }
    if (!this._viewerIds.has(viewer)) {
      this._viewerIds.set(viewer, GenerateRandomString());
    }
    return this._viewerIds.get(viewer)!;
  }

  public connect(viewer: Viewer): Observable<Data> {
    if (!viewer.id) {
      viewer.id = this.getViewerId(viewer);
    }
    if (this.isConnected(viewer)) {
      return this._connectedViewer.get(viewer.id)!;
    }
    if (!viewer.viewChange) {
      viewer.viewChange = EMPTY;
    }
    const _connection = this._connect(viewer);
    let connection: Observable<Data>;
    let teardownLogic: TeardownLogic | null = null;
    if (Array.isArray(_connection)) {
      if (_connection.length !== 2) {
        throw new Error(
          'if this._connect returns an array. The array should have two items',
        );
      }
      connection = _connection[0];
      teardownLogic = _connection[1];
    } else {
      connection = _connection;
    }

    const destroy$ = new Subject<void>();

    const cacheKey = [ 'rxap', 'data-source', this.constructor.name, this.id ].join('_');
    const restore = viewer.restore ?? this.metadata.restore ?? false;

    connection = connection.pipe(
      tap((data) => {
        this._data = data;
        if (restore) {
          try {
            const cache = JSON.stringify(data);
            localStorage.setItem(cacheKey, cache);
          } catch (e: any) {
            console.warn(
              `Failed to store data source '${ this.id }' data in local storage`,
            );
          }
        }
      }),
      tap((data) => this.change$.next(data)),
      finalize(() => this.disconnect(viewer)),
      takeUntil(destroy$),
    );

    if (restore) {
      const data = localStorage.getItem(cacheKey);
      if (data) {
        this._data = JSON.parse(data) as Data;
        connection = connection.pipe(startWith(this._data));
      }
    }

    this._connectedViewer.set(viewer.id, connection);

    if (teardownLogic) {
      const tl = teardownLogic;
      teardownLogic = () => {
        destroy$.next();
        if (typeof tl === 'function') {
          tl();
        } else {
          tl.unsubscribe();
        }
      };
    } else {
      teardownLogic = () => {
        destroy$.next();
      };
    }

    this._connectedViewerTeardown.set(viewer.id, teardownLogic);
    return connection;
  }

  public attach(viewerId: DataSourceViewerId): Observable<Data> {
    if (this.isConnected(viewerId)) {
      return CloneObservable(this._connectedViewer.get(viewerId)!);
    }
    throw new Error(`No active connection with viewer id '${ viewerId }' found`);
  }

  public isConnected(viewerOrId: Viewer | DataSourceViewerId): boolean {
    const viewerId =
      typeof viewerOrId === 'string'
        ? viewerOrId
        : viewerOrId.id ?? this.getViewerId(viewerOrId);
    return this._connectedViewer.has(viewerId);
  }

  public disconnect(viewerOrId: Viewer | DataSourceViewerId) {
    const viewerId =
      typeof viewerOrId === 'string'
        ? viewerOrId
        : viewerOrId.id ?? this.getViewerId(viewerOrId);
    if (this.isConnected(viewerId)) {
      this._disconnect(viewerId);
      this._connectedViewer.delete(viewerId);
      if (this._connectedViewerTeardown.has(viewerId)) {
        const teardownLogic = this._connectedViewerTeardown.get(viewerId)!;
        if (teardownLogic) {
          if (typeof teardownLogic === 'function') {
            teardownLogic();
          } else {
            teardownLogic.unsubscribe();
          }
        }
      }
    } else {
      console.warn(
        `Connection with viewer id '${ viewerId }' is not connected to the data source '${ this.id }'`,
      );
    }
    // TODO : find better cleanup solution
    if (typeof viewerOrId === 'string') {
      for (const [ viewer, id ] of this._viewerIds.entries()) {
        if (viewerOrId === id) {
          this._viewerIds.delete(viewer);
        }
      }
    } else {
      this._viewerIds.delete(viewerOrId);
    }
  }

  /**
   * Creates a connection to tha data source and converts the Observable into a
   * promise and then disconnects the viewer
   */
  public async toPromise(viewer: Viewer): Promise<Data> {
    const result = await firstValueFrom(this.connect(viewer).pipe(take(1)));
    this.disconnect(viewer);
    return result;
  }

  public derive(
    id: string,
    metadata: Partial<BaseDataSourceMetadata> = this.metadata,
  ): BaseDataSource<any> {
    return new BaseDataSource<any>({
      ...deepMerge(this.metadata, metadata),
      id,
    });
  }

  public toJSON(): object {
    return {
      id: this.id,
      metadata: this.metadata,
      connected: this._connectedViewer.keys(),
      data: this._data,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public refresh(): any {
  }

  public retry(): any {
    this._retry$.next();
  }

  public reset(): any {
    for (const viewerId of this._connectedViewer.keys()) {
      this.disconnect(viewerId);
    }
    // eslint-disable-next-line no-prototype-builtins
    if (this.metadata.hasOwnProperty('context')) {
      delete this.metadata['context'];
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected _disconnect(viewerId: DataSourceViewerId): void {
  }

  protected genericRetryFunction(error: any, retryCount: number): Observable<any> {
    return this._retry$.asObservable().pipe(
      tap(() => this.hasError$.disable()),
    );
  }

  protected handelError(error: any) {
    if (isDevMode()) {
      console.log(`DataSource '${ this.id }' has an error:`, error);
    }
  }

  protected _connect(
    viewer: BaseDataSourceViewer,
  ): [ Observable<Data>, TeardownLogic ] | Observable<Data> {
    this.init();
    return this._data$;
  }
}

export function RxapDataSource<Metadata extends BaseDataSourceMetadata>(
  dataSourceIdOrMetadata: string | Metadata,
  className = 'BaseDataSource',
  packageName = '@rxap/data-source',
) {
  return function (target: Constructor<BaseDataSource>) {
    DefinitionMetadata(dataSourceIdOrMetadata, className, packageName)(target);
  };
}
