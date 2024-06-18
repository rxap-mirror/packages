import { ProjectConfiguration } from '@nx/devkit';
import { CoerceProjectTags } from '@rxap/workspace-utilities';
import { InitApplicationGeneratorSchema } from './schema';

export function updateTags(
  projectName: string, project: ProjectConfiguration, options: InitApplicationGeneratorSchema) {
  const tags = [ 'backend', 'nest', 'service' ];

  if (options.sentry) {
    tags.push('sentry');
  }

  if (options.swagger) {
    tags.push('swagger');
  }

  if (options.jwt) {
    tags.push('jwt');
  }

  if (options.healthIndicator) {
    tags.push('health-indicator');
  }

  if (options.openApi) {
    tags.push('openapi');
  }

  if (options.standalone) {
    tags.push('standalone');
  }

  if (options.platform) {
    tags.push(options.platform);
  }

  const match = projectName.match(/service-feature-(.*)/);
  if (match) {
    tags.push(`feature:${ match[1] }`);
  }

  CoerceProjectTags(project, tags);
}
