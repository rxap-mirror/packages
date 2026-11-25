// Run with: pnpm test:scripts
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  branchKind,
  cleanTrace,
  collectFailedJobs,
  LABEL_BLOCKED,
  LABEL_GAVE_UP,
  migrationSummary,
  nextAttempt,
  onlySupplyChainFailed,
  parseAttempts,
  prepare,
  relevantFailedJobs,
  tail,
} from './agent-fix-context.mjs';

const job = (id, name, extra = {}) => ({ id, name, stage: 'test', status: 'failed', allow_failure: false, web_url: `https://gl/j/${ id }`, ...extra });

/** in-memory GitLab API: GET answers from `routes` (path without query), writes are recorded */
function fakeApi(routes) {
  const writes = [];
  const api = async (method, path, { body } = {}) => {
    if (method !== 'GET') {
      writes.push([ method, path, body ]);
      return {};
    }
    const key = path.replace(/\?.*/, '');
    if (!(key in routes)) {
      throw new Error(`GET ${ key } failed with 404`);
    }
    return typeof routes[key] === 'function' ? routes[key]() : structuredClone(routes[key]);
  };
  return { api, writes };
}

function fakeGit(trailers, diffStat = ' a.ts | 2 +-') {
  return (...args) => {
    if (args[0] === 'merge-base') {
      if (args[2] !== 'origin/development') {
        throw new Error('no ref');
      }
      return 'base123';
    }
    if (args[0] === 'log') {
      return trailers;
    }
    if (args[0] === 'ls-remote') {
      return 'sha-head\trefs/heads/x';
    }
    if (args[0] === 'diff') {
      return diffStat;
    }
    throw new Error(`unexpected git ${ args.join(' ') }`);
  };
}

function run(opts) {
  const files = {};
  const result = prepare({
    env: { CI_COMMIT_BRANCH: 'renovate/zod', CI_COMMIT_SHA: 'sha-head', CI_PROJECT_ID: '7', CI_PIPELINE_ID: '100', CI_JOB_ID: '999', ...opts.env },
    git: opts.git ?? fakeGit(''),
    api: opts.api,
    readFile: path => opts.files?.[path] ?? null,
    writeFile: (path, content) => (files[path] = content),
    log: () => undefined,
  });
  return result.then(r => ({ ...r, files }));
}

const MR = { iid: 5, title: 'chore(deps): update zod', web_url: 'https://gl/mr/5', labels: [ 'dependencies' ], description: '' };

describe('agent-fix-context helpers', () => {
  it('counts distinct attempt numbers from the trailer log', () => {
    assert.deepEqual(parseAttempts(''), []);
    assert.deepEqual(parseAttempts('\n1\n\n1\n2\n'), [ 1, 2 ]);
    assert.deepEqual(parseAttempts('3,3\nfoo\n0\n'), [ 3 ]);
    assert.equal(nextAttempt([]), 1);
    assert.equal(nextAttempt([ 1 ]), 2);
  });

  it('only handles renovate/* and migrate/* branches', () => {
    assert.equal(branchKind('renovate/zod-4.x'), 'renovate');
    assert.equal(branchKind('migrate/@nx_workspace/24.1.0'), 'migrate');
    assert.equal(branchKind('development'), null);
    assert.equal(branchKind(undefined), null);
  });

  it('cleans ANSI codes, section markers and progress lines from traces', () => {
    const raw = '\x1b[0Ksection_start:1700000000:step_script\r\x1b[0K\x1b[32;1m$ pnpm nx run a:test\x1b[0;m\n10%\r50%\r100%\n\x1b[0Ksection_end:1700000001:step_script\r\x1b[0K\nFAIL';
    assert.equal(cleanTrace(raw), '$ pnpm nx run a:test\n100%\n\nFAIL');
    assert.equal(tail('1\n2\n3\n\n', 2), '2\n3');
  });

  it('ignores allowed failures and the agent job itself', () => {
    const jobs = [ job(1, 'a'), job(2, 'b', { allow_failure: true }), job(3, 'agent:fix'), job(4, 'c', { status: 'success' }) ];
    assert.deepEqual(relevantFailedJobs(jobs, 3).map(j => j.id), [ 1 ]);
  });

  it('detects a pipeline that is only red because of the supply-chain check', () => {
    assert.equal(onlySupplyChainFailed([ job(1, 'supply-chain:check') ]), true);
    assert.equal(onlySupplyChainFailed([ job(1, 'supply-chain:check'), job(2, 'run-many') ]), false);
    assert.equal(onlySupplyChainFailed([]), false);
  });

  it('summarises migrations.json and tolerates garbage', () => {
    const json = JSON.stringify({ migrations: [ { package: '@nx/js', version: '24.1.0', name: 'update-x', description: 'Does x' } ] });
    assert.deepEqual(migrationSummary(json), [ '- `@nx/js` 24.1.0 `update-x`: Does x' ]);
    assert.deepEqual(migrationSummary('{'), []);
    assert.deepEqual(migrationSummary(null), []);
  });

  it('follows failed child pipelines once', async () => {
    const { api } = fakeApi({
      'projects/7/pipelines/100/jobs': [ job(1, 'setup') ],
      'projects/7/pipelines/100/bridges': [ { downstream_pipeline: { id: 200, project_id: 7 } }, { downstream_pipeline: { id: 200, project_id: 7 } } ],
      'projects/7/pipelines/200/jobs': [ job(2, 'run-many: [lint]') ],
      'projects/7/pipelines/200/bridges': [],
    });
    assert.deepEqual((await collectFailedJobs(api, '7', '100')).map(j => j.id), [ 1, 2 ]);
  });
});

