import {
  readNxJson,
  Tree,
  updateNxJson,
} from '@nx/devkit';
import {
  CoerceNxJsonCacheableOperation,
  CoerceTargetDefaultsDependency,
} from '@rxap/workspace-utilities';

export function updateGeneralTargetDefaults(tree: Tree) {
  const nxJson = readNxJson(tree);

  if (!nxJson) {
    throw new Error('No nx.json found');
  }

  CoerceTargetDefaultsDependency(nxJson, 'build', 'check-version', 'expose-as-schematic');

  CoerceNxJsonCacheableOperation(nxJson, 'check-version', 'expose-as-schematic');

  updateNxJson(tree, nxJson);
}
