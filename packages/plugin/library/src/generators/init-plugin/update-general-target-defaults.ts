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

export function updateGeneralTargetDefaults(tree: Tree) {
  const nxJson = readNxJson(tree);

  if (!nxJson) {
    throw new Error('No nx.json found');
  }

  CoerceTargetDefaultsDependency(nxJson, 'build', 'check-version', 'expose-as-schematic');

  CoerceNxJsonCacheableOperation(nxJson, 'check-version', 'expose-as-schematic');

  CoerceTarget(nxJson, 'check-version', {
    executor: '@rxap/plugin-library:check-version',
  });

  CoerceTarget(nxJson, 'expose-as-schematic', {
    executor: '@rxap/plugin-library:run-generator',
    options: {
      generator: '@rxap/plugin-library:expose-as-schematic',
    },
  });

  updateNxJson(tree, nxJson);
}
