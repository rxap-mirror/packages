const Handlebars = require('handlebars');
const fs = require('fs');

const storybook = fs.readFileSync('.storybook.gitlab-ci.yml.handlebars').toString('utf-8');

const angularJson = JSON.parse(fs.readFileSync('angular.json').toString('utf-8'));

// a list of projects that have the 'build-storybook' target
const projects = [];

for (const [name, project] of Object.entries(angularJson.projects)) {

  if (project.architect.hasOwnProperty('build-storybook')) {
    projects.push({ name, ...project });
  }

}

console.log(`Projects with 'build-storybook' target`);

projects.forEach(project => console.log(project.name));

const storybookCiTemplate = Handlebars.compile(storybook);

const storybookCi = storybookCiTemplate({ projects });

fs.writeFileSync('.storybook.gitlab-ci.yml', storybookCi);
