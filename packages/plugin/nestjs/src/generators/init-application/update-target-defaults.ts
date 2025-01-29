import {
  readNxJson,
  Tree,
  updateNxJson,
} from '@nx/devkit';
import {
  CoerceNxJsonCacheableOperation,
  CoerceTarget,
  CoerceTargetDefaultsDependency,
  Strategy,
} from '@rxap/workspace-utilities';
import { InitApplicationGeneratorSchema } from './schema';

export function updateTargetDefaults(tree: Tree, options: InitApplicationGeneratorSchema) {
  console.log('updating default targets');

  const nxJson = readNxJson(tree);

  if (!nxJson) {
    throw new Error('No nx.json found');
  }

  CoerceTargetDefaultsDependency(
    nxJson,
    '@nx/webpack:webpack',
    '^index-export',
    'index-export',
    '^build',
  );

  CoerceNxJsonCacheableOperation(nxJson, '@nx/webpack:webpack');

  if (!options.standalone) {
    CoerceTargetDefaultsDependency(
      nxJson,
      '@nx/webpack:webpack',
      'generate-package-json',
    );
  }

  updateNxJson(tree, nxJson);
}
