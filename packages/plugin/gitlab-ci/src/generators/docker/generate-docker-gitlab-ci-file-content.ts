import {
  getProjects,
  Tree,
} from '@nx/devkit';
import { GuessOutputPath } from '@rxap/plugin-utilities';
import {
  clone,
  CoercePrefix,
} from '@rxap/utilities';
import {
  GetNestApiPrefix,
  GetProjectRoot,
  GetProjectSourceRoot,
  GetTargetOptions,
  GetWorkspaceName,
  IsNestJsProject,
  IsStandaloneWorkspace,
  IsWorkspaceProject,
  ProcessBuildArgs,
  RootDockerOptions,
} from '@rxap/workspace-utilities';
import { join } from 'path';
import { stringify } from 'yaml';
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

export function buildDockerMatrix(
  tree: Tree,
  options: DockerGeneratorSchema,
  rootDocker: RootDockerOptions,
) {

  const matrix: Array<Record<string, string>> = [];

  for (const [ projectName, project ] of
    Array.from(getProjects(tree).entries()).sort(([ a ], [ b ]) => a.localeCompare(b))) {

    if (skipProject(tree, options, project, projectName)) {
      continue;
    }

    console.log(`add project: ${ projectName } to docker gitlab-ci job`);

    const dockerTargetOptions = GetTargetOptions(project.targets['docker'], 'production');

    const imageSuffix = dockerTargetOptions.imageSuffix;
    let dockerfile = dockerTargetOptions.dockerfile;
    const context = dockerTargetOptions.context ??
                    (
                      project.targets['build'] ? GuessOutputPath(projectName, project.root, project.targets['build'], 'production') :
                      null
                    ) ??
                    project.sourceRoot ??
                    project.root;

    if (!dockerfile) {
      if (tree.exists(join(GetProjectRoot(project), 'Dockerfile'))) {
        dockerfile = join(GetProjectRoot(project), 'Dockerfile');
      }
    }

    const matrixItem: Record<string, string> = {};

    matrix.push(matrixItem);

    if (IsWorkspaceProject(project) && IsStandaloneWorkspace(tree)) {
      matrixItem.PROJECT_NAME = GetWorkspaceName(tree);
    } else {
      matrixItem.PROJECT_NAME = projectName;
    }

    if (dockerTargetOptions.imageName && dockerTargetOptions.imageName !== rootDocker.imageName) {
      matrixItem.IMAGE_NAME = dockerTargetOptions.imageName as string;
    }

    if (IsNestJsProject(project)) {
      const nestApiPrefix = GetNestApiPrefix(
        tree,
        {},
        GetProjectSourceRoot(project),
        matrixItem.PROJECT_NAME,
      );
      if (nestApiPrefix && typeof nestApiPrefix === 'string') {
        matrixItem.PATH_PREFIX = CoercePrefix(nestApiPrefix, '/');
      }
    }

    if (Array.isArray(dockerTargetOptions.buildArgList)) {
      const buildArgList = ProcessBuildArgs(
        dockerTargetOptions.buildArgList,
        matrixItem.PROJECT_NAME,
        GetProjectSourceRoot(project),
        { PROJECT_NAME: matrixItem.PROJECT_NAME },
        path => tree.exists(path),
        (path, encoding) => tree.read(path, encoding),
      );
      for (const buildArg of buildArgList.sort()) {
        if (buildArg.includes('=')) {
          const [ env, value ] = buildArg.split('=');
          if (env === 'PATH_PREFIX') {
            matrixItem[env] = CoercePrefix(value, '/');
          } else {
            matrixItem[env] = value;
          }
          } else {
          console.warn(`Build arg value for '${ buildArg }' is not defined`);
        }
      }
    }

    if (context) {
      matrixItem.DOCKER_CONTEXT = context as string;
    }

    if (imageSuffix) {
      matrixItem.IMAGE_SUFFIX = imageSuffix as string;
    }

    if (dockerfile) {
      matrixItem.DOCKERFILE = dockerfile as string;
    }

  }


  return matrix;

}

export function generateDockerGitlabCiFileContent(
  tree: Tree,
  options: DockerGeneratorSchema,
  rootDocker: RootDockerOptions,
): string {

  const dotDocker = clone(DOT_DOCKER);

  if (options.tags?.length) {
    dotDocker.tags = options.tags;
  }

  const dockerYaml = {
    '.docker': dotDocker,
    docker: clone(DOCKER),
  };

  if (rootDocker.imageName) {
    dockerYaml.docker.variables.IMAGE_NAME = rootDocker.imageName;
  }

  dockerYaml.docker.parallel.matrix = buildDockerMatrix(tree, options, rootDocker);

  return stringify(dockerYaml);
}
