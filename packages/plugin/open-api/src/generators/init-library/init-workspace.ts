import {
  readNxJson,
  Tree,
  updateNxJson,
} from '@nx/devkit';
import {
  CoerceNxJsonCacheableOperation,
  CoerceTarget,
} from '@rxap/workspace-utilities';
import { InitLibraryGeneratorSchema } from './schema';

export function initWorkspace(tree: Tree, options: InitLibraryGeneratorSchema) {

  const nxJson = readNxJson(tree);

  if (!nxJson) {
    throw new Error('No nx.json found');
  }

  CoerceNxJsonCacheableOperation(nxJson, 'generate-open-api');
  CoerceTarget(nxJson, 'generate-open-api', {
    executor: '@rxap/plugin-library:run-generator',
    options: {
      generator: '@rxap/plugin-open-api:generate'
    },
  });

  updateNxJson(tree, nxJson);

}
