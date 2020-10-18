import {
  Observable,
  TeardownLogic,
  EMPTY,
  Subject
} from 'rxjs';
import {
  BaseDefinition,
  BaseDefinitionMetadata,
  DefinitionMetadata
} from '@rxap/definition';
import {
  deepMerge,
  Constructor,
  clone
} from '@rxap/utilities';
import {
  first,
  takeUntil,
  finalize,
  tap
} from 'rxjs/operators';
import { Injectable } from '@angular/core';

export type DataSourceViewerId = string;

export interface BaseDataSourceViewer<View = any> {
  id?: DataSourceViewerId;
  viewChange?: Observable<View>;

  [ key: string ]: any;
}

// tslint:disable-next-line:no-empty-interface
export interface BaseDataSourceMetadata extends BaseDefinitionMetadata {}

@Injectable()
export class BaseDataSource<Data = any,
  Metadata extends BaseDataSourceMetadata = BaseDataSourceMetadata,
  Viewer extends BaseDataSourceViewer = BaseDataSourceViewer,
  > extends BaseDefinition<Metadata> {

  public get data() {
    return clone(this._data);
  }

  protected _connectedViewer         = new Map<DataSourceViewerId, Observable<Data>>();
  protected _connectedViewerTeardown = new Map<DataSourceViewerId, TeardownLogic>();
  protected _data$: Observable<Data> = EMPTY;

  protected _data?: Data;

  public readonly change$ = new Subject<Data>();

  /**
   * Indicates weather the data source is currently loading new data
   */
  public loading$: Observable<boolean> = EMPTY;

  public get hasConnections(): boolean {
    return this._connectedViewer.size > 0;
  }

  public getViewerId(viewer: Viewer): string {
    return 'static';
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
    const _connection                       = this._connect(viewer);
    let connection: Observable<Data>;
    let teardownLogic: TeardownLogic | null = null;
    if (Array.isArray(_connection)) {
      if (_connection.length !== 2) {
        throw new Error('if this._connect returns an array. The array should have two items');
      }
      connection    = _connection[ 0 ];
      teardownLogic = _connection[ 1 ];
    } else {
      connection = _connection;
    }

    const destroy$ = new Subject();

    connection = connection.pipe(
      tap(data => this._data = data),
      tap(data => this.change$.next(data)),
      finalize(() => this.disconnect(viewer)),
      takeUntil(destroy$)
    );

    this._connectedViewer.set(viewer.id, connection);

    if (teardownLogic) {
      const tl      = teardownLogic;
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

  public isConnected(viewerOrId: Viewer | DataSourceViewerId): boolean {
    const viewerId = typeof viewerOrId === 'string' ? viewerOrId : viewerOrId.id ?? this.getViewerId(viewerOrId);
    return this._connectedViewer.has(viewerId);
  }

  public disconnect(viewerOrId: Viewer | DataSourceViewerId) {
    const viewerId = typeof viewerOrId === 'string' ? viewerOrId : viewerOrId.id ?? this.getViewerId(viewerOrId);
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
      console.warn(`Connection with viewer id '${viewerId}' is not connected to the data source '${this.id}'`);
    }
  }

  protected _connect(viewer: BaseDataSourceViewer): [ Observable<Data>, TeardownLogic ] | Observable<Data> {
    this.init();
    return this._data$;
  }

  protected _disconnect(viewerId: DataSourceViewerId): void {}

  /**
   * Creates a connection to tha data source and converts the Observable into a
   * promise.
   *
   * @param viewer
   */
  public toPromise(viewer: Viewer): Promise<Data> {
    return this.connect(viewer).pipe(
      first()
    ).toPromise().then(result => {
      this.disconnect(viewer);
      return result;
    });
  }

  public derive(id: string, metadata: Partial<BaseDataSourceMetadata> = this.metadata): BaseDataSource<any> {
    return new BaseDataSource<any>({ ...deepMerge(this.metadata, metadata), id });
  }

  public refresh(): any {}

  public reset(): any {
    for (const viewerId of this._connectedViewer.keys()) {
      this.disconnect(viewerId);
    }
    if (this.metadata.hasOwnProperty('context')) {
      delete this.metadata.context;
    }
  }

  public toJSON(): object {
    return {
      id:        this.id,
      metadata:  this.metadata,
      connected: this._connectedViewer.keys(),
      data:      this._data
    };
  }

}

export function RxapDataSource<Metadata extends BaseDataSourceMetadata>(
  dataSourceIdOrMetadata: string | Metadata,
  className: string   = 'BaseDataSource',
  packageName: string = '@rxap/data-source'
) {
  return function(target: Constructor<BaseDataSource>) {
    DefinitionMetadata(dataSourceIdOrMetadata, className, packageName)(target);
  };
}
