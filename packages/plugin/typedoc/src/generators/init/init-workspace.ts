import {
  readNxJson,
  Tree,
  updateNxJson,
} from '@nx/devkit';
import {
  AddPackageJsonDevDependency,
  CoerceNxJsonCacheableOperation,
  CoerceTarget,
  Strategy,
} from '@rxap/workspace-utilities';
import { InitGeneratorSchema } from './schema';

export async function initWorkspace(tree: Tree, options: InitGeneratorSchema) {
  console.log('init typedoc workspace');

  await AddPackageJsonDevDependency(tree, 'typedoc', 'latest', { soft: true });

  const nxJson = readNxJson(tree);

  CoerceTarget(nxJson, 'typedoc', {
    executor: '@rxap/plugin-typedoc:build',
    outputs: [ '{options.outputPath}' ],
    inputs: [ 'production', '^production' ],
  }, Strategy.OVERWRITE);
  CoerceNxJsonCacheableOperation(nxJson, 'typedoc');

  updateNxJson(tree, nxJson);

}
