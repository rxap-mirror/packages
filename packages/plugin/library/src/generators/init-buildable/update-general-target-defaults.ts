import {
  readNxJson,
  Tree,
  updateNxJson,
} from '@nx/devkit';
import {
  CoerceTarget,
  CoerceTargetDefaultsDependency,
  Strategy,
} from '@rxap/workspace-utilities';

export function updateGeneralTargetDefaults(tree: Tree) {
  const nxJson = readNxJson(tree);

  if (!nxJson) {
    throw new Error('No nx.json found');
  }

  CoerceTargetDefaultsDependency(nxJson, 'build', '^build');

  CoerceTarget(nxJson, 'fix-dependencies', {
    executor: '@rxap/plugin-library:run-generator',
    outputs: [
      '{projectRoot}/package.json',
    ],
    options: {
      generator: '@rxap/plugin-library:fix-dependencies',
      options: {
        strict: true,
        onlyDependencies: true,
      }
    },
  }, Strategy.OVERWRITE);

  CoerceTarget(nxJson, 'update-dependencies', { executor: '@rxap/plugin-library:update-dependencies' }, Strategy.OVERWRITE);
  CoerceTarget(nxJson, 'update-package-group', { executor: '@rxap/plugin-library:update-package-group' }, Strategy.OVERWRITE);

  updateNxJson(tree, nxJson);

}
