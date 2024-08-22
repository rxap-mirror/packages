import {
  readNxJson,
  Tree,
  updateNxJson,
} from '@nx/devkit';
import {
  CoerceNxJsonCacheableOperation,
  CoerceTarget,
  CoerceTargetDefaults,
  CoerceTargetDefaultsDependency,
  CoerceTargetDefaultsInput,
  CoerceTargetDefaultsOutput,
  Strategy,
} from '@rxap/workspace-utilities';
import { InitApplicationGeneratorSchema } from './schema';

export function updateTargetDefaults(tree: Tree, options: InitApplicationGeneratorSchema) {
  const nxJson = readNxJson(tree);

  if (!nxJson) {
    throw new Error('NxJson not found');
  }

  if (options.localazy) {
    CoerceTargetDefaultsDependency(nxJson, 'localazy-upload', 'extract-i18n');
    CoerceTargetDefaultsInput(
      nxJson,
      'localazy-upload',
      '{projectRoot}/src/i18n/messages.xlf',
    );
    CoerceTargetDefaultsInput(
      nxJson,
      'localazy-download',
      { runtime: 'date' },
      { env: 'CI_COMMIT_TIMESTAMP' },
      { env: 'CI_COMMIT_SHA' },
      { env: 'CI_JOB_ID' },
      { env: 'CI_PIPELINE_ID' },
    );
    CoerceTargetDefaultsOutput(
      nxJson,
      'localazy-download',
      '{projectRoot}/src/i18n',
    );
  }

  CoerceTargetDefaults(nxJson, '@angular-devkit/build-angular:browser', {
    cache: true,
    dependsOn: [ '^index-export', 'index-export', '^build', 'localazy-download' ],
    inputs: [ 'production', '^production' ],
  }, Strategy.OVERWRITE);

  CoerceTargetDefaults(nxJson, '@nx/angular:webpack-browser', {
    cache: true,
    dependsOn: [ '^index-export', 'index-export', '^build', 'localazy-download' ],
    inputs: [
      'production',
      '^production',
      {
        'env': 'NX_MF_DEV_SERVER_STATIC_REMOTES',
      },
    ],
  }, Strategy.OVERWRITE);

  CoerceNxJsonCacheableOperation(nxJson, 'localazy-download', 'localazy-upload', 'extract-i18n', 'i18n-index-html');

  CoerceTargetDefaultsInput(nxJson, 'deploy', '{workspaceRoot}/dist/{projectRoot}');
  CoerceTargetDefaultsDependency(nxJson, 'deploy', 'i18n-index-html');
  CoerceTarget(nxJson, 'i18n-index-html', {
    dependsOn: [ 'build' ],
    executor: '@rxap/plugin-application:i18n',
    outputs: [ 'dist/{projectRoot}/index.html' ],
    inputs: [ '{workspaceRoot}/{projectRoot}/project.json' ],
  });

  updateNxJson(tree, nxJson);
}
