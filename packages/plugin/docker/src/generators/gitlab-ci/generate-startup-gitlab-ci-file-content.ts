import {
  getProjects,
  Tree,
} from '@nx/devkit';
import { GetTargetOptions } from '@rxap/plugin-utilities';
import {
  IsServiceProject,
  IsUserInterfaceProject,
  RootDockerOptions,
} from '@rxap/workspace-utilities';
import { stringify } from 'yaml';
import { GitlabCiGeneratorSchema } from './schema';
import { skipProject } from './skip-project';

const dotStartup = {
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
      if: '$CI_COMMIT_TAG =~ /^v\\d+\\.\\d+\\.\\d+$/',
      when: 'on_success',
    },
    {
      when: 'manual',
      allow_failure: true,
    },
  ],
  tags: [],
};
const startup = {
  extends: '.startup',
  variables: {} as Record<string, string>,
  parallel: {
    matrix: [],
  },
};

export function generateStartupGitlabCiFileContent(
  tree: Tree,
  options: GitlabCiGeneratorSchema,
  rootDocker: RootDockerOptions,
) {

  if (options.tags?.length) {
    dotStartup.tags = options.tags;
  }

  const startupYaml = {
    '.startup': dotStartup,
    startup: startup,
  };

  if (options.gitlab !== false) {
    startupYaml['.startup'].variables.SERVICE_REGISTRY_IMAGE = '${CI_REGISTRY_IMAGE}';
  }

  if (options.gcp) {
    startupYaml['.startup'].variables.SERVICE_REGISTRY_IMAGE = '${GCP_REGISTRY}/${GCP_PROJECT}/${IMAGE_NAME}';
  }

  if (rootDocker.imageName) {
    startup.variables.IMAGE_NAME = rootDocker.imageName;
  }

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

    const matrix: Record<string, string> = {};

    startupYaml.startup.parallel.matrix.push(matrix);

    if (dockerTargetOptions.imageName && dockerTargetOptions.imageName !== rootDocker.imageName) {
      matrix.IMAGE_NAME = dockerTargetOptions.imageName as string;
    }

    if (IsServiceProject(project)) {
      matrix.SERVICE_PORT = '3000';
      matrix.SERVICE_PATH = '/info';
    }

    if (IsUserInterfaceProject(project)) {
      matrix.SERVICE_PORT = '80';
    }

    if (imageSuffix) {
      matrix.IMAGE_SUFFIX = imageSuffix;
    }

  }

  return stringify(startupYaml);
}
