import { Tree } from '@nx/devkit';
import { initWorkspace as baseInitWorkspace } from '../init/init-workspace';
import { InitLibraryGeneratorSchema } from './schema';

export async function initWorkspace(tree: Tree, options: InitLibraryGeneratorSchema) {
  console.log('init compodoc library workspace');

  await baseInitWorkspace(tree, options);

}
