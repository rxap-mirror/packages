import {
  addProjectConfiguration,
  generateFiles,
  getProjects,
  Tree,
} from '@nx/devkit';
import { CoerceIgnorePattern } from '@rxap/generator-utilities';
import { ApplicationInitGenerator } from '@rxap/plugin-application';
import { LibraryInitGenerator } from '@rxap/plugin-library';
import { CoerceTarget } from '@rxap/workspace-utilities';
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
  '!.yarn/patches',
  '!.yarn/plugins',
  '!.yarn/releases',
  '!.yarn/sdks',
  '!.yarn/versions',
  '!.yarn/cache',
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

function coerceWorkspaceProject(tree: Tree) {

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
      'dist/**/build.json',
    ],
  });

  CoerceTarget(workspaceProject, 'docker-compose', {
    executor: '@rxap/plugin-library:run-generator',
    options: {
      generator: '@rxap/plugin-workspace:docker-compose',
      withoutProjectArgument: true,
    },
  });

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

}

export async function initGenerator(tree: Tree, options: InitGeneratorSchema) {
  generateFiles(tree, join(__dirname, 'files/general'), '', { tmpl: '' });
  if (options.applications) {
    generateFiles(tree, join(__dirname, 'files/applications'), '', { tmpl: '' });
  }
  if (options.packages) {
    generateFiles(tree, join(__dirname, 'files/packages'), '', { tmpl: '' });
  }

  CoerceIgnorePattern(tree, '.gitignore', gitIgnore);
  CoerceIgnorePattern(tree, '.prettierignore', prettierIgnore);

  coerceWorkspaceProject(tree);

  await LibraryInitGenerator(tree, { overwrite: options.overwrite });
  await ApplicationInitGenerator(tree, { overwrite: options.overwrite });
}

export default initGenerator;
