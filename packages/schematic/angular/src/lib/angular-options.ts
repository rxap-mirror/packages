import {
  GlobalOptions,
  NormalizedGlobalOptions,
  NormalizeGlobalOptions,
} from '@rxap/schematics-utilities';
import {
  dasherize,
  NonNullableSelected,
  Normalized,
} from '@rxap/utilities';
import {
  NormalizeBackendOptions,
  NormalizedBackendOptions,
} from './backend/backend-options';
import { BackendTypes } from './backend/backend-types';

export interface AngularOptions extends GlobalOptions {
  componentName?: string;
  name?: string;
  context?: string;
  nestModule?: string;
  controllerName?: string;
  backend?: BackendTypes;
  directory?: string;
  shared?: boolean;
  scope?: string;
  prefix?: string;
  openApi?: any;
}

export interface NormalizedAngularOptions extends Readonly<Normalized<Omit<AngularOptions, keyof GlobalOptions | 'backend'>> & NormalizedGlobalOptions> {
  backend: NormalizedBackendOptions;
}

export function NormalizeAngularOptions(options: AngularOptions): NormalizedAngularOptions {
  let shared = options.shared ?? false;
  const project = dasherize(options.project ?? 'shared');
  if (project === 'shared') {
    shared = true;
  }
  const normalizedOptions = NormalizeGlobalOptions({
    ...options,
    project,
  });
  const backend = NormalizeBackendOptions(options.backend ?? BackendTypes.NONE, Object.freeze(options));
  let nestModule = options.nestModule ? dasherize(options.nestModule) : null;
  if (!nestModule && backend.kind === BackendTypes.NESTJS && 'module' in backend && backend.module) {
    nestModule = dasherize(backend.module);
  }
  return Object.freeze({
    ...normalizedOptions,
    componentName: options.componentName ? dasherize(options.componentName) : null,
    name: options.name ? dasherize(options.name) : null,
    context: options.context ? dasherize(options.context) : null,
    nestModule,
    controllerName: options.controllerName ? dasherize(options.controllerName) : null,
    backend,
    directory: options.directory ?? null,
    shared,
    prefix: options.prefix ?? null,
    scope: options.scope ?? null,
    openApi: options.openApi ?? null,
  });
}

export type NormalizedAngularOptionsWithName = NonNullableSelected<NormalizedAngularOptions, 'name'>;

export function AssertAngularOptionsNameProperty(options: NormalizedAngularOptions): asserts options is NormalizedAngularOptionsWithName {
  if (!options.name) {
    throw new Error('The name option is required');
  }
}

