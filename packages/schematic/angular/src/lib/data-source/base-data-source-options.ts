import { Normalized } from '@rxap/utilities';
import { DataSourceKinds } from './data-source-kinds';

export interface BaseDataSourceOptions {
  kind: DataSourceKinds;
}

export type NormalizedBaseDataSourceOptions = Readonly<Normalized<BaseDataSourceOptions>>;

export function NormalizeBaseDataSourceOptions(dataSource: BaseDataSourceOptions): NormalizedBaseDataSourceOptions {
  return Object.seal({
    kind: dataSource.kind ?? DataSourceKinds.DEFAULT,
  });
}
