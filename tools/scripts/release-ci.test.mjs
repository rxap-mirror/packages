// Run with: pnpm test:scripts
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { baseCommit, decide } from './release-ci.mjs';

const c = (sha, subject) => ({ sha: sha.padEnd(40, '0'), subject });
const commits = [
  c('a1', 'chore(release): version rxap'),
  c('a2', 'fix(rxap): update package group'),
  c('a3', 'chore(release): version'),
  c('b1', 'feat(forms): add a control'),
  c('b2', 'fix(table): sort'),
];

describe('release-ci gate', () => {
  it('looks at the newest commit that release.mjs did not write', () => {
    assert.equal(baseCommit(commits).subject, 'feat(forms): add a control');
    assert.equal(baseCommit(commits.slice(0, 3)), null);
  });

  it('runs the nightly with --skip-validate when the pipeline is green', () => {
    const d = decide({ kind: 'nightly', commits, pipeline: 'success' });
    assert.equal(d.action, 'run');
    assert.deepEqual(d.args, [ '--skip-validate' ]);
  });

  it('waits for the next night when the pipeline is running, red or missing', () => {
    for (const pipeline of [ 'running', 'pending', 'failed', 'canceled', null ]) {
      const d = decide({ kind: 'nightly', commits, pipeline });
      assert.equal(d.action, 'skip', String(pipeline));
      assert.deepEqual(d.args, []);
    }
    assert.match(decide({ kind: 'nightly', commits, pipeline: 'running' }).reasons[0], /still running/);
  });

  it('adds --stamped for a pending framework stamp and passes a specifier', () => {
    const d = decide({ kind: 'nightly', commits, pipeline: 'success', stamped: [ 'forms' ], specifier: 'prerelease' });
    assert.deepEqual(d.args, [ '--skip-validate', '--stamped', '--specifier=prerelease' ]);
  });

  it('fails when a package does not exist on npm (no first publish through OIDC)', () => {
    const d = decide({ kind: 'nightly', commits, pipeline: 'success', missing: [ '@rxap/new' ] });
    assert.equal(d.action, 'fail');
    assert.match(d.reasons[0], /@rxap\/new/);
  });

  it('runs the stable graduation only on a green pipeline and without a pending stamp', () => {
    assert.deepEqual(decide({ kind: 'stable', commits, pipeline: 'success', specifier: 'minor' }).args,
      [ '--skip-validate', '--graduate', '--gitlab-release', '--specifier=minor' ]);
    assert.equal(decide({ kind: 'stable', commits, pipeline: 'failed' }).action, 'fail');
    assert.equal(decide({ kind: 'stable', commits, pipeline: 'success', stamped: [ 'forms' ] }).action, 'fail');
  });

  it('reports an unchecked pipeline in a dry run without a token', () => {
    const d = decide({ kind: 'nightly', commits, pipeline: 'unknown' });
    assert.equal(d.action, 'run');
    assert.match(d.reasons[0], /not checked/);
  });
});
