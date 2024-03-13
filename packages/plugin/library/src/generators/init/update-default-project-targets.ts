import {
  readNxJson,
  Tree,
  updateNxJson,
} from '@nx/devkit';
import {
  CoerceNxJsonCacheableOperation,
  CoerceTarget,
  CoerceTargetDefaultsDependency,
} from '@rxap/workspace-utilities';

export function updateDefaultProjectTargets(tree: Tree) {
  const nxJson = readNxJson(tree);

  if (!nxJson) {
    throw new Error('No nx.json found');
  }

  CoerceTarget(nxJson, 'index-export', {
    'executor': '@rxap/plugin-library:run-generator',
    'outputs': [
      '{workspaceRoot}/{projectRoot}/src/index.ts',
    ],
    'options': {
      'generator': '@rxap/plugin-library:index-export',
    },
    'inputs': [
      'production',
    ],
  });

  CoerceNxJsonCacheableOperation(nxJson, 'index-export');
  CoerceTargetDefaultsDependency(nxJson, 'build', '^index-export');
  CoerceTargetDefaultsDependency(nxJson, 'build', 'index-export');

  updateNxJson(tree, nxJson);

}
