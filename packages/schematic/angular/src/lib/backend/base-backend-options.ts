import { Normalized } from '@rxap/utilities';
import { BackendTypes } from './backend-types';
import { BackendContext } from './backend-options';

export interface BaseBackendOptions {
  kind: BackendTypes;
}

export type NormalizedBaseBackendOptions = Readonly<Normalized<BaseBackendOptions>>;

export function NormalizeBaseBackendOptions(options: BaseBackendOptions | BackendTypes, backendContext?: BackendContext): NormalizedBaseBackendOptions {
  if (typeof options === 'string') {
    return {
      kind: options,
    };
  }
  return options;
}
