import {
  readNxJson,
  Tree,
  updateNxJson,
} from '@nx/devkit';
import {
  CoerceNxJsonCacheableOperation,
  CoerceTargetDefaultsDependency,
  CoerceTargetDefaultsInput,
  CoerceTargetDefaultsOutput,
} from '@rxap/workspace-utilities';

export function setGeneralTargetDefaults(tree: Tree) {
  const nxJson = readNxJson(tree);

  if (!nxJson) {
    throw new Error('No nx.json found');
  }

  CoerceTargetDefaultsDependency(nxJson, 'build', 'check-version', 'build-tailwind', 'check-ng-package');
  CoerceTargetDefaultsDependency(nxJson, 'build-tailwind', {
    target: 'build',
    projects: [
      'browser-tailwind',
    ],
  });
  CoerceTargetDefaultsOutput(nxJson, 'build-tailwind', '{projectRoot}/theme.css');
  CoerceTargetDefaultsInput(
    nxJson,
    'build-tailwind',
    '{projectRoot}/**/*.html',
    '{projectRoot}/**/*.scss',
    '{projectRoot}/**/*.css',
  );
  CoerceTargetDefaultsInput(
    nxJson,
    'check-ng-package',
    '{projectRoot}/ng-package.json',
    '{projectRoot}/package.json',
  );

  CoerceNxJsonCacheableOperation(nxJson, 'check-version', 'build-tailwind', 'check-ng-package', 'copy-client-sdk');

  updateNxJson(tree, nxJson);
}
