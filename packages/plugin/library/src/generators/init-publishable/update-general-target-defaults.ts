import {
  readNxJson,
  Tree,
  updateNxJson,
} from '@nx/devkit';
import { CoerceTargetDefaultsDependency } from '@rxap/workspace-utilities';

export function updateGeneralTargetDefaults(tree: Tree) {
  const nxJson = readNxJson(tree);

  if (!nxJson) {
    throw new Error('No nx.json found');
  }

  CoerceTargetDefaultsDependency(nxJson, 'build', 'readme');
  CoerceTargetDefaultsDependency(nxJson, 'fix-dependencies', '^fix-dependencies');

  updateNxJson(tree, nxJson);

}
