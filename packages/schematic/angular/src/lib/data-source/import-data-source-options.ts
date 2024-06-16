import {
  NormalizedTypeImport,
  NormalizeTypeImport,
  TypeImport,
} from '@rxap/ts-morph';
import { Normalized } from '@rxap/utilities';
import {
  BaseDataSourceOptions,
  NormalizeBaseDataSourceOptions,
  NormalizedBaseDataSourceOptions,
} from './base-data-source-options';
import { DataSourceKinds } from './data-source-kinds';

export interface ImportDataSourceOptions extends BaseDataSourceOptions {
  kind: DataSourceKinds;
  import?: TypeImport;
}

export interface NormalizedImportDataSourceOptions extends Readonly<Normalized<Omit<ImportDataSourceOptions, keyof BaseDataSourceOptions | 'import'>> & NormalizedBaseDataSourceOptions> {
  kind: DataSourceKinds.IMPORT;
  import: NormalizedTypeImport;
}

export function NormalizeImportDataSourceOptions(options: ImportDataSourceOptions): NormalizedImportDataSourceOptions {
  if (!options.import) {
    throw new Error('The import property is required for an import dataSource');
  }
  return Object.seal({
    ...NormalizeBaseDataSourceOptions(options),
    kind: DataSourceKinds.IMPORT,
    import: NormalizeTypeImport(options.import),
  });
}
