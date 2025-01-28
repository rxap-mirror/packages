import {
  addProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { HasWorkspaceProject } from '@rxap/workspace-utilities';
import { InitGeneratorSchema } from './schema';

export function coerceWorkspaceProject(tree: Tree, options: InitGeneratorSchema) {

  if (!HasWorkspaceProject(tree)) {
    addProjectConfiguration(tree, 'workspace', {
      root: '',
    });
  }

}
