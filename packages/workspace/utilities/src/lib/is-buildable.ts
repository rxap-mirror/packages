import { ProjectConfiguration } from '@nx/devkit';

export function IsBuildable(project: ProjectConfiguration) {
  return !!project.targets?.['build'];
}
