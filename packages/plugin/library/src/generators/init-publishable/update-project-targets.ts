import { ProjectConfiguration } from '@nx/devkit';
import { CoerceTarget } from '@rxap/workspace-utilities';

export function updateProjectTargets(project: ProjectConfiguration) {
  CoerceTarget(project, 'update-dependencies', { executor: '@rxap/plugin-library:update-dependencies' });
  CoerceTarget(project, 'update-package-group', { executor: '@rxap/plugin-library:update-package-group' });
  CoerceTarget(project, 'readme', { executor: '@rxap/plugin-library:readme' });
  CoerceTarget(project, 'fix-dependencies', {
    executor: '@rxap/plugin-library:run-generator',
    outputs: [
      '{workspaceRoot}/{projectRoot}/package.json',
    ],
    options: {
      generator: '@rxap/plugin-library:fix-dependencies',
      options: {
        strict: true,
      },
    },
  });
  CoerceTarget(project, 'linking', {});
}
