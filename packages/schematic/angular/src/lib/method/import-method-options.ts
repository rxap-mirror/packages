import {
  NormalizedTypeImport,
  NormalizeTypeImport,
  TypeImport,
} from '@rxap/ts-morph';
import { Normalized } from '@rxap/utilities';
import {
  BaseMethodOptions,
  NormalizeBaseMethodOptions,
  NormalizedBaseMethodOptions,
} from './base-method-options';
import { MethodKinds } from './method-kinds';

export interface ImportMethodOptions extends BaseMethodOptions {
  kind: MethodKinds;
  import?: TypeImport;
}

export interface NormalizedImportMethodOptions extends Readonly<Normalized<Omit<ImportMethodOptions, keyof BaseMethodOptions | 'import'>> & NormalizedBaseMethodOptions> {
  kind: MethodKinds.IMPORT;
  import: NormalizedTypeImport;
}

export function NormalizeImportMethodOptions(options: ImportMethodOptions): NormalizedImportMethodOptions {
  if (!options.import) {
    throw new Error('The import property is required for an import method');
  }
  return Object.seal({
    ...NormalizeBaseMethodOptions(options),
    kind: MethodKinds.IMPORT,
    import: NormalizeTypeImport(options.import),
  });
}
