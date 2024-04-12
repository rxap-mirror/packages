import { Tree } from '@nx/devkit';
import { initWorkspace as baseInitWorkspace } from '../init/init-workspace';
import { InitApplicationGeneratorSchema } from './schema';

export async function initWorkspace(tree: Tree, options: InitApplicationGeneratorSchema) {
  console.log('init cypress application workspace');

  await baseInitWorkspace(tree, options);

}
