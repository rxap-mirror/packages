import {
  GlobalOptions,
  NormalizeGlobalOptions,
  PrintGeneralOptions,
} from '@rxap/schematics-utilities';
import {
  dasherize,
  NonNullableSelected,
  Normalized,
} from '@rxap/utilities';
import { GetWorkspaceScope } from '@rxap/workspace-utilities';
import { BackendTypes } from './backend-types';

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
}

export type NormalizedAngularOptions = Readonly<NonNullableSelected<Normalized<AngularOptions>, 'backend' | 'scope'>>;

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
  return Object.seal({
    ...normalizedOptions,
    componentName: options.componentName ? dasherize(options.componentName) : null,
    name: options.name ? dasherize(options.name) : null,
    context: options.context ? dasherize(options.context) : null,
    nestModule: options.nestModule ? dasherize(options.nestModule) : null,
    controllerName: options.controllerName ? dasherize(options.controllerName) : null,
    backend: options.backend ?? BackendTypes.NONE,
    directory: options.directory ?? null,
    shared,
    prefix: options.prefix ?? null,
    scope: options.scope ?? GetWorkspaceScope(),
  });
}

export type NormalizedAngularOptionsWithName = NonNullableSelected<NormalizedAngularOptions, 'name'>;

export function AssertAngularOptionsNameProperty(options: NormalizedAngularOptions): asserts options is NormalizedAngularOptionsWithName {
  if (!options.name) {
    throw new Error('The name option is required');
  }
}

export function PrintAngularOptions(schematicName: string, options: NormalizedAngularOptions) {
  console.log(JSON.stringify(options));
  PrintGeneralOptions(schematicName, options);
  const {
    name,
    context,
    nestModule,
    controllerName,
    backend,
    directory,
    componentName,
  } = options;

  if (name) {
    console.log(`\x1b[33m===== Name: ${ name }\x1b[0m`);
  }
  if (componentName) {
    console.log(`\x1b[33m===== Component Name: ${ componentName }\x1b[0m`);
  }
  if (directory) {
    console.log(`\x1b[90m===== Directory: ${ directory }\x1b[0m`);
  }
  if (context) {
    console.log(`\x1b[34m===== Context: ${ context }\x1b[0m`);
  }
  switch (backend) {

    case BackendTypes.NESTJS:
      if (nestModule) {
        console.log(`\x1b[36m===== Nest Module: ${ nestModule }\x1b[0m`);
      }
      if (controllerName) {
        console.log(`\x1b[36m===== Controller Name: ${ controllerName }\x1b[0m`);
      }
      break;

    case BackendTypes.NONE:
    default:
      console.log(`\x1b[31m===== Backend: NONE\x1b[0m`);
      break;

  }

}
