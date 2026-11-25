#!/usr/bin/env node
/**
 * Prepares the agent:fix job (.gitlab/ci/agent-fix.yml, docs/agent-fix.md).
 *
 * Runs on a red renovate/* or migrate/* branch pipeline before the agent starts and either
 *   - writes `.claude-ci/context.md` (failed jobs + trace tails, migration info, diff stat, next attempt number)
 *     for the fix-dependency-branch skill, or
 *   - writes `.claude-ci/skip` (the job then exits 0 without starting the agent) when
 *       * the branch moved on since this pipeline (a newer pipeline decides), or a migrate/* branch has no MR yet,
 *       * the branch already carries MAX_ATTEMPTS agent attempts (commit trailer `Agent-Fix: <n>`):
 *         the MR gets the label agent-fix::gave-up and a note listing the failed jobs, or
 *       * only supply-chain jobs failed: a cooldown/advisory violation is never fixed by the agent,
 *         the MR gets the label agent-fix::blocked and a note.
 *
 * Runs in merge request pipelines (nx-workspace skips the branch pipelines of branches with an open MR and of migrate/*).
 * Environment: CI_API_V4_URL, CI_PROJECT_ID, CI_PIPELINE_ID, GITLAB_TOKEN, CI_MERGE_REQUEST_SOURCE_BRANCH_NAME and
 * CI_MERGE_REQUEST_IID (CI_COMMIT_BRANCH as fallback for branch pipelines),
 * optional AGENT_FIX_BASE_BRANCH (default development), AGENT_FIX_MAX_ATTEMPTS (default 2).
 * Never prints the token.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const TRAILER = 'Agent-Fix';
export const LABEL_GAVE_UP = 'agent-fix::gave-up';
export const LABEL_BLOCKED = 'agent-fix::blocked';
export const TRACE_LINES = 200;
const SUPPLY_CHAIN_JOB = /^supply-chain(:|$)/;

// region pure helpers

/**
 * Attempt numbers already used on the branch.
 * Input: `git log --format=%(trailers:key=Agent-Fix,valueonly,separator=%x2C)` (one line per commit, empty when the
 * commit has no trailer). An attempt may consist of several commits with the same number, so distinct values count.
 */
export function parseAttempts(trailerLog) {
  const attempts = new Set();
  for (const line of trailerLog.split('\n')) {
    for (const value of line.split(',')) {
      const n = Number.parseInt(value.trim(), 10);
      if (Number.isInteger(n) && n > 0) {
        attempts.add(n);
      }
    }
  }
  return [ ...attempts ].sort((a, b) => a - b);
}

export function nextAttempt(attempts) {
  return attempts.length ? Math.max(...attempts) + 1 : 1;
}

export function branchKind(branch = '') {
  if (branch.startsWith('migrate/')) {
    return 'migrate';
  }
  if (branch.startsWith('renovate/')) {
    return 'renovate';
  }
  return null;
}

