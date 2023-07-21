import {
  clone,
  Constructor,
  isPromise,
  isPromiseLike,
} from '@rxap/utilities';
import {
  isObservable,
  Observable,
  ReplaySubject,
  Subscription,
} from 'rxjs';
import {
  Inject,
  Injectable,
  OnDestroy,
  Optional,
} from '@angular/core';
import {
  RXAP_DATA_SOURCE_METADATA,
  RXAP_STATIC_DATA_SOURCE_DATA,
} from './tokens';
import {
  BaseDataSource,
  BaseDataSourceMetadata,
  RxapDataSource,
} from './base.data-source';
import { RxapDataSourceError } from './error';
import { tap } from 'rxjs/operators';

export type StaticDataSourceData<Data = any> =
  | Data
  | Promise<Data>
  | Observable<Data>
  | (() => Data);

export interface StaticDataSourceMetadata<Data = any>
  extends BaseDataSourceMetadata {
  data?: StaticDataSourceData<Data>;
}

@Injectable()
export class StaticDataSource<Data = any>
  extends BaseDataSource<Data, StaticDataSourceMetadata<Data>>
  implements OnDestroy {
  protected override _data$ = new ReplaySubject<Data>(1);
  private _dataSubscription?: Subscription;

  constructor(
    @Optional()
    @Inject(RXAP_STATIC_DATA_SOURCE_DATA)
      data: any | null,
    @Optional()
    @Inject(RXAP_DATA_SOURCE_METADATA)
      metadata: StaticDataSourceMetadata | null,
  ) {
    super(metadata);
    if ((data === undefined || data === null) && this.metadata.data !== undefined) {
      data = this.metadata.data;
    }
    if (data === undefined) {
      throw new RxapDataSourceError(
        `Can not create static data source '${ this.id }' with undefined as data`,
        '',
      );
    }
    if (isObservable(data)) {
      this._dataSubscription = (
        data as Observable<any>
      ).pipe(
        tap({
          next: data => this._data$.next(data),
          error: error => this.error$.next(error),
        }),
      ).subscribe();
    } else if (isPromiseLike(data)) {
      if (isPromise(data)) {
        data.then(data => this._data$.next(data)).catch((error) => this.error$.next(error));
      } else {
        data.then(data => this._data$.next(data));
      }
    } else if (typeof data === 'function') {
      // TODO : fix typeof function cast
      this._data$.next((this._data = (data as any)()));
    } else {
      this._data$.next((this._data = data));
    }
  }

  public override get data(): Data {
    return clone<Data>(this._data!);
  }

  public override set data(value: Data) {
    const data = clone(value);
    this._data = data;
    this._data$.next(data);
  }

  public override ngOnDestroy(): void {
    super.ngOnDestroy();
    this._dataSubscription?.unsubscribe();
  }

  protected override _connect(): Observable<Data> {
    this.init();
    return this._data$.asObservable();
  }

}

export function RxapStaticDataSource<Data>(
  metadata: StaticDataSourceMetadata<Data>,
  className = 'StaticDataSource',
  packageName = '@rxap/data-source',
) {
  return function (target: Constructor<StaticDataSource<Data>>) {
    RxapDataSource(metadata, className, packageName)(target);
  };
}

export function staticDataSource<Data>(
  data: StaticDataSourceData<Data>,
  metadata: StaticDataSourceMetadata<Data> = { id: 'static' },
): StaticDataSource<Data> {
  return new StaticDataSource(data, metadata);
}
