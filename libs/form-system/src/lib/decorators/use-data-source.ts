import {
  Constructor,
  setMetadataMapMap
} from '@rxap/utilities';
import { BaseDataSource } from '@rxap/data-source';
import { FormSystemMetadataKeys } from './metadata-keys';
import { IdOrInstanceOrToken } from '@rxap/definition';

export interface UseDataSourceSettings<Source = any, Target = any> {
  transformer: (source: Source) => Target;
}

export interface UseDataSourceValue<Source = any, Target = any> {
  dataSource: Constructor<IdOrInstanceOrToken<BaseDataSource>>,
  settings?: UseDataSourceSettings<Source, Target>,
}

export function UseDataSource(dataSource: Constructor<IdOrInstanceOrToken<BaseDataSource>>, name: string, settings?: UseDataSourceSettings) {
  return function(target: any, propertyKey: string) {
    const value: UseDataSourceValue = { dataSource, settings };
    setMetadataMapMap(propertyKey, name, value, FormSystemMetadataKeys.DATA_SOURCES, target);
  };
}
