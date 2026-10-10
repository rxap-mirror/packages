/**
 * `review.sh --clean [--keep N] [--dry-run]`: removes what review runs leave behind.
 *
 * - review-reports/: keeps the newest N runs (default 5). An older run is kept anyway while it
 *   holds the latest report of some project (--incremental and the previous-findings diff need
 *   it); only its logs/ folder is removed.
 * - .claude/worktrees/review-*: removed when its branch has nothing unpushed.
 * - local review/* branches: deleted when they are fully contained in a remote branch, or have
 *   no commits of their own. Branches with unpushed specs are kept and reported.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, rmSync, statSync } from 'node:fs';
import { basename, join } from 'node:path';
import { createHistory } from './history.mjs';

export function clean({ repo, reportsDir, keep, dryRun, log, ok, warn }) {
  const git = (...args) => execFileSync('git', ['-C', repo, ...args], { stdio: ['ignore', 'pipe', 'pipe'] }).toString();
  const act = (what, fn) => {
    console.log(`  ${dryRun ? 'would remove' : 'remove'} ${what}`);
    if (!dryRun) {
      fn();
    }
  };

  // --- reports --------------------------------------------------------------
  log(`Report runs in ${reportsDir} (keeping the newest ${keep})`);
  const history = createHistory({ repo, reportsDir });
  const runs = history.runDirs().sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs);
  const protectedRuns = new Set();
  const projects = new Set(
    runs.flatMap((dir) => readdirSync(dir).filter((f) => f.endsWith('.json') && f !== 'mr-description.json').map((f) => f.slice(0, -5))),
  );
  for (const p of projects) {
    const found = history.latest(p);
    if (found) {
      protectedRuns.add(join(reportsDir, found.runId));
    }
  }
  for (const [i, dir] of runs.entries()) {
    if (i < keep) {
      continue;
    }
    if (protectedRuns.has(dir)) {
      if (existsSync(join(dir, 'logs'))) {
        act(`${basename(dir)}/logs (run still holds the latest report of a project)`, () => rmSync(join(dir, 'logs'), { recursive: true, force: true }));
      }
      continue;
    }
    act(basename(dir), () => rmSync(dir, { recursive: true, force: true }));
  }

  // --- branches + worktrees -------------------------------------------------
  log('Review branches and worktrees');
  try {
    git('fetch', '--prune', 'origin');
  } catch {
    warn('git fetch origin failed; judging branches against the last known remote state');
  }
  const worktrees = new Map(); // branch -> path
  let path;
  for (const line of git('worktree', 'list', '--porcelain').split('\n')) {
    if (line.startsWith('worktree ')) {
      path = line.slice(9);
    } else if (line.startsWith('branch refs/heads/review/')) {
      worktrees.set(line.slice('branch refs/heads/'.length), path);
    }
  }
  const branches = git('for-each-ref', '--format=%(refname:short)', 'refs/heads/review/').split('\n').filter(Boolean);
  for (const branch of branches) {
    const remoteContains = git('branch', '-r', '--contains', branch).trim().length > 0;
    const ownCommits = Number(git('rev-list', '--count', branch, '--not', '--remotes', '--exclude', `refs/heads/${branch}`, '--branches').trim());
    if (!remoteContains && ownCommits > 0) {
      warn(`kept ${branch}: ${ownCommits} unpushed commit(s)${worktrees.has(branch) ? ` (worktree ${worktrees.get(branch)})` : ''}`);
      continue;
    }
    const wt = worktrees.get(branch);
    if (wt) {
      act(`worktree ${wt}`, () => git('worktree', 'remove', '--force', wt));
    }
    act(`branch ${branch}`, () => git('branch', '-D', branch));
  }
  if (!dryRun) {
    git('worktree', 'prune');
  }
  ok(dryRun ? 'Dry run: nothing was removed.' : 'Cleanup done.');
}
