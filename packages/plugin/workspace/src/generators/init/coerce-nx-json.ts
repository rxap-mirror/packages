import {
  readNxJson,
  Tree,
  updateNxJson,
} from '@nx/devkit';
import {
  CoerceNxJsonCacheableOperation,
  CoerceNxJsonGenerators,
  CoerceNxJsonNamedInputs,
  CoerceTarget,
  CoerceTargetDefaultsInput,
  Strategy,
} from '@rxap/workspace-utilities';
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
    '!{projectRoot}/**/*.stories.@(js|jsx|ts|tsx|mdx)',
    '!{projectRoot}/.storybook/**/*',
    '!{projectRoot}/tsconfig.storybook.json'
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
  CoerceNxJsonGenerators(nxJson, '@nx/plugin:plugin', {
    'publishable': false,
    'tags': 'plugin,nx,nx-plugin',
  });
  CoerceNxJsonGenerators(nxJson, '@nx/js:library', {
    'unitTestRunner': 'jest',
    'publishable': false,
    buildable: false,
  });
  CoerceNxJsonGenerators(nxJson, '@nx/nest:library', {
    'tags': 'nest',
    'publishable': false,
    buildable: false,
  });
  CoerceNxJsonGenerators(nxJson, '@nx/nest:application', {
    'e2eTestRunner': 'none',
    'tags': 'nest',
    'strict': true,
  });
  CoerceNxJsonGenerators(nxJson, '@nx/plugin:executor', {
    'unitTestRunner': 'none',
  });
  CoerceNxJsonGenerators(nxJson, '@nx/plugin:generator', {
    'unitTestRunner': 'none',
  });
  CoerceNxJsonCacheableOperation(nxJson, 'ci-info');
  CoerceNxJsonCacheableOperation(nxJson, 'index-export');
  CoerceNxJsonCacheableOperation(nxJson, 'swagger-build');
  CoerceNxJsonCacheableOperation(nxJson, 'swagger-generate');
  CoerceNxJsonCacheableOperation(nxJson, 'generate-package-json');
  CoerceNxJsonCacheableOperation(nxJson, 'generate-open-api');

  CoerceTargetDefaultsInput(nxJson, '@nx/eslint:lint', 'default',
    '{workspaceRoot}/.eslintrc.json',
    '{workspaceRoot}/.eslintignore',
    '{workspaceRoot}/eslint.config.js',
  );

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
        "html"
      ],
      'codeCoverage': true,
    },
  }, Strategy.OVERWRITE);

  nxJson.cli ??= {};
  nxJson.cli.packageManager ??= 'yarn';

  updateNxJson(tree, nxJson);
}
