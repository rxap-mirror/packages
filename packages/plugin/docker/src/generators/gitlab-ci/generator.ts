import {
  generateFiles,
  getProjects,
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { GetTargetOptions } from '@rxap/plugin-utilities';
import { clone } from '@rxap/utilities';
import * as path from 'path';
import { stringify } from 'yaml';
import { GitlabCiGeneratorSchema } from './schema';

const dotDocker = {
  image: {
    name: 'gcr.io/kaniko-project/executor:debug',
    entrypoint: [ '' ],
  },
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
  needs: [ 'build' ],
};

const docker = {
  extends: '.docker',
  variables: {},
  environment: {
    name: '$ENVIRONMENT_NAME',
    deployment_tier: '$DEPLOYMENT_TIER',
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

export async function gitlabCiGenerator(
  tree: Tree,
  options: GitlabCiGeneratorSchema,
) {

  if (options.overwrite || !tree.exists('tools/scripts/build-and-push-docker-image.sh')) {
    generateFiles(tree, path.join(__dirname, 'files'), 'tools/scripts', options);
  }

  const rootPackageJson = JSON.parse(tree.read('package.json')!.toString('utf-8'));

  const dockerYaml: any = {
    '.docker': dotDocker,
  };

  for (const [ projectName, project ] of getProjects(tree).entries()) {

    if (skipProject(tree, options, project, projectName)) {
      continue;
    }

    console.log(`add project: ${ projectName }`);

    const dockerTargetOptions = GetTargetOptions(project.targets['docker'], 'production');
    const buildTargetOptions = GetTargetOptions(project.targets['build'], 'production');

    const imageName = dockerTargetOptions.imageName ?? rootPackageJson.name;
    const imageSuffix = dockerTargetOptions.imageSuffix ?? '';
    const outputPath = buildTargetOptions.outputPath;

    if (!outputPath) {
      throw new Error(`The outputPath is required for the project ${ projectName }`);
    }

    dockerYaml[`docker:${ projectName }`] = clone(docker);
    dockerYaml[`docker:${ projectName }`].variables = {
      DOCKER_CONTEXT: outputPath,
      IMAGE_NAME: imageName,
    };

    if (imageSuffix) {
      dockerYaml[`docker:${ projectName }`].variables.IMAGE_SUFFIX = imageSuffix;
    }

  }

  const gitlabCiYaml = stringify(dockerYaml);

  console.log('.gitlab/ci/jobs/docker.yaml');
  console.log(gitlabCiYaml);
  tree.write('.gitlab/ci/jobs/docker.yaml', gitlabCiYaml);

}

export default gitlabCiGenerator;
