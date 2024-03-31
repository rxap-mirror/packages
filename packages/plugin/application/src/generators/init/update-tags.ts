import { ProjectConfiguration } from '@nx/devkit';
import { CoerceProjectTags } from '@rxap/workspace-utilities';
import { InitGeneratorSchema } from './schema';

export function updateTags(project: ProjectConfiguration, options: InitGeneratorSchema) {
  const tags = [ 'application' ];

  CoerceProjectTags(project, tags);
}
