import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import {
  CoerceTarget,
  RemoveTarget,
  Strategy,
} from '@rxap/workspace-utilities';
import { InitPresetGeneratorSchema } from './schema';

export function updateProjectTargets(tree: Tree, project: ProjectConfiguration, options: InitPresetGeneratorSchema) {

  if (options.targets?.fixDependencies === false) {
    RemoveTarget(project, 'fix-dependencies');
  } else {
    CoerceTarget(project, 'fix-dependencies', {
      options: {
        options: {
          noPeerDependencies: true,
        },
      },
    }, Strategy.OVERWRITE);
  }

}
