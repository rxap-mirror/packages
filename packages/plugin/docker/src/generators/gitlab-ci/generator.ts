import {
  generateFiles,
  getProjects,
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import {
  GetTarget,
  GetTargetOptions,
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
};

const docker = {
  extends: '.docker',
  variables: {},
  environment: {
    name: '$ENVIRONMENT_NAME',
  },
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

export function getOutputPathFromTarget(
  project: ProjectConfiguration,
  targetName = 'build',
  configurationName = 'production',
) {
  const target = GetTarget(project, targetName);
  if (!target) {
    return null;
  }
  const options = GetTargetOptions(target, configurationName);
  return options.outputPath ?? null;
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
      getOutputPathFromTarget(project) ??
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

  const gitlabCiYaml = stringify(dockerYaml);

  console.log('.gitlab/ci/jobs/docker.yaml');
  console.log(gitlabCiYaml);
  tree.write('.gitlab/ci/jobs/docker.yaml', gitlabCiYaml);

}

export default gitlabCiGenerator;
