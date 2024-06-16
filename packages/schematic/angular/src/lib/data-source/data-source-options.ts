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


export function IsNormalizedImportDataSourceOptions(options?: NormalizedDataSourceOptions | null): options is NormalizedImportDataSourceOptions {
  return !!options && options.kind === DataSourceKinds.IMPORT;
}

export function AssertIsNormalizedImportDataSourceOptions(options: NormalizedDataSourceOptions): asserts options is NormalizedImportDataSourceOptions {
  if (!IsNormalizedImportDataSourceOptions(options)) {
    throw new Error('The options are not a normalized import data source options');
  }
}
