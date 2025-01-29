import { ProjectConfiguration } from '@nx/devkit';

export function isLegacyConfiguration(project: ProjectConfiguration) {
  return project.targets?.['build']?.['executor'] === '@nx/webpack:webpack';
}
