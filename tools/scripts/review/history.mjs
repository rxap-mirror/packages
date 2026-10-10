/**
 * Access to earlier review runs in review-reports/.
 *
 * Every report JSON carries `_meta` ({ project, runId, commit, dirty, reviewedAt, options,
 * reusedFrom? }). `commit` is the HEAD the review ran against; `dirty` means the project root had
 * uncommitted changes at that time, so the commit alone does not describe what was reviewed.
 * Reports written before `_meta` existed are still found, but are treated as "age unknown".
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

export function createHistory({ repo, reportsDir }) {
  const git = (...args) => execFileSync('git', ['-C', repo, ...args], { stdio: ['ignore', 'pipe', 'ignore'] }).toString();
  const commitExists = new Map();

  function hasCommit(sha) {
    if (!commitExists.has(sha)) {
      try {
        git('cat-file', '-e', `${sha}^{commit}`);
        commitExists.set(sha, true);
      } catch {
        commitExists.set(sha, false);
      }
    }
    return commitExists.get(sha);
  }

  function runDirs() {
    if (!existsSync(reportsDir)) {
      return [];
    }
    return readdirSync(reportsDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => join(reportsDir, d.name));
  }

  /**
   * Newest report of `name` across all runs (by `_meta.reviewedAt`, else file mtime).
   * @param {{exclude?: string}} opts  run directory to ignore (e.g. the current one)
   * @returns {{file: string, runId: string, report: object, reviewedAt: string} | undefined}
   */
  function latest(name, { exclude } = {}) {
    let best;
    for (const dir of runDirs()) {
      const file = join(dir, `${name}.json`);
      if (dir === exclude || !existsSync(file)) {
        continue;
      }
      let report;
      try {
        report = JSON.parse(readFileSync(file, 'utf8'));
      } catch {
        continue;
      }
      const reviewedAt = report._meta?.reviewedAt ?? statSync(file).mtime.toISOString();
      if (!best || reviewedAt > best.reviewedAt) {
        best = { file, runId: dir.split('/').pop(), report, reviewedAt };
      }
    }
    return best;
  }

  /**
   * Number of files under `paths` that differ between `sha` and the working tree (tracked changes
   * plus untracked files). `undefined` when the commit is unknown, i.e. the age can't be judged.
   */
  function changedSince(sha, paths) {
    if (!sha || !hasCommit(sha)) {
      return undefined;
    }
    const tracked = git('diff', '--name-only', sha, '--', ...paths).split('\n').filter(Boolean);
    const untracked = git('ls-files', '--others', '--exclude-standard', '--', ...paths).split('\n').filter(Boolean);
    return new Set([...tracked, ...untracked]).size;
  }

  function isDirty(path) {
    return git('status', '--porcelain', '--', path).trim().length > 0;
  }

  function head() {
    return git('rev-parse', 'HEAD').trim();
  }

  return { latest, changedSince, isDirty, head, runDirs };
}

/** "run 2026-10-10T08-49-30, commit 0ee7eea, 3 file(s) changed since" */
export function describeAge(found, changed) {
  const meta = found.report._meta;
  const parts = [`run ${found.runId}`];
  if (meta?.commit) {
    parts.push(`commit ${meta.commit.slice(0, 7)}${meta.dirty ? ' + uncommitted changes' : ''}`);
  }
  if (changed === undefined) {
    parts.push('age unknown');
  } else {
    parts.push(changed ? `${changed} file(s) changed since` : 'unchanged since');
  }
  return parts.join(', ');
}
