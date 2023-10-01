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
  GetRootDockerOptions,
  RootDockerOptions,
} from '@rxap/workspace-utilities';
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

  if (project.projectType !== 'application') {
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

    console.log(`add project: ${ projectName }`);

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
    };

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

function isUserInterfaceProject(project: ProjectConfiguration) {
  return project.projectType === 'application' && (
    project.tags.includes('user-interface') || project.tags.includes('angular')
  );
}

function isServiceProject(project: ProjectConfiguration) {
  return project.projectType === 'application' && (
    project.tags.includes('service') || project.tags.includes('nestjs') || project.tags.includes('nest')
  );
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

    if (!isUserInterfaceProject(project) && !isServiceProject(project)) {
      continue;
    }

    console.log(`add project: ${ projectName }`);

    const dockerTargetOptions = GetTargetOptions(project.targets['docker'], 'production');

    const imageName = dockerTargetOptions.imageName ?? rootDocker.imageName;
    const imageSuffix = dockerTargetOptions.imageSuffix;

    startupYaml[`startup:${ projectName }`] = clone(startup);
    startupYaml[`startup:${ projectName }`].variables = {
      IMAGE_NAME: imageName,
    };

    if (isServiceProject(project)) {
      startupYaml[`startup:${ projectName }`].variables.SERVICE_PORT = '3000';
      startupYaml[`startup:${ projectName }`].variables.SERVICE_PATH = 'info';
    }

    if (isUserInterfaceProject(project)) {
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

  if (options.overwrite || !tree.exists('tools/scripts/build-and-push-docker-image.sh')) {
    generateFiles(tree, path.join(__dirname, 'files'), 'tools/scripts', options);
  }

  const rootDocker = GetRootDockerOptions(tree);

  const dockerGitlabCiYaml = generateDockerGitlabCiFileContent(tree, options, rootDocker);

  console.log('.gitlab/ci/jobs/docker.yaml');
  console.log(dockerGitlabCiYaml);
  tree.write('.gitlab/ci/jobs/docker.yaml', dockerGitlabCiYaml);

  const startupGitlabCiYaml = generateStartupGitlabCiFileContent(tree, options, rootDocker);

  console.log('.gitlab/ci/jobs/startup.yaml');
  console.log(startupGitlabCiYaml);
  tree.write('.gitlab/ci/jobs/startup.yaml', startupGitlabCiYaml);

}

export default gitlabCiGenerator;
