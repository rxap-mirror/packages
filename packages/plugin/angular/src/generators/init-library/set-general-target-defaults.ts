import {
  readNxJson,
  Tree,
  updateNxJson,
} from '@nx/devkit';
import {
  CoerceTarget,
  CoerceTargetDefaultsDependency,
  IsRxapRepository,
  Strategy,
} from '@rxap/workspace-utilities';

export function setGeneralTargetDefaults(tree: Tree) {
  const nxJson = readNxJson(tree);

  if (!nxJson) {
    throw new Error('No nx.json found');
  }

  CoerceTarget(nxJson, '@nx/angular:ng-packagr-lite', {
    dependsOn: [
      'index-export', '^index-export', '^build', 'check-version', 'build-tailwind', 'check-ng-package'
    ],
    inputs: [ "production", "^production" ]
  }, Strategy.OVERWRITE);
  if (IsRxapRepository(tree)) {
    CoerceTargetDefaultsDependency(nxJson, 'build-tailwind', {
      target: 'build',
      projects: [
        'browser-tailwind',
      ],
    });
  }

  updateNxJson(tree, nxJson);
}
