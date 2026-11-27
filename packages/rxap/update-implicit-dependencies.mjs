// Sets implicitDependencies of the rxap umbrella project to every workspace project (except the workspace itself and
// the umbrella). Node instead of jq: the release job's runner cannot install packages.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const EXCLUDED = new Set([ 'workspace', 'workspace-tools', 'angular', 'rxap' ]);
const projectJsonFile = 'packages/rxap/project.json';

const output = execFileSync('pnpm', [ 'nx', 'show', 'projects', '--json' ], { encoding: 'utf8' });
const projects = JSON.parse(output.trim().split('\n').at(-1)).filter(name => !EXCLUDED.has(name)).sort();

const projectJson = JSON.parse(readFileSync(projectJsonFile, 'utf8'));
projectJson.implicitDependencies = projects;
writeFileSync(projectJsonFile, JSON.stringify(projectJson, null, 2) + '\n');
console.log(`implicitDependencies: ${ projects.length } projects`);
