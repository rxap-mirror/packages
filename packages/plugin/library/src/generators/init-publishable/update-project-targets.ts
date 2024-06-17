import { ProjectConfiguration } from '@nx/devkit';
import {
  CoerceTarget,
  RemoveTarget,
} from '@rxap/workspace-utilities';
import { InitPublishableGeneratorSchema } from './schema';

export function updateProjectTargets(project: ProjectConfiguration, options: InitPublishableGeneratorSchema) {
  CoerceTarget(project, 'update-dependencies', { executor: '@rxap/plugin-library:update-dependencies' });
  CoerceTarget(project, 'update-package-group', { executor: '@rxap/plugin-library:update-package-group' });
  CoerceTarget(project, 'readme', { executor: '@rxap/plugin-library:readme' });
  if (options.targets?.fixDependencies === false) {
    RemoveTarget(project, 'fix-dependencies');
  } else {
    CoerceTarget(project, 'fix-dependencies', {
      executor: '@rxap/plugin-library:run-generator',
      outputs: [
        '{workspaceRoot}/{projectRoot}/package.json',
      ],
      options: {
        generator: '@rxap/plugin-library:fix-dependencies',
        options: {
          strict: true,
          onlyDependencies: true,
        }
      },
    });
  }
  CoerceTarget(project, 'linking', {});
}
