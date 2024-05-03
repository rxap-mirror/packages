import {
  getProjects,
  Tree,
} from '@nx/devkit';
import { GuessOutputPath } from '@rxap/plugin-utilities';
import { CoerceSuffix } from '@rxap/utilities';
import {
  GetNestApiPrefix,
  GetTargetOptions,
  GetWorkspaceName,
  IsNestJsProject,
  IsStandaloneWorkspace,
  RootDockerOptions,
} from '@rxap/workspace-utilities';
import { stringify } from 'yaml';
import { processBuildArgs } from '../../lib/utilities';
import { DockerGeneratorSchema } from './schema';
import { skipProject } from './skip-project';

const DOT_DOCKER = {
  image: {
    name: 'registry.gitlab.com/rxap/gitlab-ci/kaniko:latest',
    entrypoint: [ '' ],
  },
  stage: 'docker',
  script: 'sh ./tools/scripts/build-and-push-docker-image.sh',
  environment: {
    action: 'prepare',
    name: '$ENVIRONMENT_NAME',
  },
  variables: {
    GIT_LFS_SKIP_SMUDGE: '1',
  },
  rules: [
    {
      if: '$DISABLE_DOCKER_BUILD',
      when: 'never',
    },
    {
      if: '$CI_COMMIT_TAG =~ /^v\\d+\\.\\d+\\.\\d+/',
      when: 'on_success',
    },
    {
      if: '$CI_MERGE_REQUEST_TARGET_BRANCH_NAME == $CI_DEFAULT_BRANCH',
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
      if: '$CI_DEFAULT_BRANCH == $CI_COMMIT_BRANCH',
      when: 'on_success',
    },
    {
      when: 'manual',
      allow_failure: true,
    },
  ],
  needs: [ 'run' ],
  tags: [],
};
const DOCKER = {
  extends: '.docker',
  variables: {} as Record<string, string>,
  parallel: {
    matrix: [],
  },
};

export function generateDockerGitlabCiFileContent(
  tree: Tree,
  options: DockerGeneratorSchema,
  rootDocker: RootDockerOptions,
): string {

  const dotDocker = structuredClone(DOT_DOCKER);

  if (options.tags?.length) {
    dotDocker.tags = options.tags;
  }

  const dockerYaml = {
    '.docker': dotDocker,
    docker: structuredClone(DOCKER),
  };

  if (rootDocker.imageName) {
    dockerYaml.docker.variables.IMAGE_NAME = rootDocker.imageName;
  }

  for (const [ projectName, project ] of
    Array.from(getProjects(tree).entries()).sort(([ a ], [ b ]) => a.localeCompare(b))) {

    if (skipProject(tree, options, project, projectName)) {
      continue;
    }

    console.log(`add project: ${ projectName } to docker gitlab-ci job`);

    const dockerTargetOptions = GetTargetOptions(project.targets['docker'], 'production');

    const imageSuffix = dockerTargetOptions.imageSuffix;
    const dockerfile = dockerTargetOptions.dockerfile;
    const context = dockerTargetOptions.context ??
                    (
                      project.targets['build'] ? GuessOutputPath(projectName, project.root, project.targets['build'], 'production') :
                      null
                    ) ??
                    project.sourceRoot ??
                    project.root;

    const matrix: Record<string, string> = {};

    dockerYaml.docker.parallel.matrix.push(matrix);

    if (projectName === 'workspace' && IsStandaloneWorkspace(tree)) {
      matrix.PROJECT_NAME = GetWorkspaceName(tree);
    } else {
      matrix.PROJECT_NAME = projectName;
    }

    if (dockerTargetOptions.imageName && dockerTargetOptions.imageName !== rootDocker.imageName) {
      matrix.IMAGE_NAME = dockerTargetOptions.imageName as string;
    }

    if (IsNestJsProject(project)) {
      if (!project.sourceRoot) {
        throw new Error(`The project '${ projectName }' has no source root`);
      }
      matrix.PATH_PREFIX = CoerceSuffix(GetNestApiPrefix(
        tree,
        {},
        project.sourceRoot,
        matrix.PROJECT_NAME,
      ), '/', /\/$/);
    }

    if (Array.isArray(dockerTargetOptions.buildArgList)) {
      const buildArgList = processBuildArgs(
        dockerTargetOptions.buildArgList,
        matrix.PROJECT_NAME,
        project.sourceRoot,
        { PROJECT_NAME: matrix.PROJECT_NAME },
        path => tree.exists(path),
        (path, encoding) => tree.read(path, encoding),
      );
      for (const buildArg of buildArgList.sort()) {
        if (buildArg.includes('=')) {
          const [ env, value ] = buildArg.split('=');
          matrix[env] = value;
        } else {
          console.warn(`Build arg value for '${ buildArg }' is not defined`);
        }
      }
    }

    if (context) {
      matrix.DOCKER_CONTEXT = context as string;
    }

    if (imageSuffix) {
      matrix.IMAGE_SUFFIX = imageSuffix as string;
    }

    if (dockerfile) {
      matrix.DOCKERFILE = dockerfile as string;
    }

  }

  return stringify(dockerYaml);
}
