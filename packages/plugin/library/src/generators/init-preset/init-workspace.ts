import { Tree } from '@nx/devkit';
import { IsAlreadyExecuted } from '@rxap/workspace-utilities';
import {
  InitPresetGeneratorSchema,
} from './schema';

export function initWorkspace(tree: Tree, options: InitPresetGeneratorSchema) {

  if (IsAlreadyExecuted([__dirname, __filename, 'initWorkspace'].join('_'))) {
    return;
  }

  console.log('init preset library workspace');

}
