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
} from '@rxap/workspace-utilities';
import { InitApplicationGeneratorSchema } from './schema';

export function updateTargetDefaults(tree: Tree, options: InitApplicationGeneratorSchema) {
  const nxJson = readNxJson(tree);

  if (!nxJson) {
    throw new Error('NxJson not found');
  }

  if (options.localazy) {
    CoerceTargetDefaultsDependency(nxJson, 'build', 'localazy-download');
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

  CoerceTargetDefaultsDependency(nxJson, 'build', '^generate-open-api');
  CoerceTargetDefaultsDependency(nxJson, 'serve', '^generate-open-api');

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
