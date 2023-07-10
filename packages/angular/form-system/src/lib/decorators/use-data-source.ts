import { BaseDataSource } from '@rxap/data-source';
import { FormSystemMetadataKeys } from './metadata-keys';
import { IdOrInstanceOrToken } from '@rxap/definition';
import { setMetadataMapMap } from '@rxap/reflect-metadata';

export interface UseDataSourceSettings<Source = any, Target = Source> {
  transformer?: (source: Source) => Target;
}

export interface UseDataSourceValue<Source = any, Target = Source> {
  dataSource: IdOrInstanceOrToken<BaseDataSource>,
  settings?: UseDataSourceSettings<Source, Target>,

  /**
   * The last value of the data source
   */
  lastValue?: Target,
}

export function UseDataSource<Data>(
  dataSource: IdOrInstanceOrToken<BaseDataSource<Data>>,
  name: string,
  settings?: UseDataSourceSettings,
) {
  return function (target: any, propertyKey: string) {
    const value: UseDataSourceValue<Data> = {
      dataSource,
      settings,
    };
    setMetadataMapMap(propertyKey, name, value, FormSystemMetadataKeys.DATA_SOURCES, target);
  };
}
