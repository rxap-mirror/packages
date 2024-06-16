import {
  BaseDataSourceOptions,
  NormalizeBaseDataSourceOptions,
  NormalizedBaseDataSourceOptions,
} from './base-data-source-options';
import {
  ImportDataSourceOptions,
  NormalizedImportDataSourceOptions,
  NormalizeImportDataSourceOptions,
} from './import-data-source-options';
import { DataSourceKinds } from './data-source-kinds';

export type DataSourceOptions = BaseDataSourceOptions | ImportDataSourceOptions;

export type NormalizedDataSourceOptions = NormalizedBaseDataSourceOptions | NormalizedImportDataSourceOptions;

export function NormalizeDataSourceOptions(options?: DataSourceOptions): NormalizedDataSourceOptions | null {
  if (!options || Object.keys(options).length === 0) {
    return null;
  }
  switch (options.kind) {

    case DataSourceKinds.IMPORT:
      return NormalizeImportDataSourceOptions(options);

    default:
      return NormalizeBaseDataSourceOptions(options);

  }
}
