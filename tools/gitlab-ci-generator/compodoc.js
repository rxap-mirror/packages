const Handlebars = require('handlebars');
const fs = require('fs');

const compodoc = fs.readFileSync('.compodoc.gitlab-ci.yml.handlebars').toString('utf-8');

const angularJson = JSON.parse(fs.readFileSync('angular.json').toString('utf-8'));

// a list of projects that have the 'compodoc' target
const projects = [];

for (const [name, project] of Object.entries(angularJson.projects)) {

  if (project.architect.hasOwnProperty('compodoc')) {
    projects.push({ name, ...project });
  }

}


console.log(`Projects with 'compodoc' target`);

projects.forEach(project => console.log(project.name));

const compodocCiTemplate = Handlebars.compile(compodoc);

const compodocCi = compodocCiTemplate({ projects });

fs.writeFileSync('.compodoc.gitlab-ci.yml', compodocCi);
