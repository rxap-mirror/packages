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
  console.log('init nestjs workspace');

  const nxJson = readNxJson(tree)!;

  if (IsRxapRepository(tree)) {
    CoerceNxPlugin(nxJson, './packages/plugin/nestjs/src/plugin.ts');
  } else {
    CoerceNxPlugin(nxJson, '@rxap/plugin-nestjs/plugin');
  }

  updateNxJson(tree, nxJson);

}
