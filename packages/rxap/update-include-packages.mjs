// Sets the include list of rxap:update-package-group to the @angular/*, @nestjs/* and @nx/* packages of the root
// package.json, plus nx. Node instead of jq: the release job's runner cannot install packages.
import { readFileSync, writeFileSync } from 'node:fs';

const projectJsonFile = 'packages/rxap/project.json';
const rootPackageJson = JSON.parse(readFileSync('package.json', 'utf8'));
const packages = [ rootPackageJson.dependencies, rootPackageJson.devDependencies ]
  .flatMap(deps => Object.keys(deps ?? {}))
  .filter(name => /^@(angular|nestjs|nx)\//.test(name));
packages.push('nx');

const projectJson = JSON.parse(readFileSync(projectJsonFile, 'utf8'));
projectJson.targets['update-package-group'].options.include = packages;
writeFileSync(projectJsonFile, JSON.stringify(projectJson, null, 2) + '\n');
console.log(`update-package-group include: ${ packages.length } packages`);
