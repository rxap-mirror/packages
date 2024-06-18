import { ProjectConfiguration } from '@nx/devkit';
import { CoerceTarget } from '@rxap/workspace-utilities';
import { InitPublishableGeneratorSchema } from './schema';

export function updateProjectTargets(project: ProjectConfiguration, options: InitPublishableGeneratorSchema) {
  CoerceTarget(project, 'readme', {});
  CoerceTarget(project, 'linking', {});
}
