const Handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

console.log({
  CI_BUILDS_DIR: process.env.CI_PROJECT_DIR,
  ENVIRONMENT_NAME: process.env.ENVIRONMENT_NAME,
  DEPLOYMENT_TIER: process.env.DEPLOYMENT_TIER,
});

const BASE_PATH = process.env.CI_PROJECT_DIR ?? '';
const TEMPLATE_PATH = path.join(
  BASE_PATH,
  '.gitlab/ci/generator/localazy-upload/localazy-upload.gitlab-ci.yml.handlebars',
);
const TARGET_PATH = path.join(
  BASE_PATH,
  'localazy-upload.gitlab-ci.yml',
);
const WORKSPACE_FILE = path.join(
  BASE_PATH,
  'workspace.json',
);

const workspace = JSON.parse(fs.readFileSync(WORKSPACE_FILE)
  .toString('utf-8'));

const projectList = [];

for (const [ project, projectPath ] of Object.entries(workspace.projects)) {

  const projectConfig = JSON.parse(fs.readFileSync(path.join(
      BASE_PATH,
      projectPath,
      'project.json',
    ))
    .toString('utf-8'));

  if (projectConfig.targets['localazy-upload']) {
    projectList.push({
      name: project,
      environmentName: process.env.ENVIRONMENT_NAME,
      deploymentTier: process.env.DEPLOYMENT_TIER,
    });
  }

}

const template = Handlebars.compile(fs.readFileSync(TEMPLATE_PATH)
  .toString('utf-8'));

const generated = template({ projectList });

console.log(
  `write to: '${ TARGET_PATH }'\n\n`,
  generated,
);

fs.writeFileSync(
  TARGET_PATH,
  generated,
);
