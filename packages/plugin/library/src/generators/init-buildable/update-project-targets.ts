import { ProjectConfiguration } from '@nx/devkit';
import { CoerceTarget } from '@rxap/workspace-utilities';
import { InitBuildableGeneratorSchema } from './schema';

export function updateProjectTargets(project: ProjectConfiguration, options: InitBuildableGeneratorSchema) {
  if (project.targets?.['build']?.configurations?.['production']) {
    CoerceTarget(project, 'build', {
      defaultConfiguration: 'production',
    });
  }
}
