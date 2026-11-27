import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { readGroupProjects } from './lib/release-plan.mjs';
import { apply, buildProjectInputs, MAX_OPTIONS, renderHeader, renderProjectsVariable } from './release-inputs.mjs';

const project = (folder, name) => ({ name, root: `packages/${ folder }/${ name }` });

describe('release-inputs', () => {
  it('groups the packages into families and splits a family above the option limit', () => {
    const projects = [
      ...Array.from({ length: 52 }, (_, i) => project('angular', `angular-${ String(i).padStart(2, '0') }`)),
      project('nest', 'nest-valkey'),
      project('plugin', 'plugin-library'),
      project('schematic', 'schematic-angular'),
      project('utilities', 'utilities'),
      project('n8n', 'n8n-nodes'),
    ];
    const inputs = buildProjectInputs(projects);
    assert.deepEqual(inputs.map(i => i.key),
      [ 'release_projects_angular_1', 'release_projects_angular_2', 'release_projects_nest', 'release_projects_tooling', 'release_projects_other' ]);
    assert.deepEqual(inputs.map(i => i.options.length), [ 26, 26, 1, 2, 2 ]);
    assert.ok(inputs.every(i => i.options.length <= MAX_OPTIONS));
    assert.deepEqual(inputs[4].options, [ 'n8n-nodes', 'utilities' ]);
  });

  it('omits empty families', () => {
    assert.deepEqual(buildProjectInputs([ project('nest', 'nest-a') ]).map(i => i.key), [ 'release_projects_nest' ]);
  });

  it('replaces the header and the RELEASE_PROJECTS line, keeps the rest', () => {
    const inputs = buildProjectInputs([ project('nest', 'nest-a') ]);
    const body = 'variables:\n  A: b\n  RELEASE_PROJECTS: ""\ninclude: []\n';
    const once = apply(`spec:\n  inputs: {}\n---\n${ body }`, inputs);
    assert.equal(once, renderHeader(inputs) + body.replace('  RELEASE_PROJECTS: ""', renderProjectsVariable(inputs)));
    assert.equal(apply(once, inputs), once);
    assert.equal(apply(body, inputs), once, 'a file without a header gets one');
    assert.throws(() => apply('variables: {}\n', inputs), /RELEASE_PROJECTS/);
  });

  it('.gitlab-ci.yml is up to date with the packages release group', () => {
    const content = readFileSync('.gitlab-ci.yml', 'utf-8');
    assert.equal(apply(content, buildProjectInputs(readGroupProjects('packages'))), content,
      'run node tools/scripts/release-inputs.mjs');
  });
});
