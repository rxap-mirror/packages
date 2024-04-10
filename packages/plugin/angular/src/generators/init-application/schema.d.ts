import { Schema as AngularApplicationGeneratorSchema } from '@nx/angular/src/generators/application/schema';
import { Schema as AngularHostGeneratorSchema } from '@nx/angular/src/generators/host/schema';
import { Schema as AngularRemoteGeneratorSchema } from '@nx/angular/src/generators/remote/schema';

export interface InitApplicationGeneratorSchema {
  sentry?: boolean;
  openApi?: boolean;
  config?: boolean;
  project?: string;
  projects?: string[];
  localazy?: boolean;
  i18n?: boolean;
  serviceWorker?: boolean;
  languages?: string[];
  material?: boolean;
  generateMain?: boolean;
  overwrite?: boolean;
  cleanup?: boolean;
  monolithic?: boolean;
  openApiLegacy?: boolean;
  localazyReadKey?: string;
  authentik?: boolean;
  oauth?: boolean;
  skipProjects?: boolean;
  authentication?: boolean;
  deploy?: 'web3-storage';
  moduleFederation?: 'host' | 'remote';
  host?: string;
  coerce?: boolean | AngularHostGeneratorSchema | AngularRemoteGeneratorSchema | AngularApplicationGeneratorSchema;
  layoutRoutePath?: string;
  standaloneImport?: boolean;
  skipFormat?: boolean;
}
