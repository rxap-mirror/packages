import { Normalized } from '@rxap/utilities';
import { BackendTypes } from './backend-types';
import { BackendContext } from './backend-options';
import {
  BaseBackendOptions,
  NormalizeBaseBackendOptions,
  NormalizedBaseBackendOptions,
} from './base-backend-options';

export interface NestJsBackendOptions extends BaseBackendOptions {
  /**
   * The nx workspace project name where the backend will be created
   */
  project?: string;
  /**
   * The OpenAPI client sdk serverId used to build operationIds and import paths for operations
   */
  serverId?: string
}

export interface NormalizedNestJsBackendOptions
  extends Readonly<Normalized<Omit<NestJsBackendOptions, keyof BaseBackendOptions>> & NormalizedBaseBackendOptions> {
  kind: BackendTypes.NESTJS;
  project: string | null;
  serverId: string | null;
}

export function NormalizeNestJsBackendOptions(options: NestJsBackendOptions, backendContext?: BackendContext): NormalizedNestJsBackendOptions {
  return {
    ...NormalizeBaseBackendOptions(options, backendContext),
    kind: BackendTypes.NESTJS,
    project: options.project ?? null,
    serverId: options.serverId ?? null,
  };
}
