import {
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  getProjects,
  Tree,
} from '@nx/devkit';
import * as path from 'path';
import { ComponentTestGeneratorSchema } from './schema';
import { stringify } from 'yaml';

// gitlab ci job template - .component-test
const jobTemplate = {
  extends: '.run',
  stage: 'run',
  variables: {
    TARGET: '${PROJECT}:component-test',
    ADDITIONAL_TARGET_OPTIONS: '--browser ${BROWSER}',
  },
  environment: {
    action: 'prepare',
    name: '$ENVIRONMENT_NAME',
  },
  artifacts: {
    expire_in: '2 hrs',
    exclude: ['node_modules/**'],
    paths: ['**/coverage/coverage-final.json'],
  },
};

const job = {
  extends: '.component-test',
  parallel: {
    matrix: []
  }
};

const gitlabCiConfig: any = {};
gitlabCiConfig['.component-test'] = jobTemplate;
gitlabCiConfig['component-test'] = job;

export async function componentTestGenerator(
  tree: Tree,
  options: ComponentTestGeneratorSchema
) {

  if (options.browserList.length === 0) {
    throw new Error('At least one browser must be provided');
  }

  job['image'] = {
    name: options.cypressImage,
    entrypoint: [''],
  };

  for (const [projectName, project] of getProjects(tree).entries()) {
    if (options.excludeList.includes(projectName)) {
      console.log(`Excluding component-test job for ${projectName}`);
      continue;
    }
    if (project.targets?.['component-test']) {
      console.log(`Adding component-test job for ${projectName}`);
      job.parallel.matrix.push({
        PROJECT: projectName,
        BROWSER: options.browserList.slice()
      });
    } else {
      console.log(`No component-test target found for ${projectName}`);
    }
  }

  const ciFilePath = '.gitlab/ci/jobs/component-test.yaml';

  if (job.parallel.matrix.length === 0) {
    if (tree.exists(ciFilePath)) {
      tree.delete(ciFilePath);
    }
  } else {
    tree.write(ciFilePath, stringify(gitlabCiConfig));
  }

}

export default componentTestGenerator;
