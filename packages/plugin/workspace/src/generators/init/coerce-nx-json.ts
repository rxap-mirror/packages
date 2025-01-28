import {
  readNxJson,
  Tree,
  updateNxJson,
} from '@nx/devkit';
import {
  CoerceNxJsonGenerators,
  CoerceNxJsonNamedInputs,
  CoerceNxPlugin,
  GetWorkspaceProjectName,
  IsRxapRepository,
  Strategy,
} from '@rxap/workspace-utilities';
import { InitGeneratorSchema } from './schema';

export function coerceNxJson(tree: Tree, options: InitGeneratorSchema) {
  const nxJson = readNxJson(tree)!;

  nxJson.defaultProject ??= GetWorkspaceProjectName(tree);

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

  nxJson.cli ??= {};
  nxJson.cli.packageManager ??= 'yarn';

  if (IsRxapRepository(tree)) {
    CoerceNxPlugin(nxJson, './packages/plugin/workspace/src/plugin.ts');
  } else {
    CoerceNxPlugin(nxJson, '@rxap/plugin-workspace/plugin');
  }

  if (options.packages) {
    nxJson.release ??= {};
    nxJson.release.projectsRelationship ??= 'independent';
    nxJson.release.version ??= {};
    nxJson.release.version.preVersionCommand ??= 'yarn dlx nx run-many -t build';
    nxJson.release.version.conventionalCommits ??= true;
    nxJson.release.changelog ??= {};
    nxJson.release.changelog.projectChangelogs ??= true;
  }

  updateNxJson(tree, nxJson);
}
