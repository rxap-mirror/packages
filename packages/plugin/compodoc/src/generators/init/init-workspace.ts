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
  console.log('init compodoc workspace');

  await AddPackageJsonDevDependency(tree, '@compodoc/compodoc', 'latest', { soft: true });

  const nxJson = readNxJson(tree);

  if (IsRxapRepository(tree)) {
    CoerceNxPlugin(nxJson, './packages/plugin/compodoc/src/plugin.ts');
  } else {
    CoerceNxPlugin(nxJson, '@rxap/plugin-compodoc/plugin');
  }

  updateNxJson(tree, nxJson);

}
