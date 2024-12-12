import {
  readNxJson,
  Tree,
  updateNxJson,
} from '@nx/devkit';
import {
  AddPackageJsonDevDependency,
  CoerceIgnorePattern,
  CoerceNxPlugin,
  IsRxapRepository,
} from '@rxap/workspace-utilities';
import { InitGeneratorSchema } from './schema';

export async function initWorkspace(tree: Tree, options: InitGeneratorSchema) {
  console.log('init compodoc workspace');

  await AddPackageJsonDevDependency(tree, '@compodoc/compodoc', 'latest', { soft: true });

  CoerceIgnorePattern(tree, '.eslintignore', [
    'compodoc',
  ]);

  CoerceIgnorePattern(tree, '.gitignore', [
    'compodoc',
  ]);

  const nxJson = readNxJson(tree);

  if (IsRxapRepository(tree)) {
    CoerceNxPlugin(nxJson, './packages/plugin/compodoc/src/plugin.ts');
  } else {
    CoerceNxPlugin(nxJson, '@rxap/plugin-compodoc/plugin');
  }

  updateNxJson(tree, nxJson);

}
