import { ProjectConfiguration } from '@nx/devkit';
import {
  CoerceTarget,
  RemoveTarget,
} from '@rxap/workspace-utilities';
import { InitBuildableGeneratorSchema } from './schema';

export function updateProjectTargets(project: ProjectConfiguration, options: InitBuildableGeneratorSchema) {
  if (project.targets?.['build']?.configurations?.['production']) {
    CoerceTarget(project, 'build', {
      defaultConfiguration: 'production',
    });
  }
  CoerceTarget(project, 'update-dependencies', {});
  CoerceTarget(project, 'update-package-group', {});
  if (options.targets?.fixDependencies === false) {
    RemoveTarget(project, 'fix-dependencies');
  } else {
    CoerceTarget(project, 'fix-dependencies', {});
  }
}
