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

export function updateDefaultProjectTargets(tree: Tree) {
  const nxJson = readNxJson(tree);

  if (!nxJson) {
    throw new Error('No nx.json found');
  }

  CoerceTarget(nxJson, 'index-export', {
    executor: '@rxap/plugin-library:run-generator',
    outputs: [
      '{projectRoot}/src/index.ts',
    ],
    options: {
      'generator': '@rxap/plugin-library:index-export',
    },
    inputs: [
      'production',
    ],
  }, Strategy.OVERWRITE);

  CoerceNxJsonCacheableOperation(nxJson, 'index-export');
  CoerceTargetDefaultsDependency(nxJson, 'build', '^index-export', 'index-export', '^build');
  CoerceTargetDefaultsDependency(nxJson, '@nx/js:tsc', '^index-export', 'index-export', '^build');

  updateNxJson(tree, nxJson);

}
