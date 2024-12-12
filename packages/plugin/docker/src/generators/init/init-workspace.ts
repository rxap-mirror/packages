import {
  readNxJson,
  Tree,
  updateNxJson,
} from '@nx/devkit';
import {
  AddPackageJsonDevDependency,
  CoerceNxPlugin,
  IsRxapRepository,
} from '@rxap/workspace-utilities';
import { InitGeneratorSchema } from './schema';

export async function initWorkspace(tree: Tree, options: InitGeneratorSchema) {
  console.log('init docker workspace');

  const nxJson = readNxJson(tree);

  if (IsRxapRepository(tree)) {
    CoerceNxPlugin(nxJson, './packages/plugin/docker/src/plugin.ts');
  } else {
    CoerceNxPlugin(nxJson, '@rxap/plugin-docker/plugin');
  }

  updateNxJson(tree, nxJson);

}
