import { Tree } from '@nx/devkit';
import { InitPublishableGeneratorSchema } from './schema';
import { updateGeneralTargetDefaults } from './update-general-target-defaults';

export function initWorkspace(tree: Tree, options: InitPublishableGeneratorSchema) {
  console.log('init publishable library workspace');

  updateGeneralTargetDefaults(tree);

}
