import {
  generateFiles,
  getProjects,
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import {
  GetTargetOptions,
  GuessOutputPath,
} from '@rxap/plugin-utilities';
import { clone } from '@rxap/utilities';
import {
  CoerceFilesStructure,
  GetNestApiPrefix,
  GetRootDockerOptions,
  IsApplicationProject,
  IsNestJsProject,
  IsServiceProject,
  IsUserInterfaceProject,
  RootDockerOptions,
} from '@rxap/workspace-utilities';
import { join } from 'path';
import * as path from 'path';
import { stringify } from 'yaml';
import { GitlabCiGeneratorSchema } from './schema';

const dotDocker = {
  image: {
    name: 'gcr.io/kaniko-project/executor:debug',
    entrypoint: [ '' ],
  },
  stage: 'docker',
  tags: [ 'e2-standard-2' ],
  script: '/bin/sh tools/scripts/build-and-push-docker-image.sh',
  environment: {
    action: 'prepare',
    name: '$ENVIRONMENT_NAME',
  },
  variables: [
    'GIT_LFS_SKIP_SMUDGE=1',
  ],
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
};

const docker = {
  extends: '.docker',
  variables: {},
};

const dotStartup = {
  image: 'curlimages/curl:8.3.0',
  stage: 'startup',
  tags: [ 'e2-standard-2' ],
  services: [
    {
      name: '${CI_REGISTRY_IMAGE}${IMAGE_SUFFIX}:${CI_PIPELINE_ID}',
      alias: 'service',
    },
  ],
  environment: {
    action: 'prepare',
    name: '$ENVIRONMENT_NAME',
  },
  variables: {
    SERVICE_HOSTNAME: 'service',
  },
  script: [
    'curl http://$SERVICE_HOSTNAME:$SERVICE_PORT/$SERVICE_PATH',
  ],
};

const startup = {
  extends: '.startup',
  variables: {},
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
  const dockerYaml: any = {
    '.docker': dotDocker,
  };

  for (const [ projectName, project ] of getProjects(tree).entries()) {

    if (skipProject(tree, options, project, projectName)) {
      continue;
    }

    const dockerTargetOptions = GetTargetOptions(project.targets['docker'], 'production');

    const imageName = dockerTargetOptions.imageName ?? rootDocker.imageName;
    const imageSuffix = dockerTargetOptions.imageSuffix;
    const dockerfile = dockerTargetOptions.dockerfile;
    const context = dockerTargetOptions.context ??
                    (
                      project.targets['build'] ? GuessOutputPath(project.root, project.targets['build'], 'production') :
                      null
                    ) ??
                    project.sourceRoot ??
                    project.root;

    dockerYaml[`docker:${ projectName }`] = clone(docker);
    dockerYaml[`docker:${ projectName }`].variables = {
      IMAGE_NAME: imageName,
      PROJECT_NAME: projectName,
    };

    if (IsNestJsProject(project)) {
      if (!project.sourceRoot) {
        throw new Error(`The project '${ projectName }' has no source root`);
      }
      dockerYaml[`docker:${ projectName }`].variables.PATH_PREFIX = '/' + GetNestApiPrefix(tree, {}, project.sourceRoot,
        projectName,
      );
    }

    if (context) {
      dockerYaml[`docker:${ projectName }`].variables.DOCKER_CONTEXT = context;
    }

    if (imageSuffix) {
      dockerYaml[`docker:${ projectName }`].variables.IMAGE_SUFFIX = imageSuffix;
    }

    if (dockerfile) {
      dockerYaml[`docker:${ projectName }`].variables.DOCKERFILE = dockerfile;
    }

  }

  return stringify(dockerYaml);
}



function generateStartupGitlabCiFileContent(
  tree: Tree,
  options: GitlabCiGeneratorSchema,
  rootDocker: RootDockerOptions,
) {
  const startupYaml: any = {
    '.startup': dotStartup,
  };

  for (const [ projectName, project ] of getProjects(tree).entries()) {

    if (skipProject(tree, options, project, projectName)) {
      continue;
    }

    if (!IsUserInterfaceProject(project) && !IsServiceProject(project)) {
      continue;
    }

    const dockerTargetOptions = GetTargetOptions(project.targets['docker'], 'production');

    const imageName = dockerTargetOptions.imageName ?? rootDocker.imageName;
    const imageSuffix = dockerTargetOptions.imageSuffix;

    startupYaml[`startup:${ projectName }`] = clone(startup);
    startupYaml[`startup:${ projectName }`].variables = {
      IMAGE_NAME: imageName,
    };

    if (IsServiceProject(project)) {
      startupYaml[`startup:${ projectName }`].variables.SERVICE_PORT = '3000';
      startupYaml[`startup:${ projectName }`].variables.SERVICE_PATH = 'info';
    }

    if (IsUserInterfaceProject(project)) {
      startupYaml[`startup:${ projectName }`].variables.SERVICE_PORT = '80';
    }

    if (imageSuffix) {
      startupYaml[`startup:${ projectName }`].variables.IMAGE_SUFFIX = imageSuffix;
    }

  }

  return stringify(startupYaml);
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

  tree.write('.gitlab/ci/jobs/docker.yaml', dockerGitlabCiYaml);

  const startupGitlabCiYaml = generateStartupGitlabCiFileContent(tree, options, rootDocker);

  tree.write('.gitlab/ci/jobs/startup.yaml', startupGitlabCiYaml);

}

export default gitlabCiGenerator;
