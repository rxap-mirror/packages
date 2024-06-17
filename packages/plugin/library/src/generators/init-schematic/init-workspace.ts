import { Tree } from '@nx/devkit';
import { InitSchematicGeneratorSchema } from './schema';
import { updateGeneralTargetDefaults } from './update-general-target-defaults';

export function initWorkspace(tree: Tree, options: InitSchematicGeneratorSchema) {
  console.log('init plugin library workspace');

  updateGeneralTargetDefaults(tree);
}
