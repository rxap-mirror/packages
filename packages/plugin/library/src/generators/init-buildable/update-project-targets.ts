import { ProjectConfiguration } from '@nx/devkit';
import { CoerceTarget } from '@rxap/workspace-utilities';

export function updateProjectTargets(project: ProjectConfiguration) {
  if (project.targets?.['build']?.configurations?.['production']) {
    CoerceTarget(project, 'build', {
      defaultConfiguration: 'production',
    });
  }
}