/** strips ANSI colors, GitLab collapsible section markers and carriage-return progress output */
export function cleanTrace(trace = '') {
  return trace
    .replace(/\x1b\[[0-9;]*[A-Za-z]/g, '')
    .replace(/section_(start|end):\d+:[^\r\n]*\r?/g, '')
    .split('\n')
    .map(line => line.split('\r').filter(Boolean).pop() ?? '')
    .join('\n');
}

export function tail(text, lines = TRACE_LINES) {
  const all = text.replace(/\n+$/, '').split('\n');
  return all.slice(-lines).join('\n');
}

/** failed jobs that broke the pipeline (allowed failures and this job itself are ignored) */
export function relevantFailedJobs(jobs, ownJobId) {
  return jobs.filter(job => job.status === 'failed' && !job.allow_failure && String(job.id) !== String(ownJobId));
}

export function onlySupplyChainFailed(jobs) {
  return jobs.length > 0 && jobs.every(job => SUPPLY_CHAIN_JOB.test(job.name));
}

export function jobList(jobs) {
  return jobs.map(job => `- \`${ job.name }\` (stage ${ job.stage }) ${ job.web_url ?? '' }`.trimEnd()).join('\n');
}

export function gaveUpNote({ attempts, jobs, max }) {
  return [
    `Agent fix gave up: this branch already has ${ attempts.length } agent attempt(s) (max ${ max }), the pipeline is still red.`,
    '',
    'Failed jobs:',
    jobList(jobs) || '- (none reported)',
    '',
    'A human has to take over. Remove the label `' + LABEL_GAVE_UP + '` and drop the `Agent-Fix` commits to allow new attempts.',
  ].join('\n');
}

export function blockedNote({ jobs }) {
  return [
    'Agent fix skipped: only supply-chain jobs failed. A cooldown or advisory violation is not fixed by changing code;',
    'wait until the version is old enough or handle the advisory by hand (UPGRADE-NOTES.md section 4).',
    '',
    jobList(jobs),
  ].join('\n');
}

/** extracts the migration names from an nx migrations.json */
export function migrationSummary(migrationsJson) {
  if (!migrationsJson) {
    return [];
  }
  let parsed;
  try {
    parsed = JSON.parse(migrationsJson);
  } catch {
    return [];
  }
  return (parsed.migrations ?? []).map(m => `- \`${ m.package }\` ${ m.version ?? '' } \`${ m.name }\`${ m.description ? `: ${ m.description }` : '' }`);
}

export function renderContext({ branch, pipelineId, attempt, max, jobs, traces, mr, migrations, diffStat }) {
  const out = [];
  out.push(`# Agent fix context`);
  out.push('');
  out.push(`- Branch: \`${ branch }\` (${ branchKind(branch) ?? 'unknown kind' })`);
  out.push(`- Pipeline: ${ pipelineId }`);
  out.push(`- Attempt: ${ attempt } of ${ max } — use the commit trailer \`${ TRAILER }: ${ attempt }\``);
  if (mr) {
    out.push(`- Merge request: !${ mr.iid } ${ mr.web_url ?? '' }`.trimEnd());
    out.push(`- MR title: ${ mr.title }`);
  } else {
    out.push('- Merge request: none found (skip the MR note)');
  }
  out.push('');

  if (branchKind(branch) === 'migrate') {
    out.push('## Migration');
    out.push('');
    const labels = (mr?.labels ?? []).filter(l => l.includes('::'));
    out.push(`- Labels: ${ labels.length ? labels.map(l => `\`${ l }\``).join(', ') : '(none)' }`);
    if (migrations.length) {
      out.push('- Migrations (migrations.json):');
      out.push(...migrations.map(m => `  ${ m }`));
    } else {
      out.push('- migrations.json: not present in the branch');
    }
    if (mr?.description) {
      out.push('');
      out.push('MR description (links to the uploaded migrate / post-migrate logs):');
      out.push('');
      out.push(mr.description.split('\n').map(l => `> ${ l }`).join('\n'));
    }
    out.push('');
  }

  out.push('## Failed jobs');
  out.push('');
  if (!jobs.length) {
    out.push('No failed job found in the pipeline (the trigger may have been a cancelled or child pipeline).');
  }
  for (const job of jobs) {
    out.push(`### \`${ job.name }\` (stage ${ job.stage }, job ${ job.id })`);
    out.push('');
    if (job.web_url) {
      out.push(job.web_url);
      out.push('');
    }
    out.push(`Last ${ TRACE_LINES } lines of the trace:`);
    out.push('');
    out.push('```text');
    out.push(traces[job.id] ?? '(trace not available)');
    out.push('```');
    out.push('');
  }

  out.push('## Diff against the merge base');
  out.push('');
  out.push('```text');
  out.push(diffStat || '(no diff)');
  out.push('```');
  out.push('');
  return out.join('\n');
}

// endregion

// region runners

const defaultGit = (...args) => execFileSync('git', args, { encoding: 'utf8', stdio: [ 'ignore', 'pipe', 'pipe' ] }).trim();

