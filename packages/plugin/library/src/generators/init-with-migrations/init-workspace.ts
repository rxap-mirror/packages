import { Tree } from '@nx/devkit';
import { IsAlreadyExecuted } from '@rxap/workspace-utilities';
import { InitWithMigrationsGeneratorSchema } from './schema';

export function initWorkspace(tree: Tree, options: InitWithMigrationsGeneratorSchema) {

  if (IsAlreadyExecuted([__dirname, __filename, 'initWorkspace'].join('_'))) {
    return;
  }

  console.log('init library with migration workspace');

}
