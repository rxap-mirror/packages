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

export function NormalizeMethodOptions(options: MethodOptions): NormalizedMethodOptions;
export function NormalizeMethodOptions(options: MethodOptions | undefined): NormalizedMethodOptions | null;
export function NormalizeMethodOptions(options?: MethodOptions): NormalizedMethodOptions | null {
  if (!options || Object.keys(options).length === 0) {
    return null;
  }
  switch (options.kind) {

    case MethodKinds.IMPORT:
      return NormalizeImportMethodOptions(options);

    case MethodKinds.OPEN_API:
      return NormalizeOpenApiMethodOptions(options);

    default:
      return NormalizeBaseMethodOptions(options);

  }
}

export function IsNormalizedOpenApiMethodOptions(options?: NormalizedMethodOptions | null): options is NormalizedOpenApiMethodOptions {
  return !!options && options.kind === MethodKinds.OPEN_API;
}

export function IsNormalizedImportMethodOptions(options?: NormalizedMethodOptions | null): options is NormalizedImportMethodOptions {
  return !!options && options.kind === MethodKinds.IMPORT;
}

export function AssertIsNormalizedOpenApiMethodOptions(options: NormalizedMethodOptions): asserts options is NormalizedOpenApiMethodOptions {
  if (!IsNormalizedOpenApiMethodOptions(options)) {
    throw new Error('The options are not a normalized open api method options');
  }
}

export function AssertIsNormalizedImportMethodOptions(options: NormalizedMethodOptions): asserts options is NormalizedImportMethodOptions {
  if (!IsNormalizedImportMethodOptions(options)) {
    throw new Error('The options are not a normalized import method options');
  }
}
