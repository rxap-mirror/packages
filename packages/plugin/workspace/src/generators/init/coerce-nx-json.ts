import {
  readNxJson,
  Tree,
  updateNxJson,
} from '@nx/devkit';
import {
  CoerceNxJsonCacheableOperation,
  CoerceTarget,
  Strategy,
} from '@rxap/workspace-utilities';
import { CoerceNxJsonGenerators } from './coerce-nx-json-generators';
import { CoerceNxJsonNamedInputs } from './coerce-nx-json-named-inputs';
import { InitGeneratorSchema } from './schema';

export function coerceNxJson(tree: Tree, options: InitGeneratorSchema) {
  const nxJson = readNxJson(tree)!;

  CoerceNxJsonNamedInputs(nxJson, 'default', [ '{projectRoot}/**/*' ]);
  CoerceNxJsonNamedInputs(nxJson, 'build', [
    'production',
    '{projectRoot}/package.json',
    '{projectRoot}/collection.json',
    '{projectRoot}/generators.json',
    '{projectRoot}/executors.json',
  ]);
  CoerceNxJsonNamedInputs(nxJson, 'production', [
    'typescript',
    '{projectRoot}/src/**/*',
    '!{projectRoot}/**/*.{spec,stories,cy}.ts',
    '!{projectRoot}/jest.config.ts',
    '!{projectRoot}/src/test-setup.[jt]s',
    '!{projectRoot}/tsconfig.spec.json',
    '!{projectRoot}/cypress/**/*',
    '!{projectRoot}/**/*.cy.[jt]s?(x)',
    '!{projectRoot}/cypress.config.[jt]s',
  ], Strategy.REPLACE);
  CoerceNxJsonNamedInputs(nxJson, 'test', [
    'typescript',
    '{projectRoot}/src/**/*',
    '!{projectRoot}/tsconfig.lib.json',
    '!{projectRoot}/tsconfig.lib.prod.json',
  ]);
  CoerceNxJsonNamedInputs(nxJson, 'typescript', [
    '{projectRoot}/**/*.ts',
    '{projectRoot}/tsconfig.json',
    '{projectRoot}/tsconfig.*.json',
  ]);
  CoerceNxJsonGenerators(nxJson, '@nx/angular:application', {
    'style': 'scss',
    'linter': 'eslint',
    'unitTestRunner': 'jest',
    'e2eTestRunner': 'none',
    'tags': 'angular,ngx',
    'prefix': options.prefix ?? 'rxap',
    'standalone': true,
    'addTailwind': true,
    'routing': true,
    'directory': `user-interface`,
  });
  CoerceNxJsonGenerators(nxJson, '@nx/angular:host', {
    'style': 'scss',
    'linter': 'eslint',
    'unitTestRunner': 'jest',
    'e2eTestRunner': 'none',
    'tags': 'angular,ngx',
    'prefix': options.prefix ?? 'rxap',
    'standalone': true,
    'addTailwind': true,
    name: 'shell',
    'directory': `user-interface/shell`,
  });
  CoerceNxJsonGenerators(nxJson, '@nx/angular:remote', {
    'style': 'scss',
    'linter': 'eslint',
    'unitTestRunner': 'jest',
    'e2eTestRunner': 'none',
    'tags': 'angular,ngx',
    'prefix': options.prefix ?? 'rxap',
    'standalone': true,
    'addTailwind': true,
    host: 'shell',
    'directory': `user-interface/feature`,
  });
  CoerceNxJsonGenerators(nxJson, '@nx/angular:component', {
    'style': 'scss',
    'standalone': true,
  });
  CoerceNxJsonGenerators(nxJson, '@nx/angular:library', {
    'linter': 'eslint',
    'unitTestRunner': 'jest',
    'publishable': false,
    'addTailwind': false,
    'changeDetection': 'OnPush',
    'standalone': true,
    'style': 'scss',
    'directory': 'angular',
    'tags': 'angular,ngx',
    'prefix': 'rxap',
    'skipModule': true,
    buildable: false,
  });
  CoerceNxJsonGenerators(nxJson, '@nx/plugin:plugin', {
    'directory': 'plugin',
    'publishable': false,
    'tags': 'plugin,nx,nx-plugin',
  });
  CoerceNxJsonGenerators(nxJson, '@nx/js:library', {
    'unitTestRunner': 'jest',
    'publishable': false,
    buildable: false,
  });
  CoerceNxJsonGenerators(nxJson, '@nx/nest:library', {
    'directory': 'nest',
    'tags': 'nest',
    'publishable': false,
    buildable: false,
  });
  CoerceNxJsonGenerators(nxJson, '@nx/angular:directive', {
    'standalone': true,
    'skipTests': true,
  });
  CoerceNxJsonGenerators(nxJson, '@nx/nest:application', {
    'e2eTestRunner': 'none',
    'tags': 'nest',
    'strict': true,
    'directory': 'service',
  });
  CoerceNxJsonGenerators(nxJson, '@nx/plugin:executor', {
    'unitTestRunner': 'none',
  });
  CoerceNxJsonGenerators(nxJson, '@nx/plugin:generator', {
    'unitTestRunner': 'none',
  });
  CoerceNxJsonGenerators(nxJson, '@nx/angular:library-secondary-entry-point', {
    'skipModule': true,
  });
  CoerceNxJsonCacheableOperation(nxJson, 'ci-info');
  CoerceNxJsonCacheableOperation(nxJson, 'localazy-upload');
  CoerceNxJsonCacheableOperation(nxJson, 'extract-i18n');
  CoerceNxJsonCacheableOperation(nxJson, 'localazy-download');
  CoerceNxJsonCacheableOperation(nxJson, 'index-export');
  CoerceNxJsonCacheableOperation(nxJson, 'swagger-build');
  CoerceNxJsonCacheableOperation(nxJson, 'swagger-generate');
  CoerceNxJsonCacheableOperation(nxJson, 'generate-package-json');
  CoerceNxJsonCacheableOperation(nxJson, 'component-test');
  CoerceNxJsonCacheableOperation(nxJson, 'generate-open-api');

  CoerceTarget(nxJson, 'test', {
    'executor': '@nx/jest:jest',
    'outputs': [
      '{workspaceRoot}/coverage/{projectRoot}',
      '{workspaceRoot}/junit/{projectRoot}',
      '{workspaceRoot}/{projectRoot}/coverage',
    ],
    'inputs': [
      'test',
      '^test',
      '{workspaceRoot}/jest.preset.js',
      '{workspaceRoot}/jest.preset.ts',
      {
        'env': 'JEST_JUNIT_OUTPUT_DIR',
      },
    ],
    'options': {
      'passWithNoTests': true,
      'silent': true,
      'coverageReporters': [
        'json',
      ],
      'codeCoverage': true,
    },
  }, Strategy.OVERWRITE);

  nxJson.cli ??= {};
  nxJson.cli.packageManager ??= 'yarn';

  updateNxJson(tree, nxJson);
}
