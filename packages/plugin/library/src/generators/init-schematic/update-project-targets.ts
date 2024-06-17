import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import {
  CoerceTarget,
  RemoveTarget,
  Strategy,
} from '@rxap/workspace-utilities';
import { InitSchematicGeneratorSchema } from './schema';

export function updateProjectTargets(tree: Tree, project: ProjectConfiguration, options: InitSchematicGeneratorSchema) {

  CoerceTarget(project, 'check-version', {
    executor: '@rxap/plugin-library:check-version',
    options: {
      packageName: '@angular-devkit/schematics',
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
