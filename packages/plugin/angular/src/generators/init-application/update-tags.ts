import { ProjectConfiguration } from '@nx/devkit';
import { CoerceProjectTags } from '@rxap/workspace-utilities';
import { InitApplicationGeneratorSchema } from './schema';

export function updateTags(project: ProjectConfiguration, options: InitApplicationGeneratorSchema) {
  const tags = [ 'frontend', 'user-interface' ];

  if (options.i18n) {
    tags.push('i18n');
  }

  if (options.localazy) {
    tags.push('localazy');
  }

  if (options.serviceWorker) {
    tags.push('service-worker');
  }

  if (options.sentry) {
    tags.push('sentry');
  }

  if (options.moduleFederation) {
    tags.push('module-federation');
    tags.push(`mfe:${ options.moduleFederation }`);
  }

  CoerceProjectTags(project, tags);
}
