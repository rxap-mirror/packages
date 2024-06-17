import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import {
  CoerceTarget,
  RemoveTarget,
  Strategy,
} from '@rxap/workspace-utilities';
import { InitPluginGeneratorSchema } from './schema';

export function updateProjectTargets(tree: Tree, project: ProjectConfiguration, options: InitPluginGeneratorSchema) {

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

  if (options.targets?.fixDependencies === false) {
    RemoveTarget(project, 'fix-dependencies');
  } else {
    CoerceTarget(project, 'fix-dependencies', {
      options: {
        options: {
          onlyDependencies: true,
        },
      },
    }, Strategy.OVERWRITE);
  }

}
