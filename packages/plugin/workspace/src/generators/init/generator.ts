import {
  addProjectConfiguration,
  getProjects,
  NxJsonConfiguration,
  readNxJson,
  Tree,
  updateNxJson,
  updateProjectConfiguration,
} from '@nx/devkit';
import { CoerceIgnorePattern } from '@rxap/generator-utilities';
import { ApplicationInitWorkspace } from '@rxap/plugin-application';
import { LibraryInitWorkspace } from '@rxap/plugin-library';
import {
  deepMerge,
  MergeDeepLeft,
} from '@rxap/utilities';
import {
  AddPackageJsonDevDependency,
  CoerceFilesStructure,
  CoerceLernaJson,
  CoerceNxJsonCacheableOperation,
  CoerceTarget,
  Strategy,
  UpdatePackageJson,
} from '@rxap/workspace-utilities';
import { join } from 'path';
import { InitGeneratorSchema } from './schema';

const gitIgnore = [
  // nx
  '/migrations.json',
  // angular
  '.angular',
  // rxap
  '/docker-compose.frontends.yml',
  '/docker-compose.services.yml',
  // compiled output
  'dist',
  'tmp',
  'tmp.*',
  '/out-tsc',
  // dependencies
  'node_modules',
  // IDEs and editors
  '.project',
  '.classpath',
  '.c9',
  '*.launch',
  '.settings/',
  '*.sublime-workspace',
  // IDE - VSCode
  '.vscode/*',
  '!.vscode/settings.json',
  '!.vscode/tasks.json',
  '!.vscode/launch.json',
  '!.vscode/extensions.json',
  // misc
  '.sass-cache',
  'connect.lock',
  'coverage',
  '*.log',
  '*.lock',
  '*.patch',
  'typings',
  '.env',
  // system files
  '.DS_Store',
  'Thumbs.db',
  // yarn
  '.yarn/*',
  '!yarn.lock',
  '!.yarn/patches',
  '!.yarn/plugins',
  '!.yarn/releases',
  '!.yarn/sdks',
  '!.yarn/versions',
  // '!.yarn/cache',
];

const prettierIgnore = [
  'dist',
  'coverage',
  '.angular',
  '.yarn',
  '*.handlebars',
  'node_modules',
  'tmp',
  'tmp.*',
];

function coerceWorkspaceProject(tree: Tree, options: InitGeneratorSchema) {

  if (!getProjects(tree).get('workspace')) {
    addProjectConfiguration(tree, 'workspace', {
      root: '',
    });
  }

  const workspaceProject = getProjects(tree).get('workspace')!;

  CoerceTarget(workspaceProject, 'ci-info', {
    executor: '@rxap/plugin-workspace:ci-info',
    inputs: [
      {
        'env': 'CI_COMMIT_TIMESTAMP',
      },
      {
        'env': 'CI_COMMIT_BRANCH',
      },
      {
        'env': 'CI_COMMIT_TAG',
      },
      {
        'env': 'CI_COMMIT_SHA',
      },
      {
        'env': 'CI_ENVIRONMENT_NAME',
      },
      {
        'env': 'CI_JOB_ID',
      },
      {
        'env': 'CI_PIPELINE_ID',
      },
      {
        'env': 'CI_PROJECT_ID',
      },
      {
        'env': 'CI_RUNNER_ID',
      },
      {
        'env': 'CI_ENVIRONMENT_URL',
      },
      {
        'env': 'CI_ENVIRONMENT_TIER',
      },
      {
        'env': 'CI_ENVIRONMENT_SLUG',
      },
      {
        'env': 'CI_COMMIT_REF_SLUG',
      },
    ],
    outputs: [
      '{workspaceRoot}/dist/**/build.json',
    ],
  });

  if (!options.standalone) {
    CoerceTarget(workspaceProject, 'docker-compose', {
      executor: '@rxap/plugin-library:run-generator',
      options: {
        generator: '@rxap/plugin-workspace:docker-compose',
        withoutProjectArgument: true,
      },
    });
  }

  CoerceTarget(workspaceProject, 'docker-gitlab-ci', {
    executor: '@rxap/plugin-library:run-generator',
    options: {
      generator: '@rxap/plugin-docker:gitlab-ci',
      withoutProjectArgument: true,
    },
  });

  CoerceTarget(workspaceProject, 'init', {
    executor: '@rxap/plugin-library:run-generator',
    options: {
      generator: '@rxap/plugin-library:init',
      withoutProjectArgument: true,
      options: {
        applications: true,
      },
    },
  });

  updateProjectConfiguration(tree, 'workspace', workspaceProject);

}

