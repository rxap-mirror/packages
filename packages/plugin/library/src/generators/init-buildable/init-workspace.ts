import { Tree } from '@nx/devkit';
import { IsAlreadyExecuted } from '@rxap/workspace-utilities';
import { InitBuildableGeneratorSchema } from './schema';

export function initWorkspace(tree: Tree, options: InitBuildableGeneratorSchema) {

  if (IsAlreadyExecuted([ __dirname, __filename, 'initWorkspace' ].join('_'))) {
    return;
  }

  console.log('init buildable library workspace');

}
