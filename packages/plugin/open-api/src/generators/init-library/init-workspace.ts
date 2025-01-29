import {
  readNxJson,
  Tree,
  updateNxJson,
} from '@nx/devkit';
import { LibraryInitWorkspace } from '@rxap/plugin-library';
import {
  CoerceIgnorePattern,
  CoerceNxJsonCacheableOperation,
  CoerceTarget,
} from '@rxap/workspace-utilities';
import { InitLibraryGeneratorSchema } from './schema';

export function initWorkspace(tree: Tree, options: InitLibraryGeneratorSchema) {

  LibraryInitWorkspace(tree, options);

  const nxJson = readNxJson(tree);

  if (!nxJson) {
    throw new Error('No nx.json found');
  }

  CoerceIgnorePattern(tree, '.nxignore', [ '!swagger/**/openapi.json' ]);

  updateNxJson(tree, nxJson);

}