describe('agent-fix-context prepare', () => {
  it('writes the context for the next attempt', async () => {
    const { api, writes } = fakeApi({
      'projects/7/pipelines/100/jobs': [ job(1, 'run-many'), job(999, 'agent:fix') ],
      'projects/7/pipelines/100/bridges': [],
      'projects/7/merge_requests': [ MR ],
      'projects/7/jobs/1/trace': () => Array.from({ length: 300 }, (_, i) => `line ${ i }`).join('\n'),
    });
    const r = await run({ api, git: fakeGit('\n1\n') });
    assert.equal(r.run, true);
    assert.equal(r.attempt, 2);
    assert.equal(writes.length, 0);
    assert.equal(r.files['.claude-ci/skip'], undefined);
    const ctx = r.files['.claude-ci/context.md'];
    assert.match(ctx, /Attempt: 2 of 2 — use the commit trailer `Agent-Fix: 2`/);
    assert.match(ctx, /Merge request: !5/);
    assert.match(ctx, /### `run-many` \(stage test, job 1\)/);
    assert.match(ctx, /line 299/);
    assert.doesNotMatch(ctx, /line 99\n/);
    assert.doesNotMatch(ctx, /agent:fix/);
    assert.match(ctx, /a\.ts \| 2 \+-/);
    assert.doesNotMatch(ctx, /## Migration/);
  });

  it('adds the migration labels, migrations.json and MR description on migrate/* branches', async () => {
    const { api } = fakeApi({
      'projects/7/pipelines/100/jobs': [ job(1, 'run-many') ],
      'projects/7/pipelines/100/bridges': [],
      'projects/7/merge_requests': [ { ...MR, labels: [ 'migration::failed', 'post-migration::successful', 'migrate::nx', 'nx::24.1.0', 'other' ], description: '**Output**\n[migrate.log](/uploads/x)' } ],
      'projects/7/jobs/1/trace': 'boom',
    });
    const r = await run({
      api,
      env: { CI_COMMIT_BRANCH: 'migrate/nx/24.1.0' },
      files: { 'migrations.json': JSON.stringify({ migrations: [ { package: 'nx', version: '24.1.0', name: 'm1' } ] }) },
    });
    const ctx = r.files['.claude-ci/context.md'];
    assert.equal(r.attempt, 1);
    assert.match(ctx, /`migration::failed`, `post-migration::successful`, `migrate::nx`, `nx::24\.1\.0`/);
    assert.doesNotMatch(ctx, /`other`/);
    assert.match(ctx, /- `nx` 24\.1\.0 `m1`/);
    assert.match(ctx, /> \[migrate\.log\]\(\/uploads\/x\)/);
  });

  it('gives up after two attempts: label, note with the failed jobs, skip marker', async () => {
    const { api, writes } = fakeApi({
      'projects/7/pipelines/100/jobs': [ job(1, 'run-many') ],
      'projects/7/pipelines/100/bridges': [],
      'projects/7/merge_requests': [ MR ],
    });
    const r = await run({ api, git: fakeGit('1\n\n2\n2\n') });
    assert.equal(r.run, false);
    assert.match(r.files['.claude-ci/skip'], /2 agent attempt/);
    assert.equal(r.files['.claude-ci/context.md'], undefined);
    assert.deepEqual(writes[0], [ 'PUT', 'projects/7/merge_requests/5', { add_labels: LABEL_GAVE_UP } ]);
    assert.equal(writes[1][1], 'projects/7/merge_requests/5/notes');
    assert.match(writes[1][2].body, /`run-many` \(stage test\) https:\/\/gl\/j\/1/);
  });

  it('does not note twice when the MR already gave up', async () => {
    const { api, writes } = fakeApi({
      'projects/7/pipelines/100/jobs': [ job(1, 'run-many') ],
      'projects/7/pipelines/100/bridges': [],
      'projects/7/merge_requests': [ { ...MR, labels: [ LABEL_GAVE_UP ] } ],
    });
    const r = await run({ api, git: fakeGit('1\n2\n') });
    assert.equal(r.run, false);
    assert.equal(writes.length, 0);
  });

  it('respects AGENT_FIX_MAX_ATTEMPTS', async () => {
    const { api } = fakeApi({
      'projects/7/pipelines/100/jobs': [ job(1, 'run-many') ],
      'projects/7/pipelines/100/bridges': [],
      'projects/7/merge_requests': [],
    });
    const r = await run({ api, git: fakeGit('1\n'), env: { AGENT_FIX_MAX_ATTEMPTS: '1' } });
    assert.equal(r.run, false);
  });

  it('does not run the agent for a red supply-chain check', async () => {
    const { api, writes } = fakeApi({
      'projects/7/pipelines/100/jobs': [ job(1, 'supply-chain:check') ],
      'projects/7/pipelines/100/bridges': [],
      'projects/7/merge_requests': [ MR ],
    });
    const r = await run({ api });
    assert.equal(r.run, false);
    assert.deepEqual(writes[0][2], { add_labels: LABEL_BLOCKED });
    assert.match(writes[1][2].body, /supply-chain:check/);
  });

  it('skips other branches without calling the API', async () => {
    const r = await run({ api: () => assert.fail('no API call expected'), env: { CI_COMMIT_BRANCH: 'development' } });
    assert.equal(r.run, false);
    assert.match(r.files['.claude-ci/skip'], /not a renovate/);
  });

  it('reads branch, MR and head from the merge request pipeline variables', async () => {
    const { api } = fakeApi({
      'projects/7/pipelines/100/jobs': [ job(1, 'run-many') ],
      'projects/7/pipelines/100/bridges': [],
      'projects/7/merge_requests/9': { ...MR, iid: 9 },
      'projects/7/jobs/1/trace': 'boom',
    });
    const r = await run({
      api,
      env: { CI_COMMIT_BRANCH: '', CI_MERGE_REQUEST_SOURCE_BRANCH_NAME: 'renovate/zod', CI_MERGE_REQUEST_IID: '9', CI_COMMIT_SHA: 'merge-commit', CI_MERGE_REQUEST_SOURCE_BRANCH_SHA: 'sha-head' },
    });
    assert.equal(r.run, true);
    assert.match(r.files['.claude-ci/context.md'], /Branch: `renovate\/zod`/);
    assert.match(r.files['.claude-ci/context.md'], /Merge request: !9/);
  });

  it('skips an outdated pipeline when the branch moved on', async () => {
    const r = await run({ api: () => assert.fail('no API call expected'), env: { CI_COMMIT_SHA: 'older' } });
    assert.equal(r.run, false);
    assert.match(r.files['.claude-ci/skip'], /outdated: renovate\/zod moved to sha-head/);
  });

  it('waits for nx-migrate to open the MR on migrate/* branches', async () => {
    const { api, writes } = fakeApi({
      'projects/7/pipelines/100/jobs': [ job(1, 'run-many') ],
      'projects/7/pipelines/100/bridges': [],
      'projects/7/merge_requests': [],
    });
    const r = await run({ api, env: { CI_COMMIT_BRANCH: 'migrate/nx/24.1.0' } });
    assert.equal(r.run, false);
    assert.match(r.files['.claude-ci/skip'], /nx-migrate not finished/);
    assert.equal(writes.length, 0);
  });

  it('works without a merge base (shallow clone) and without an MR', async () => {
    const { api } = fakeApi({
      'projects/7/pipelines/100/jobs': [ job(1, 'run-many') ],
      'projects/7/pipelines/100/bridges': [],
      'projects/7/merge_requests': [],
    });
    const git = (...args) => {
      throw new Error(`no ${ args[0] }`);
    };
    const r = await run({ api, git });
    assert.equal(r.attempt, 1);
    assert.match(r.files['.claude-ci/context.md'], /merge base with development not found/);
    assert.match(r.files['.claude-ci/context.md'], /trace not available/);
    assert.match(r.files['.claude-ci/context.md'], /none found/);
  });
});
