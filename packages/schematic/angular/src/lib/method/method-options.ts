import {
  BaseMethodOptions,
  NormalizeBaseMethodOptions,
  NormalizedBaseMethodOptions,
} from './base-method-options';
import {
  ImportMethodOptions,
  NormalizedImportMethodOptions,
  NormalizeImportMethodOptions,
} from './import-method-options';
import { MethodKinds } from './method-kinds';
import {
  NormalizedOpenApiMethodOptions,
  NormalizeOpenApiMethodOptions,
  OpenApiMethodOptions,
} from './open-api-method-options';

export type MethodOptions = BaseMethodOptions | ImportMethodOptions | OpenApiMethodOptions;

export type NormalizedMethodOptions = NormalizedBaseMethodOptions | NormalizedImportMethodOptions | NormalizedOpenApiMethodOptions;

export function NormalizeMethodOptions(options: MethodOptions): NormalizedMethodOptions {
  switch (options.kind) {

    case MethodKinds.IMPORT:
      return NormalizeImportMethodOptions(options);

    case MethodKinds.OPEN_API:
      return NormalizeOpenApiMethodOptions(options);

    default:
      return NormalizeBaseMethodOptions(options);

  }
}
