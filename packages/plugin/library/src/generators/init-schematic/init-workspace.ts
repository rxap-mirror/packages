import { Tree } from '@nx/devkit';
import { IsAlreadyExecuted } from '@rxap/workspace-utilities';
import { InitSchematicGeneratorSchema } from './schema';
import { updateGeneralTargetDefaults } from './update-general-target-defaults';

export function initWorkspace(tree: Tree, options: InitSchematicGeneratorSchema) {

  if (IsAlreadyExecuted([__dirname, __filename, 'initWorkspace'].join('_'))) {
    return;
  }

  console.log('init plugin library workspace');

  updateGeneralTargetDefaults(tree);
}
