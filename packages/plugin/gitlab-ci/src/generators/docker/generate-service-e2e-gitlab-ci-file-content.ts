import {
  getProjects,
  Tree,
} from '@nx/devkit';
import {
  GetTargetOptions,
  HasProject,
  IsServiceProject,
  RootDockerOptions,
} from '@rxap/workspace-utilities';
import { stringify } from 'yaml';
import { DockerGeneratorSchema } from './schema';
import { skipProject } from './skip-project';

const DOT_SERVICE_E2E = {
  extends: '.run',
  stage: 'e2e',
  needs: [
    {
      job: 'docker',
      artifacts: false,
    },
    {
      job: 'startup',
      artifacts: false,
      optional: true,
    }
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
    HOST: 'service',
    PORT: '3000',
    ROOT_DOMAIN: '$ROOT_DOMAIN',
  } as Record<string, string>,
  artifacts: {
    name: "${CI_COMMIT_REF_SLUG}_run_${TARGET}",
    paths: [ "coverage", "junit" ],
    expire_in: '1 week',
    reports: { junit: 'junit/**/junit.xml' },
  },
  rules: [
    {
      if: '$DISABLE_SERVICE_E2E_TESTS',
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
const SERVICE_E2E = {
  extends: '.service-e2e',
  variables: {} as Record<string, string>,
  parallel: {
    matrix: [],
  },
};

export function generateServiceE2eGitlabCiFileContent(
  tree: Tree,
  options: DockerGeneratorSchema,
  rootDocker: RootDockerOptions,
) {

  const dotServiceE2e = structuredClone(DOT_SERVICE_E2E);

  if (options.tags?.length) {
    dotServiceE2e.tags = options.tags;
  }

  const serviceE2eYaml = {
    '.service-e2e': dotServiceE2e,
    'service-e2e': structuredClone(SERVICE_E2E),
  };

  if (options.gitlab !== false) {
    serviceE2eYaml['.service-e2e'].variables.SERVICE_REGISTRY_IMAGE = '${CI_REGISTRY_IMAGE}';
  }

  if (options.gcp) {
    serviceE2eYaml['.service-e2e'].variables.SERVICE_REGISTRY_IMAGE = '${GCP_REGISTRY}/${GCP_PROJECT}/${IMAGE_NAME}';
  }

  if (rootDocker.imageName) {
    serviceE2eYaml['service-e2e'].variables.IMAGE_NAME = rootDocker.imageName;
  }

  for (const [ projectName, project ] of
    Array.from(getProjects(tree).entries()).sort(([ a ], [ b ]) => a.localeCompare(b))) {

    if (skipProject(tree, options, project, projectName)) {
      continue;
    }

    if (!IsServiceProject(project)) {
      continue;
    }

    const e2eProjectName = `${projectName}-e2e`;
    if (!HasProject(tree, e2eProjectName)) {
      continue;
    }

    const dockerTargetOptions = GetTargetOptions(project.targets['docker'], 'production');

    const imageSuffix = dockerTargetOptions.imageSuffix as string | undefined;

    const matrix: Record<string, string> = {};

    serviceE2eYaml['service-e2e'].parallel.matrix.push(matrix);

    if (dockerTargetOptions.imageName && dockerTargetOptions.imageName !== rootDocker.imageName) {
      matrix.IMAGE_NAME = dockerTargetOptions.imageName as string;
    }

    matrix.TARGET = `${e2eProjectName}:e2e:ci`;

    if (imageSuffix) {
      matrix.IMAGE_SUFFIX = imageSuffix;
    }

  }

  return stringify(serviceE2eYaml);
}
