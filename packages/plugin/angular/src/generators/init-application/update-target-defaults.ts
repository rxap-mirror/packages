import {
  readNxJson,
  Tree,
  updateNxJson,
} from '@nx/devkit';
import {
  CoerceTarget,
  CoerceTargetDefaults,
  CoerceTargetDefaultsDependency,
  CoerceTargetDefaultsInput,
  Strategy,
} from '@rxap/workspace-utilities';
import { InitApplicationGeneratorSchema } from './schema';

export function updateTargetDefaults(tree: Tree, options: InitApplicationGeneratorSchema) {
  const nxJson = readNxJson(tree);

  if (!nxJson) {
    throw new Error('NxJson not found');
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

  CoerceTargetDefaultsInput(nxJson, 'deploy', '{workspaceRoot}/dist/{projectRoot}');
  CoerceTargetDefaultsDependency(nxJson, 'deploy', 'i18n-index-html');
  CoerceTarget(nxJson, 'i18n-index-html', {
    dependsOn: [ 'build' ],
    executor: '@rxap/plugin-application:i18n',
    outputs: [ 'dist/{projectRoot}/index.html' ],
    inputs: [ '{projectRoot}/project.json' ],
  });

  updateNxJson(tree, nxJson);
}
