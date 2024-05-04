import {
  addProjectConfiguration,
  getProjects,
  Tree,
  updateProjectConfiguration,
} from '@nx/devkit';
import { CoerceTarget } from '@rxap/workspace-utilities';
import { InitGeneratorSchema } from './schema';

export function coerceWorkspaceProject(tree: Tree, options: InitGeneratorSchema) {

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

  updateProjectConfiguration(tree, 'workspace', workspaceProject);

}
