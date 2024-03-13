import { Tree } from '@nx/devkit';
import { InitBuildableGeneratorSchema } from './schema';
import { updateGeneralTargetDefaults } from './update-general-target-defaults';

export function initWorkspace(tree: Tree, options: InitBuildableGeneratorSchema) {
  console.log('init buildable library workspace');

  updateGeneralTargetDefaults(tree);
}
