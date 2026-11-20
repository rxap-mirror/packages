import { Injectable, inject } from '@angular/core';
import {
  BaseDataSource,
  BaseDataSourceMetadata,
  RxapDataSource,
} from './base.data-source';
import { Observable } from 'rxjs';
import {
  RXAP_DATA_SOURCE_METADATA,
  RXAP_OBSERVABLE_DATA_SOURCE,
} from './tokens';
import { Constructor } from '@rxap/utilities';

export interface ObservableDataSourceMetadata<Data> extends BaseDataSourceMetadata {
  data?: Observable<Data>;
}

@Injectable()
export class ObservableDataSource<Data> extends BaseDataSource<Data, ObservableDataSourceMetadata<Data>> {

  constructor() {
    const observable = inject<Observable<Data> | null>(RXAP_OBSERVABLE_DATA_SOURCE, { optional: true });
    const metadata = inject<ObservableDataSourceMetadata<Data> | null>(RXAP_DATA_SOURCE_METADATA, { optional: true }) ?? null;

    super(metadata);
    if (observable) {
      this._data$ = observable;
    } else if (this.metadata.data) {
      this._data$ = this.metadata.data;
    }
  }

}

export function RxapObservableDataSource<Data>(
  metadata: ObservableDataSourceMetadata<Data>,
  className = 'ObservableDataSource',
  packageName = '@rxap/data-source',
) {
  return function (target: Constructor<ObservableDataSource<Data>>) {
    RxapDataSource(metadata, className, packageName)(target);
  };
}

export function observableDataSource<Data>(
  data: Observable<Data>,
  metadata: ObservableDataSourceMetadata<Data> = { id: 'static' },
): ObservableDataSource<Data> {
  return new ObservableDataSource(data, metadata);
}
