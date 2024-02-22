import {
  getProjects,
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import {
  GetTargetOptions,
  GuessOutputPath,
} from '@rxap/plugin-utilities';
import {
  clone,
  CoerceSuffix,
} from '@rxap/utilities';
import {
  CoerceFilesStructure,
  GetNestApiPrefix,
  GetRootDockerOptions,
  IsApplicationProject,
  IsNestJsProject,
  IsServiceProject,
  IsUserInterfaceProject,
  RootDockerOptions,
  YamlMergeFunction,
} from '@rxap/workspace-utilities';
import {
  basename,
  join,
} from 'path';
import { stringify } from 'yaml';
import { processBuildArgs } from '../../lib/utilities';
import { GitlabCiGeneratorSchema } from './schema';

const dotDocker = {
  image: {
    name: 'registry.gitlab.com/rxap/gitlab-ci/kaniko:latest',
    entrypoint: [ '' ],
  },
  stage: 'docker',
  script: './tools/scripts/build-and-push-docker-image.sh',
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
      when: 'on_success',
    },
  ],
  needs: [ 'run' ],
  tags: [],
};

const docker = {
  extends: '.docker',
  variables: {} as Record<string, string>,
  parallel: {
    matrix: []
  }
};

const dotStartup = {
  image: 'curlimages/curl:8.3.0',
  stage: 'startup',
  needs: [
    {
      job: 'docker',
      artifacts: false,
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
    SERVICE_HOSTNAME: 'service',
    ROOT_DOMAIN: '$ROOT_DOMAIN'
  } as Record<string, string>,
  script: 'curl --fail --location "http://${SERVICE_HOSTNAME}:${SERVICE_PORT}${SERVICE_PATH}"',
  rules: [
    {
      if: '$DISABLE_STARTUP_TESTS',
      when: 'never',
    },
    {
      if: '$CI_COMMIT_TAG =~ /^v\\d+\\.\\d+\\.\\d+$/',
      when: 'always',
    },
    {
      when: 'manual',
      allow_failure: true,
    }
  ],
  tags: [],
};

const startup = {
  extends: '.startup',
  variables: {} as Record<string, string>,
  parallel: {
    matrix: []
  }
};

function skipProject(tree: Tree, options: GitlabCiGeneratorSchema, project: ProjectConfiguration, projectName: string) {

  if (!IsApplicationProject(project)) {
    return true;
  }

  if (!project.targets?.['docker']) {
    return true;
  }

  return false;

}

function generateDockerGitlabCiFileContent(
  tree: Tree,
  options: GitlabCiGeneratorSchema,
  rootDocker: RootDockerOptions,
): string {

  if (options.tags?.length) {
    dotDocker.tags = options.tags;
  }

  const dockerYaml = {
    '.docker': dotDocker,
    docker: docker,
  };

  if (rootDocker.imageName) {
    dockerYaml.docker.variables.IMAGE_NAME = rootDocker.imageName;
  }

  for (const [ projectName, project ] of Array.from(getProjects(tree).entries()).sort(([ a ], [ b ]) => a.localeCompare(b))) {

    if (skipProject(tree, options, project, projectName)) {
      continue;
    }

    const dockerTargetOptions = GetTargetOptions(project.targets['docker'], 'production');

    const imageSuffix = dockerTargetOptions.imageSuffix;
    const dockerfile = dockerTargetOptions.dockerfile;
    const context = dockerTargetOptions.context ??
                    (
                      project.targets['build'] ? GuessOutputPath(project.root, project.targets['build'], 'production') :
                      null
                    ) ??
                    project.sourceRoot ??
                    project.root;

    const matrix: Record<string, string> = {};

    dockerYaml.docker.parallel.matrix.push(matrix);

    matrix.PROJECT_NAME = projectName;

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
        projectName,
      ), '/', /\/$/);
    }

    if (Array.isArray(dockerTargetOptions.buildArgList)) {
      const buildArgList = processBuildArgs(
        dockerTargetOptions.buildArgList, projectName, project.sourceRoot, { PROJECT_NAME: projectName });
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



function generateStartupGitlabCiFileContent(
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

  for (const [ projectName, project ] of Array.from(getProjects(tree).entries()).sort(([ a ], [ b ]) => a.localeCompare(b))) {

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

function mergeYaml(tree: Tree, filePath: string, newContent: string) {
  const currentContent = tree.read(filePath, 'utf-8') ?? '';
  const mergedContent = YamlMergeFunction(currentContent, newContent, basename(filePath), filePath);
  tree.write(filePath, mergedContent);
}

export async function gitlabCiGenerator(
  tree: Tree,
  options: GitlabCiGeneratorSchema,
) {

  console.log('gitlab-ci generator:', options);

  CoerceFilesStructure(tree, {
    srcFolder: join(__dirname, 'files'),
    target: 'tools/scripts',
    overwrite: options.overwrite,
  });

  const rootDocker = GetRootDockerOptions(tree);

  const dockerGitlabCiYaml = generateDockerGitlabCiFileContent(tree, options, rootDocker);

  mergeYaml(tree, '.gitlab/ci/jobs/docker.yaml', dockerGitlabCiYaml);

  const startupGitlabCiYaml = generateStartupGitlabCiFileContent(tree, options, rootDocker);

  mergeYaml(tree, '.gitlab/ci/jobs/startup.yaml', startupGitlabCiYaml);

}

export default gitlabCiGenerator;