async function coerceRootPackageJsonScripts(tree: Tree) {
  await UpdatePackageJson(tree, (json) => {
    json.scripts ??= {};
    json.scripts['prepare'] ??= 'husky install';
    json.scripts['schematic'] ??= 'bash tools/scripts/schematic.sh';
    json.scripts['server'] ??= 'bash tools/scripts/start-local-dev-services.sh';
    json.scripts['server:status'] ??= 'bash tools/scripts/get-local-dev-services-status.sh';
    json.scripts['server:stop'] ??= 'bash tools/scripts/stop-local-dev-services.sh';
    json.scripts['init:env'] ??= 'bash tools/scripts/setup-env-file.sh';
  });
}

async function coercePackageJsonLicense(tree: Tree) {
  await UpdatePackageJson(tree, (json) => {
    json.license = 'GPL-3.0-or-later';
  });
}

function CoerceNxJsonNamedInputs(
  nxJson: NxJsonConfiguration,
  name: string,
  pattern: string[],
  strategy: Strategy = Strategy.DEFAULT,
) {
  nxJson.namedInputs ??= {};
  switch (strategy) {
    case Strategy.DEFAULT:
      nxJson.namedInputs[name] ??= pattern;
      break;
    case Strategy.OVERWRITE:
      nxJson.namedInputs[name] = pattern;
      break;
    case Strategy.MERGE:
      nxJson.namedInputs[name] = pattern;
      break;
    case Strategy.REPLACE:
      nxJson.namedInputs[name] = pattern;
      break;
  }
}

function CoerceNxJsonGenerators(
  nxJson: NxJsonConfiguration,
  name: string,
  options: Record<string, unknown>,
  strategy: Strategy = Strategy.DEFAULT,
) {

  nxJson.generators ??= {};

  switch (strategy) {
    case Strategy.DEFAULT:
      nxJson.generators[name] ??= options;
      break;
    case Strategy.OVERWRITE:
      nxJson.generators[name] ??= options;
      nxJson.generators[name] = deepMerge(nxJson.generators[name], options);
      break;
    case Strategy.MERGE:
      nxJson.generators[name] ??= options;
      nxJson.generators[name] = deepMerge(nxJson.generators[name], options, MergeDeepLeft);
      break;
    case Strategy.REPLACE:
      nxJson.generators[name] = options;
      break;
  }

}

function coerceNxJson(tree: Tree) {
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
    'prefix': 'rxap',
    'standalone': true,
    'addTailwind': true,
    'routing': true,
    'directory': `user-interface`,
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
    "executor": "@nx/jest:jest",
    "outputs": [
      "{workspaceRoot}/coverage/{projectRoot}",
      "{workspaceRoot}/junit/{projectRoot}",
      "{workspaceRoot}/{projectRoot}/coverage"
    ],
    "inputs": [
      "test",
      "^test",
      "{workspaceRoot}/jest.preset.js",
      "{workspaceRoot}/jest.preset.ts",
      {
        "env": "JEST_JUNIT_OUTPUT_DIR"
      }
    ],
    "options": {
      "passWithNoTests": true,
      "silent": true,
      "coverageReporters": [
        "json"
      ],
      "codeCoverage": true
    },
  }, Strategy.REPLACE);

  updateNxJson(tree, nxJson);
}

export async function initGenerator(tree: Tree, options: InitGeneratorSchema) {
  CoerceFilesStructure(tree, {
    srcFolder: join(__dirname, 'files', 'general'),
    target: '',
    overwrite: options.overwrite,
  });

  if (!options.skipLicense) {
    CoerceFilesStructure(tree, {
      srcFolder: join(__dirname, 'files', 'gpl'),
      target: '',
      overwrite: options.overwrite,
    });
  }

  if (options.packages) {
    CoerceLernaJson(tree);
  }

  if (options.standalone) {
    // TODO : write a proper function that renames the project
    // ensure that the project name is updated in the hole project.json and not only in the name property
    if (!tree.exists('project.json')) {
      throw new Error('This is not standalone workspace. The /project.json file does not exist!');
    }
    const projectJson = JSON.parse(tree.read('project.json')!.toString('utf-8'));
    projectJson.name = 'workspace';
    tree.write('project.json', JSON.stringify(projectJson, null, 2));
  }

  await AddPackageJsonDevDependency(tree, 'husky', 'latest', { soft: true });
  await AddPackageJsonDevDependency(tree, '@commitlint/cli', 'latest', { soft: true });
  await AddPackageJsonDevDependency(tree, '@commitlint/config-conventional', 'latest', { soft: true });

  CoerceIgnorePattern(tree, '.gitignore', gitIgnore);
  CoerceIgnorePattern(tree, '.prettierignore', prettierIgnore);

  coerceWorkspaceProject(tree, options);
  coerceNxJson(tree);
  await coerceRootPackageJsonScripts(tree);
  if (!options.skipLicense) {
    await coercePackageJsonLicense(tree);
  }

  if (!options.standalone) {
    LibraryInitWorkspace(tree, options);
  }

  if (options.applications) {
    await ApplicationInitWorkspace(tree, options);
  }
}

export default initGenerator;
