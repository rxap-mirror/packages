import { Tree } from '@nx/devkit';
import { LibraryInitWorkspace } from '@rxap/plugin-library';
import { InitGeneratorSchema } from './schema';

export function initWorkspace(tree: Tree, options: InitGeneratorSchema) {
  LibraryInitWorkspace(tree, options);
}
