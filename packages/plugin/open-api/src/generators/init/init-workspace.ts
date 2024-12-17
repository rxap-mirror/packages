import {
  readNxJson,
  Tree,
  updateNxJson,
} from '@nx/devkit';
import {
  CoerceNxPlugin,
  IsRxapRepository,
} from '@rxap/workspace-utilities';
import { InitGeneratorSchema } from './schema';

export async function initWorkspace(tree: Tree, options: InitGeneratorSchema) {
  console.log('init open-api workspace');

  const nxJson = readNxJson(tree);

  if (IsRxapRepository(tree)) {
    CoerceNxPlugin(nxJson, './packages/plugin/open-api/src/plugin.ts');
  } else {
    CoerceNxPlugin(nxJson, '@rxap/plugin-open-api/plugin');
  }

  updateNxJson(tree, nxJson);

}
