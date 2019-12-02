import {
  Injector,
  InjectFlags,
  Injectable
} from '@angular/core';
import { Type } from '@rxap/utilities';
import {
  BaseDataSource,
  RXAP_DATA_SOURCE_ID_TOKEN
} from './base.data-source';
import {
  getDataSourceId,
  DataSourceRegistry
} from './data-source-registry';

@Injectable({ providedIn: 'root' })
export class DataSourceLoader {

  public static build<T extends BaseDataSource<any>>(dataSourceType: Type<T>, injector?: Injector, dataSourceId?: string): T {

    if (!dataSourceId) {
      dataSourceId = getDataSourceId(dataSourceType);
    }

    if (!dataSourceId) {
      throw new Error('DataSource has not a id');
    }

    return injector ? Injector.create({
      parent:    injector,
      providers: [
        {
          provide:  RXAP_DATA_SOURCE_ID_TOKEN,
          useValue: dataSourceId
        }
      ]
    }).get(dataSourceType, new dataSourceType(dataSourceId), InjectFlags.Optional) : new dataSourceType(dataSourceId);

  }

  constructor(
    public readonly injector: Injector,
    public readonly dataSourceRegistry: DataSourceRegistry
  ) {}

  public load<T extends BaseDataSource<any>>(dataSourceId: string, injector?: Injector): T;
  // tslint:disable-next-line:unified-signatures
  public load<T extends BaseDataSource<any>>(dataSourceType: Type<T>, injector?: Injector): T;
  public load<T extends BaseDataSource<any>>(
    dataSourceIdOrType: string | Type<T>,
    injector: Injector = this.injector
  ): T {

    let dataSourceType: Type<T>;
    let dataSourceId: string;

    if (typeof dataSourceIdOrType === 'string') {
      dataSourceType = this.dataSourceRegistry.get<T>(dataSourceIdOrType);
      dataSourceId   = dataSourceIdOrType;
    } else {
      dataSourceType = dataSourceIdOrType;
      dataSourceId   = getDataSourceId(dataSourceType);
    }

    return DataSourceLoader.build(dataSourceType, injector, dataSourceId);
  }

}
