import { AngularOptions } from '../angular-options';
import { BackendTypes } from './backend-types';
import {
  BaseBackendOptions,
  NormalizeBaseBackendOptions,
  NormalizedBaseBackendOptions,
} from './base-backend-options';
import {
  NestJsBackendOptions,
  NormalizedNestJsBackendOptions,
  NormalizeNestJsBackendOptions,
} from './nest-js-backend-options';

export type BackendOptions = BaseBackendOptions | NestJsBackendOptions;

export type NormalizedBackendOptions = NormalizedBaseBackendOptions | NormalizedNestJsBackendOptions;

export type BackendContext = Readonly<Pick<AngularOptions, 'feature'>>;

export function NormalizeBackendOptions(options: BackendOptions | BackendTypes, backendContext?: BackendContext): NormalizedBackendOptions {
  if (typeof options === 'string') {
    options = NormalizeBaseBackendOptions(options, backendContext);
  }
  switch (options.kind) {

    case BackendTypes.NESTJS:
      return NormalizeNestJsBackendOptions(options, backendContext);

    default:
      return NormalizeBaseBackendOptions(options, backendContext);

  }
}