export function createApi({ baseUrl = process.env.CI_API_V4_URL, token = process.env.GITLAB_TOKEN, fetchFn = globalThis.fetch } = {}) {
  return async (method, path, { body, text = false } = {}) => {
    const res = await fetchFn(`${ baseUrl }/${ path }`, {
      method,
      headers: { 'PRIVATE-TOKEN': token, ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      throw new Error(`${ method } ${ path.replace(/\?.*/, '') } failed with ${ res.status }`);
    }
    return text ? res.text() : res.json();
  };
}

export function resolveBase(git, branch) {
  for (const ref of [ `origin/${ branch }`, branch ]) {
    try {
      return git('merge-base', 'HEAD', ref);
    } catch {
      // ref not in this clone
    }
  }
  return null;
}

/** the current commit of the branch on origin, null when it cannot be read */
export function remoteBranchHead(git, branch) {
  try {
    return git('ls-remote', 'origin', `refs/heads/${ branch }`).split(/\s/)[0] || null;
  } catch {
    return null;
  }
}

/** failed jobs of the pipeline and of its downstream (child) pipelines */
export async function collectFailedJobs(api, projectId, pipelineId, seen = new Set()) {
  if (seen.has(String(pipelineId))) {
    return [];
  }
  seen.add(String(pipelineId));
  const jobs = await api('GET', `projects/${ projectId }/pipelines/${ pipelineId }/jobs?scope[]=failed&per_page=100`);
  let bridges = [];
  try {
    bridges = await api('GET', `projects/${ projectId }/pipelines/${ pipelineId }/bridges?scope[]=failed&per_page=100`);
  } catch {
    // older GitLab or no permission: only the parent pipeline
  }
  for (const bridge of bridges) {
    const child = bridge.downstream_pipeline;
    if (child?.id) {
      jobs.push(...await collectFailedJobs(api, child.project_id ?? projectId, child.id, seen));
    }
  }
  return jobs;
}

async function findMergeRequest(api, projectId, branch, iid) {
  if (iid) {
    return api('GET', `projects/${ projectId }/merge_requests/${ iid }`);
  }
  const mrs = await api('GET', `projects/${ projectId }/merge_requests?state=opened&source_branch=${ encodeURIComponent(branch) }`);
  return mrs[0] ?? null;
}

async function markMergeRequest(api, projectId, mr, label, note, log) {
  if (!mr) {
    log('no open merge request for the branch: label and note skipped');
    return;
  }
  if ((mr.labels ?? []).includes(label)) {
    log(`merge request !${ mr.iid } already has ${ label }: note skipped`);
    return;
  }
  await api('PUT', `projects/${ projectId }/merge_requests/${ mr.iid }`, { body: { add_labels: label } });
  await api('POST', `projects/${ projectId }/merge_requests/${ mr.iid }/notes`, { body: { body: note } });
}

// endregion

/**
 * @returns {Promise<{ run: boolean, reason?: string, attempt?: number }>}
 */
export async function prepare({
  env = process.env,
  git = defaultGit,
  api = createApi(),
  readFile = path => (existsSync(path) ? readFileSync(path, 'utf8') : null),
  writeFile = (path, content) => writeFileSync(path, content),
  outDir = '.claude-ci',
  log = console.log,
} = {}) {
  const branch = env.CI_MERGE_REQUEST_SOURCE_BRANCH_NAME || env.CI_COMMIT_BRANCH || '';
  // merged-results pipelines run on a merge commit; the source branch head is in CI_MERGE_REQUEST_SOURCE_BRANCH_SHA
  const pipelineSha = env.CI_MERGE_REQUEST_SOURCE_BRANCH_SHA || env.CI_COMMIT_SHA;
  const projectId = env.CI_PROJECT_ID;
  const pipelineId = env.CI_PIPELINE_ID;
  const max = Number.parseInt(env.AGENT_FIX_MAX_ATTEMPTS ?? '2', 10);
  const baseBranch = env.AGENT_FIX_BASE_BRANCH || 'development';
  const skipFile = join(outDir, 'skip');
  const skip = reason => {
    writeFile(skipFile, `${ reason }\n`);
    log(`agent fix skipped: ${ reason }`);
    return { run: false, reason };
  };

  if (!branchKind(branch)) {
    return skip(`branch ${ branch || '(none)' } is not a renovate/* or migrate/* branch`);
  }

  // a newer push (Renovate rebase, nx-migrate commits, an earlier agent attempt) has its own pipeline that decides
  const remoteHead = remoteBranchHead(git, branch);
  if (remoteHead && pipelineSha && remoteHead !== pipelineSha) {
    return skip(`pipeline is outdated: ${ branch } moved to ${ remoteHead.slice(0, 8) }`);
  }

  const base = resolveBase(git, baseBranch);
  const attempts = base
    ? parseAttempts(git('log', '--format=%(trailers:key=' + TRAILER + ',valueonly,separator=%x2C)', `${ base }..HEAD`))
    : [];
  const jobs = relevantFailedJobs(await collectFailedJobs(api, projectId, pipelineId), env.CI_JOB_ID);
  const mr = await findMergeRequest(api, projectId, branch, env.CI_MERGE_REQUEST_IID);

  if (branchKind(branch) === 'migrate' && !mr) {
    // nx-migrate opens the MR as its last step: without it the migration has not finished (or failed itself)
    return skip('no open merge request for the migrate branch yet (nx-migrate not finished)');
  }
  if (attempts.length >= max) {
    await markMergeRequest(api, projectId, mr, LABEL_GAVE_UP, gaveUpNote({ attempts, jobs, max }), log);
    return skip(`${ attempts.length } agent attempt(s) already on the branch (max ${ max })`);
  }
  if (onlySupplyChainFailed(jobs)) {
    await markMergeRequest(api, projectId, mr, LABEL_BLOCKED, blockedNote({ jobs }), log);
    return skip('only supply-chain jobs failed');
  }

  const traces = {};
  for (const job of jobs) {
    try {
      traces[job.id] = tail(cleanTrace(await api('GET', `projects/${ job.pipeline?.project_id ?? projectId }/jobs/${ job.id }/trace`, { text: true })));
    } catch (e) {
      traces[job.id] = `(trace not available: ${ e.message })`;
    }
  }

  const attempt = nextAttempt(attempts);
  const content = renderContext({
    branch,
    pipelineId,
    attempt,
    max,
    jobs,
    traces,
    mr,
    migrations: migrationSummary(readFile('migrations.json')),
    diffStat: base ? git('diff', '--stat', base, 'HEAD') : '(merge base with ' + baseBranch + ' not found)',
  });
  writeFile(join(outDir, 'context.md'), content);
  log(`wrote ${ join(outDir, 'context.md') } for attempt ${ attempt } (${ jobs.length } failed job(s))`);
  return { run: true, attempt };
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  for (const name of [ 'CI_API_V4_URL', 'CI_PROJECT_ID', 'CI_PIPELINE_ID', 'GITLAB_TOKEN' ]) {
    if (!process.env[name]) {
      console.error(`${ name } is not set`);
      process.exit(1);
    }
  }
  mkdirSync('.claude-ci', { recursive: true });
  rmSync('.claude-ci/skip', { force: true });
  prepare().catch(e => {
    console.error(e.message);
    process.exit(1);
  });
}
