import { Tree } from '@nx/devkit';
import { InitPluginGeneratorSchema } from './schema';
import { updateGeneralTargetDefaults } from './update-general-target-defaults';

export function initWorkspace(tree: Tree, options: InitPluginGeneratorSchema) {
  console.log('init plugin library workspace');

  updateGeneralTargetDefaults(tree);
}
