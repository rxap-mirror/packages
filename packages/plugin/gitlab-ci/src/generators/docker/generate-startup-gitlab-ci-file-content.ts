import {
  getProjects,
  Tree,
} from '@nx/devkit';
import {
  GetTargetOptions,
  IsServiceProject,
  IsUserInterfaceProject,
  RootDockerOptions,
} from '@rxap/workspace-utilities';
import { stringify } from 'yaml';
import { DockerGeneratorSchema } from './schema';
import { skipProject } from './skip-project';

const DOT_STARTUP = {
  image: 'curlimages/curl:8.3.0',
  stage: 'startup',
  needs: [
    {
      job: 'docker',
      artifacts: false,
    },
  ],
  services: [
    {
      name: '${SERVICE_REGISTRY_IMAGE}${IMAGE_SUFFIX}:${CI_PIPELINE_ID}',
      alias: 'service',
    },
  ],
  environment: {
    action: 'prepare',
    name: '$ENVIRONMENT_NAME',
  },
  variables: {
    SERVICE_HOSTNAME: 'service',
    ROOT_DOMAIN: '$ROOT_DOMAIN',
  } as Record<string, string>,
  script: 'curl --fail --location "http://${SERVICE_HOSTNAME}:${SERVICE_PORT}${SERVICE_PATH}"',
  rules: [
    {
      if: '$DISABLE_STARTUP_TESTS',
      when: 'never',
    },
    {
      if: '$CI_COMMIT_TAG =~ /^v\\d+\\.\\d+\\.\\d+/',
      when: 'on_success',
    },
    {
      if: '$CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH',
      when: 'on_success',
    },
    {
      if: '$CI_MERGE_REQUEST_SOURCE_BRANCH_NAME =~ /^renovate\\// || $CI_COMMIT_BRANCH =~ /^renovate\\//',
      when: 'on_success',
    },
    {
      if: '$CI_MERGE_REQUEST_SOURCE_BRANCH_NAME =~ /^snyk-/ || $CI_COMMIT_BRANCH =~ /^snyk-/',
      when: 'on_success',
    },
    {
      when: 'manual',
      allow_failure: true,
    },
  ],
  tags: [],
};
const STARTUP = {
  extends: '.startup',
  variables: {} as Record<string, string>,
  parallel: {
    matrix: [],
  },
};

export function buildStartupMatrix(
  tree: Tree,
  options: DockerGeneratorSchema,
  rootDocker: RootDockerOptions,
): Array<Record<string, string>> {

  const matrix: Array<Record<string, string>> = [];

  for (const [ projectName, project ] of
    Array.from(getProjects(tree).entries()).sort(([ a ], [ b ]) => a.localeCompare(b))) {

    if (skipProject(tree, options, project, projectName)) {
      continue;
    }

    if (!IsUserInterfaceProject(project) && !IsServiceProject(project)) {
      continue;
    }

    const dockerTargetOptions = GetTargetOptions(project.targets['docker'], 'production');

    const imageSuffix = dockerTargetOptions.imageSuffix as string | undefined;

    const matrixItem: Record<string, string> = {};

    matrix.push(matrixItem);

    if (dockerTargetOptions.imageName && dockerTargetOptions.imageName !== rootDocker.imageName) {
      matrixItem.IMAGE_NAME = dockerTargetOptions.imageName as string;
    }

    if (IsServiceProject(project)) {
      matrixItem.SERVICE_PORT = '3000';
      matrixItem.SERVICE_PATH = '/info';
    }

    if (IsUserInterfaceProject(project)) {
      matrixItem.SERVICE_PORT = '80';
      matrixItem.SERVICE_PATH = '/';
    }

    if (imageSuffix) {
      matrixItem.IMAGE_SUFFIX = imageSuffix;
    }

  }

  return matrix;

}

export function generateStartupGitlabCiFileContent(
  tree: Tree,
  options: DockerGeneratorSchema,
  rootDocker: RootDockerOptions,
) {

  const dotStartup = structuredClone(DOT_STARTUP);

  if (options.tags?.length) {
    dotStartup.tags = options.tags;
  }

  const startupYaml = {
    '.startup': dotStartup,
    startup: structuredClone(STARTUP),
  };

  if (options.gitlab !== false) {
    startupYaml['.startup'].variables.SERVICE_REGISTRY_IMAGE = '${CI_REGISTRY_IMAGE}';
  }

  if (options.gcp) {
    startupYaml['.startup'].variables.SERVICE_REGISTRY_IMAGE = '${GCP_REGISTRY}/${GCP_PROJECT}/${IMAGE_NAME}';
  }

  if (rootDocker.imageName) {
    startupYaml.startup.variables.IMAGE_NAME = rootDocker.imageName;
  }

  startupYaml.startup.parallel.matrix = buildStartupMatrix(tree, options, rootDocker);

  return stringify(startupYaml);
}
