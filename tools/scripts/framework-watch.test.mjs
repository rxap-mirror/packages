// Run with: pnpm test:scripts
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { branchName, decide, parseBranch } from './framework-watch.mjs';

const t = (group, leader, version) => ({ group, leader, version });

describe('framework-watch', () => {
  it('names migrate branches the way the nx-migrate job parses them', () => {
    assert.equal(branchName('@angular/core', '22.3.2'), 'migrate/@angular_core/22.3.2');
    assert.equal(branchName('nx', '24.1.0'), 'migrate/nx/24.1.0');
    assert.deepEqual(parseBranch('migrate/@nestjs_core/12.6.1'), { leader: '@nestjs/core', version: '12.6.1', group: 'nestjs' });
    assert.equal(parseBranch('renovate/zod'), null);
  });

  it('starts only the first migration by priority', () => {
    const actions = decide([ t('nx', 'nx', '24.1.0'), t('angular', '@angular/core', '22.3.2') ], []);
    assert.deepEqual(actions.map(a => `${ a.type } ${ a.branch }`), [ 'create migrate/nx/24.1.0', 'wait migrate/@angular_core/22.3.2' ]);
  });

  it('waits for an open migration and supersedes an older one of the same group', () => {
    const open = [ { branch: 'migrate/nx/24.0.7', mrIid: 12 } ];
    const actions = decide([ t('nx', 'nx', '24.1.0'), t('nestjs', '@nestjs/core', '12.6.1') ], open);
    assert.equal(actions[0].type, 'supersede');
    assert.equal(actions[0].old.mrIid, 12);
    assert.equal(actions[1].type, 'wait');
    assert.equal(decide([ t('nx', 'nx', '24.1.0') ], [ { branch: 'migrate/nx/24.1.0', mrIid: 13 } ])[0].type, 'wait');
    assert.equal(decide([ t('angular', '@angular/core', '22.3.2') ], [ { branch: 'migrate/nx/24.1.0' } ])[0].type, 'wait');
  });

  it('does not propose a version again whose merge request was closed', () => {
    const actions = decide([ t('nx', 'nx', '24.1.0'), t('nestjs', '@nestjs/core', '12.6.1') ], [], new Set([ 'migrate/nx/24.1.0' ]));
    assert.deepEqual(actions.map(a => a.type), [ 'skip', 'create' ]);
  });
});
