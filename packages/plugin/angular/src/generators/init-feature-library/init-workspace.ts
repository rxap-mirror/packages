import { Tree } from '@nx/devkit';
import { initWorkspace as InitLibraryWorkspace } from '../init-library/init-workspace';
import { InitFeatureLibraryGeneratorSchema } from './schema';

export async function initWorkspace(tree: Tree, options: InitFeatureLibraryGeneratorSchema) {
  console.log('init angular library workspace');

  await InitLibraryWorkspace(tree, options);

}
