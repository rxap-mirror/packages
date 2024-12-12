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
  console.log('init typedoc workspace');

  await AddPackageJsonDevDependency(tree, 'typedoc', 'latest', { soft: true });

  CoerceIgnorePattern(tree, '.eslintignore', [
    'docs',
  ]);

  CoerceIgnorePattern(tree, '.gitignore', [
    'docs',
  ]);

  const nxJson = readNxJson(tree);

  if (IsRxapRepository(tree)) {
    CoerceNxPlugin(nxJson, './packages/plugin/typedoc/src/plugin.ts');
  } else {
    CoerceNxPlugin(nxJson, '@rxap/plugin-typedoc/plugin');
  }

  updateNxJson(tree, nxJson);

}
