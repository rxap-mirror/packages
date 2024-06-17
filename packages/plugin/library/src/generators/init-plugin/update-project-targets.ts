import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import {
  CoerceTarget,
  HasGenerators,
} from '@rxap/workspace-utilities';

export function updateProjectTargets(tree: Tree, project: ProjectConfiguration) {

  CoerceTarget(project, 'check-version', {
    executor: '@rxap/plugin-library:check-version',
    options: {
      packageName: 'nx',
    },
  });

  CoerceTarget(project, 'expose-as-schematic', {
    executor: '@rxap/plugin-library:run-generator',
    options: {
      generator: '@rxap/plugin-library:expose-as-schematic',
    },
  });

}
