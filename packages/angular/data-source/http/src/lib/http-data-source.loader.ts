import { Injectable, InjectOptions, Injector, inject } from '@angular/core';
import { HttpDataSource } from './http.data-source';
import { HttpDataSourceOptions } from './http.data-source.options';
import { HttpDataSourceMetadata } from './http.data-source.metadata';
import {
  DataSourceLoader,
  RxapDataSourceError,
} from '@rxap/data-source';
import { IdOrInstanceOrToken } from '@rxap/definition';

@Injectable({ providedIn: 'root' })
export class HttpDataSourceLoader {
  private readonly dataSourceLoader = inject<DataSourceLoader>(DataSourceLoader);


  public request$<Data>(
    dataSourceIdOrInstanceOrToken: IdOrInstanceOrToken<HttpDataSource<Data>>,
    options?: HttpDataSourceOptions,
    merge = false,
    metadata?: Partial<HttpDataSourceMetadata>,
    injector?: Injector,
    notFoundValue?: HttpDataSource<Data>,
    flags?: InjectOptions,
  ): Promise<Data> {
    const dataSource = this
      .dataSourceLoader
      .load<HttpDataSource<Data>>(
        dataSourceIdOrInstanceOrToken,
        metadata,
        injector,
        notFoundValue,
        flags,
      );

    if (!(dataSource instanceof HttpDataSource)) {
      throw new RxapDataSourceError(`The data source is not a HttpDataSource`, '', 'HttpDataSourceLoader');
    }

    return dataSource.request$(options, merge);
  }

}
