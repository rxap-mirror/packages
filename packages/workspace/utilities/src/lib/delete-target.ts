import { ProjectConfiguration } from '@nx/devkit';

export function DeleteTarget(project: ProjectConfiguration, target: string): void {
  if (project.targets?.[target]) {
    delete project.targets[target];
  }
}
