const angularJson = require('../../angular.json');
const { compile } = require('handlebars');
const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');
const https = require('https');

const libraries = Object
  .entries(angularJson.projects)
  .filter(([name, project]) => project.projectType === 'library')
  .filter(([name, project]) => !name.match(/^plugin-/) && !name.match(/^devkit-/) && !name.match(/^schematics-/) && !name.match(/^material-/))
  .map(([name, project]) => project)
  .map(project => readFileSync(join(project.root, 'package.json')).toString('utf-8'))
  .map(packageJson => JSON.parse(packageJson))
  .sort((a, b) => a.name.localeCompare(b.name));

const plugins = Object
  .entries(angularJson.projects)
  .filter(([name, project]) => project.projectType === 'library')
  .filter(([name, project]) => name.match(/^plugin-/))
  .map(([name, project]) => project)
  .map(project => readFileSync(join(project.root, 'package.json')).toString('utf-8'))
  .map(packageJson => JSON.parse(packageJson))
  .sort((a, b) => a.name.localeCompare(b.name));

const devkits = Object
  .entries(angularJson.projects)
  .filter(([name, project]) => project.projectType === 'library')
  .filter(([name, project]) => name.match(/^devkit-/))
  .map(([name, project]) => project)
  .map(project => readFileSync(join(project.root, 'package.json')).toString('utf-8'))
  .map(packageJson => JSON.parse(packageJson))
  .sort((a, b) => a.name.localeCompare(b.name));

const schematics = Object
  .entries(angularJson.projects)
  .filter(([name, project]) => project.projectType === 'library')
  .filter(([name, project]) => name.match(/^schematics-/))
  .map(([name, project]) => project)
  .map(project => readFileSync(join(project.root, 'package.json')).toString('utf-8'))
  .map(packageJson => JSON.parse(packageJson))
  .sort((a, b) => a.name.localeCompare(b.name));

const materials = Object
  .entries(angularJson.projects)
  .filter(([name, project]) => project.projectType === 'library')
  .filter(([name, project]) => name.match(/^material-/))
  .map(([name, project]) => project)
  .map(project => readFileSync(join(project.root, 'package.json')).toString('utf-8'))
  .map(packageJson => JSON.parse(packageJson))
  .sort((a, b) => a.name.localeCompare(b.name));

const packageJson = JSON.stringify(readFileSync('package.json').toString('utf-8'));

async function tagUnpublished(projects) {

  for await (const project of projects) {

    await new Promise(resolve => {

      https.get(`https://api.npms.io/v2/package/${project.name.replace('@', '%40').replace('/', '%2F')}`, function(response) {
        var str = '';

        //another chunk of data has been received, so append it to `str`
        response.on('data', function(chunk) {
          str += chunk;
        });

        //the whole response has been received, so we just print it out here
        response.on('end', function() {
          const result = JSON.parse(str);

          if (result.code) {
            project.private = true;
          }

          resolve();
        });
      }).end();

    });

  }

}

const readmeTemplateFile = readFileSync('README.md.handlebars').toString('utf-8');
const readmeTemplate = compile(readmeTemplateFile);

tagUnpublished([...libraries, ...plugins, ...devkits, ...materials, ...schematics]).then(() => {

  const readmeFile = readmeTemplate({ libraries, plugins, devkits, package: packageJson, materials, schematics });

  writeFileSync('README.md', readmeFile);

});
