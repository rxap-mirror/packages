import { Tree } from '@nx/devkit';
import { IsAlreadyExecuted } from '@rxap/workspace-utilities';
import { InitPublishableGeneratorSchema } from './schema';
import { updateGeneralTargetDefaults } from './update-general-target-defaults';

export function initWorkspace(tree: Tree, options: InitPublishableGeneratorSchema) {

  if (IsAlreadyExecuted([__dirname, __filename, 'initWorkspace'].join('_'))) {
    return;
  }

  console.log('init publishable library workspace');

  updateGeneralTargetDefaults(tree);

}
