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
import { GetRootDockerOptions } from '@rxap/workspace-utilities';
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
  script: [
    'curl http://service:3000/info',
  ],
};

const startup = {
  extends: '.setup',
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

export async function gitlabCiGenerator(
  tree: Tree,
  options: GitlabCiGeneratorSchema,
) {

  if (options.overwrite || !tree.exists('tools/scripts/build-and-push-docker-image.sh')) {
    generateFiles(tree, path.join(__dirname, 'files'), 'tools/scripts', options);
  }

  const rootDocker = GetRootDockerOptions(tree);

  const dockerYaml: any = {
    '.docker': dotDocker,
  };

  const startupYaml: any = {
    '.startup': dotStartup,
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
      (project.targets['build'] ? GuessOutputPath(project.root, project.targets['build'], 'production') : null) ??
      project.sourceRoot ??
      project.root;

    dockerYaml[`docker:${ projectName }`] = clone(docker);
    startupYaml[`startup:${ projectName }`] = clone(startup);
    dockerYaml[`docker:${ projectName }`].variables = {
      IMAGE_NAME: imageName,
    };
    startupYaml[`startup:${ projectName }`].variables = {
      IMAGE_NAME: imageName,
    };

    if (context) {
      dockerYaml[`docker:${ projectName }`].variables.DOCKER_CONTEXT = context;
    }

    if (imageSuffix) {
      dockerYaml[`docker:${ projectName }`].variables.IMAGE_SUFFIX = imageSuffix;
      startupYaml[`startup:${ projectName }`].variables.IMAGE_SUFFIX = imageSuffix;
    }

    if (dockerfile) {
      dockerYaml[`docker:${ projectName }`].variables.DOCKERFILE = dockerfile;
    }

  }

  const dockerGitlabCiYaml = stringify(dockerYaml);

  console.log('.gitlab/ci/jobs/docker.yaml');
  console.log(dockerGitlabCiYaml);
  tree.write('.gitlab/ci/jobs/docker.yaml', dockerGitlabCiYaml);

  const startupGitlabCiYaml = stringify(startupYaml);

  console.log('.gitlab/ci/jobs/startup.yaml');
  console.log(startupGitlabCiYaml);
  tree.write('.gitlab/ci/jobs/startup.yaml', startupGitlabCiYaml);

}

export default gitlabCiGenerator;
