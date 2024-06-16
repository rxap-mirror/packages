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

export interface OpenApiMethodOptions extends BaseMethodOptions {
  kind: MethodKinds;
  operationId?: string;
}

export interface NormalizedOpenApiMethodOptions extends Readonly<Normalized<Omit<OpenApiMethodOptions, keyof BaseMethodOptions>> & NormalizedBaseMethodOptions> {
  kind: MethodKinds.OPEN_API;
  operationId: string;
}

export function NormalizeOpenApiMethodOptions(options: OpenApiMethodOptions): NormalizedOpenApiMethodOptions {
  if (!options.operationId) {
    throw new Error('The operationId property is required for an open api method');
  }
  return Object.seal({
    ...NormalizeBaseMethodOptions(options),
    kind: MethodKinds.OPEN_API,
    operationId: options.operationId,
  });
}
