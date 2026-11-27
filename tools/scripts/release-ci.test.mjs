// Run with: pnpm test:scripts
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { baseCommit, decide, parseProjects, PARTIAL, releaseExit } from './release-ci.mjs';

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

  it('restricts the release to RELEASE_PROJECTS (--projects) and keeps the other flags', () => {
    const d = decide({ kind: 'nightly', commits, pipeline: 'success', specifier: 'prerelease', projects: [ 'nest-valkey', 'nest-foo' ] });
    assert.deepEqual(d.args, [ '--skip-validate', '--specifier=prerelease', '--projects=nest-valkey,nest-foo' ]);
    assert.ok(!decide({ kind: 'nightly', commits, pipeline: 'success', projects: [] }).args.some(a => a.startsWith('--projects')));
  });

  it('parses RELEASE_PROJECTS: comma or space separated, trimmed, empty means all', () => {
    assert.deepEqual(parseProjects('nest-valkey, nest-foo  nest-bar'), [ 'nest-valkey', 'nest-foo', 'nest-bar' ]);
    assert.deepEqual(parseProjects(''), []);
    assert.deepEqual(parseProjects(undefined), []);
    assert.deepEqual(parseProjects(' , '), []);
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

  it('packs instead of publishing when a pack folder is given (CI)', () => {
    const d = decide({ kind: 'nightly', commits, pipeline: 'success', pack: 'dist/release' });
    assert.deepEqual(d.args, [ '--skip-validate', '--pack=dist/release' ]);
  });

  it('reports an unchecked pipeline in a dry run without a token', () => {
    const d = decide({ kind: 'nightly', commits, pipeline: 'unknown' });
    assert.equal(d.action, 'run');
    assert.match(d.reasons[0], /not checked/);
  });

  it('lets the publish job run after a partial failure that packed something', () => {
    assert.equal(releaseExit(0, true), 0);
    assert.equal(releaseExit(1, true), PARTIAL);
    assert.equal(releaseExit(1, false), 1);
  });
});
