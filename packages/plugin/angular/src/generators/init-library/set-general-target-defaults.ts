import {
  readNxJson,
  Tree,
  updateNxJson,
} from '@nx/devkit';
import {
  CoerceNxJsonCacheableOperation,
  CoerceTarget,
  CoerceTargetDefaultsDependency,
  CoerceTargetDefaultsInput,
  CoerceTargetDefaultsOutput,
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
  CoerceNxJsonCacheableOperation(nxJson, '@nx/angular:ng-packagr-lite');
  if (IsRxapRepository(tree)) {
    CoerceTargetDefaultsDependency(nxJson, 'build-tailwind', {
      target: 'build',
      projects: [
        'browser-tailwind',
      ],
    });
  }
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

  CoerceNxJsonCacheableOperation(nxJson, 'check-version', 'build-tailwind', 'check-ng-package', 'copy-open-api-sdk');

  updateNxJson(tree, nxJson);
}
