import {
  clone,
  isPromiseLike,
  Constructor
} from '@rxap/utilities';
import {
  ReplaySubject,
  Observable,
  isObservable,
  Subscription
} from 'rxjs';
import {
  Optional,
  Inject,
  OnDestroy,
  Injectable
} from '@angular/core';
import {
  RXAP_STATIC_DATA_SOURCE_DATA,
  RXAP_DATA_SOURCE_METADATA
} from './tokens';
import {
  BaseDataSource,
  BaseDataSourceMetadata,
  RxapDataSource
} from './base.data-source';
import { RxapDataSourceError } from './error';

export type StaticDataSourceData<Data = any> = Data | Promise<Data> | Observable<Data> | (() => Data);

export interface StaticDataSourceMetadata<Data = any> extends BaseDataSourceMetadata {
  data?: StaticDataSourceData<Data>;
}

@Injectable()
export class StaticDataSource<Data>
  extends BaseDataSource<Data, StaticDataSourceMetadata<Data>>
  implements OnDestroy {

  public set data(value: Data) {
    const data = clone(value);
    this._data = data;
    this._data$.next(data);
  }

  public get data(): Data {
    return clone<Data>(this._data!);
  }

  protected _data$ = new ReplaySubject<Data>(1);
  private _dataSubscription?: Subscription;

  constructor(
    @Optional() @Inject(RXAP_STATIC_DATA_SOURCE_DATA) data: any | null                       = null,
    @Optional() @Inject(RXAP_DATA_SOURCE_METADATA) metadata: StaticDataSourceMetadata | null = null
  ) {
    super(metadata);
    if (data === null || data === undefined) {
      data = this.metadata.data || null;
    }
    if (data === null || data === undefined) {
      throw new RxapDataSourceError(`Can not create static data source '${this.id}' with undefined or null as data`, '');
    }
    if (isObservable<any>(data)) {
      // TODO : handle catchError
      this._dataSubscription = data.subscribe(this._data$);
    } else if (isPromiseLike(data)) {
      // TODO : handle promise rejection
      data.then(d => this._data$.next(d));
    } else if (typeof data === 'function') {
      // TODO : fix typeof function cast
      this._data$.next(this._data = (data as any)());
    } else {
      this._data$.next(this._data = data);
    }

  }

  public ngOnDestroy(): void {
    super.ngOnDestroy();
    this._dataSubscription?.unsubscribe();
  }

}

export function RxapStaticDataSource<Data>(
  metadata: StaticDataSourceMetadata<Data>,
  className: string = 'StaticDataSource',
  packageName: string = '@rxap/data-source'
) {
  return function(target: Constructor<StaticDataSource<Data>>) {
    RxapDataSource(metadata, className, packageName)(target);
  };
}

export function staticDataSource<Data>(
  data: StaticDataSourceData<Data>,
  metadata: StaticDataSourceMetadata<Data> = { id: 'static' }
): StaticDataSource<Data> {
  return new StaticDataSource(data, metadata);
}
