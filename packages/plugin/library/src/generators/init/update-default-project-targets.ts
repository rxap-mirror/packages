import {
  readNxJson,
  Tree,
  updateNxJson,
} from '@nx/devkit';
import { CoerceTargetDefaultsDependency } from '@rxap/workspace-utilities';

export function updateDefaultProjectTargets(tree: Tree) {
  const nxJson = readNxJson(tree);

  if (!nxJson) {
    throw new Error('No nx.json found');
  }

  CoerceTargetDefaultsDependency(nxJson, 'build', '^index-export', 'index-export', '^build');
  CoerceTargetDefaultsDependency(nxJson, '@nx/js:tsc', '^index-export', 'index-export', '^build');

  updateNxJson(tree, nxJson);

}
