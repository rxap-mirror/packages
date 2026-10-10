#!/usr/bin/env node
/**
 * Dependency-ordered AI review of the packages/ projects.
 *
 * Builds the Nx project graph (static edges), restricts it to the root prefix (default packages/),
 * filters it by tags/projects, and
 * reviews the selection level by level: leaves first, so every project's reviewer gets the
 * finished reports of its direct dependencies and can split its findings into internal issues
 * and issues coming from a dependency. Each project is reviewed by its own Claude instance whose
 * lead fans out to the review-* specialists in .claude/agents (subagents in print mode, an agent
 * team in --teams mode).
 *
 * Output: review-reports/<timestamp>/{index.md, <project>.md, <project>.json, logs/<project>.log}
 *
 * Flags (`--flag value` or `--flag=value`):
 *   --root-prefix <p>   only projects whose root starts with this path (default packages/),
 *                       e.g. packages/angular/
 *   --tags a,b          only projects with these Nx tags
 *   --match all|any     tag matching: every tag (default) or any tag
 *   --projects p1,p2    only these projects
 *   --exclude p1,p2     never these projects
 *   --with-deps         also review the dependencies of the selection (within the root prefix)
 *   --concurrency N     parallel Claude instances per level (default 4)
 *   --model M           model alias or id for the lead and the specialists
 *   --budget-usd N      per-project cost cap (print mode only, default 5)
 *   --total-budget-usd N  stop starting new projects once the run has spent N (running ones
 *                       finish); continue later with --resume (print mode only)
 *   --run-tests         allow the reviewers to run `nx run <project>:lint|test|build`
 *   --write-tests       also let them write reproducing *.spec.ts files (implies --run-tests);
 *                       runs in a git worktree on branch review/<run-id>, one commit per project;
 *                       at the end the branch is pushed and a draft MR is opened (glab)
 *   --no-mr             with --write-tests: keep the branch local, don't push or open an MR
 *   --mr-target <b>     MR target branch (default: the branch currently checked out)
 *   --teams             agent teams via tmux instead of `claude -p` + subagents (no budget cap)
 *   --timeout-min N     per-project timeout in --teams mode (default 60)
 *   --out <dir>         run directory (default review-reports/<timestamp>)
 *   --resume <dir>      continue a run: projects with an existing <project>.json are skipped
 *   --incremental       reuse a project's latest report (from any earlier run) when neither its
 *                       root nor any of its transitive dependencies changed since that report's
 *                       commit, and the earlier run used at least the same --run-tests/--write-tests
 *   --dry-run           print the selection and the review order, then exit
 *
 * Earlier runs are also used as context: dependency reports outside this run come from the newest
 * earlier run (labelled with their age), and each reviewer gets its project's previous findings
 * — after its own fresh review — to mark them fixed or still open.
 *
 * Cleanup:
 *   --clean [--keep N] [--dry-run]
 *                       keep the newest N report runs (default 5; older runs that still hold a
 *                       project's latest report keep their JSON/MD but lose logs/), remove review
 *                       worktrees and local review/* branches that have nothing unpushed
 */

import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { clean } from './clean.mjs';
import { computeLevels, DEFAULT_ROOT_PREFIX, loadGraph, selectProjects } from './graph.mjs';
import { createHistory, describeAge } from './history.mjs';
import { renderIndex, renderProject } from './render.mjs';
import * as print from './runner-print.mjs';
import * as teams from './runner-teams.mjs';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const REPORTS_DIR = join(REPO, 'review-reports');
const PROMPT_TEMPLATE = readFileSync(new URL('./prompt.md', import.meta.url), 'utf8');
const REVIEW_AGENTS = ['review-api', 'review-correctness', 'review-tests', 'review-deps', 'review-docs'];
const MAX_DEP_FINDINGS = 40;

// ---------------------------------------------------------------------------
// flags / colors
// ---------------------------------------------------------------------------
const argv = process.argv.slice(2);
const BOOLEAN_FLAGS = new Set(['with-deps', 'run-tests', 'write-tests', 'teams', 'dry-run', 'help', 'no-mr', 'incremental', 'clean']);

function parseArgs(args) {
  const out = {};
  for (let i = 0; i < args.length; i++) {
    const m = /^--([^=]+)(?:=(.*))?$/.exec(args[i]);
    if (!m) {
      throw new Error(`unexpected argument: ${args[i]}`);
    }
    const [, name, inline] = m;
    if (BOOLEAN_FLAGS.has(name)) {
      out[name] = true;
    } else if (inline !== undefined) {
      out[name] = inline;
    } else if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
      out[name] = args[++i];
    } else {
      throw new Error(`--${name} needs a value`);
    }
  }
  return out;
}

const C = {
  red: (s) => `\x1b[0;31m${s}\x1b[0m`,
  green: (s) => `\x1b[0;32m${s}\x1b[0m`,
  blue: (s) => `\x1b[0;34m${s}\x1b[0m`,
  yellow: (s) => `\x1b[0;33m${s}\x1b[0m`,
};
const log = (msg) => console.log(C.blue(`\n▶ ${msg}`));
const ok = (msg) => console.log(C.green(`✔ ${msg}`));
const warn = (msg) => console.warn(C.yellow(`⚠ ${msg}`));
const die = (msg) => {
  console.error(C.red(`✗ ${msg}`));
  process.exit(1);
};

let flags;
try {
  flags = parseArgs(argv);
} catch (e) {
  die(e.message);
}
if (flags.help) {
  const header = readFileSync(fileURLToPath(import.meta.url), 'utf8').split('*/')[0];
  console.log(header.replace(/^#!.*\n\/\*\*\n/, '').replace(/^ \* ?/gm, ''));
  process.exit(0);
}
if (flags.clean) {
  const keep = Number(flags.keep ?? 5);
  if (!(keep >= 0)) {
    die('--keep must be >= 0');
  }
  clean({ repo: REPO, reportsDir: REPORTS_DIR, keep, dryRun: !!flags['dry-run'], log, ok, warn });
  process.exit(0);
}

const list = (v) => (v ? String(v).split(',').map((s) => s.trim()).filter(Boolean) : []);
const opts = {
  // a trailing slash keeps packages/nest from also matching packages/nestjs-*
  rootPrefix: (flags['root-prefix'] ?? DEFAULT_ROOT_PREFIX).replace(/\/?$/, '/'),
  tags: list(flags.tags),
  match: flags.match ?? 'all',
  projects: list(flags.projects),
  exclude: list(flags.exclude),
  withDeps: !!flags['with-deps'],
  concurrency: Number(flags.concurrency ?? 4),
  model: flags.model,
  budgetUsd: Number(flags['budget-usd'] ?? 5),
  totalBudgetUsd: flags['total-budget-usd'] ? Number(flags['total-budget-usd']) : undefined,
  writeTests: !!flags['write-tests'],
  openMr: !!flags['write-tests'] && !flags['no-mr'],
  runTests: !!flags['run-tests'] || !!flags['write-tests'],
  teams: !!flags.teams,
  timeoutMin: Number(flags['timeout-min'] ?? 60),
  dryRun: !!flags['dry-run'],
  incremental: !!flags.incremental,
};
if (!['all', 'any'].includes(opts.match)) {
  die('--match must be "all" or "any"');
}
if (!(opts.concurrency >= 1)) {
  die('--concurrency must be >= 1');
}

const startedAt = new Date().toISOString();
const stamp = startedAt.replace(/[:.]/g, '-').slice(0, 19);
const OUT = resolve(flags.resume ?? flags.out ?? join(REPORTS_DIR, stamp));
const RESUME = !!flags.resume;
// derived from the run directory so --resume reuses the same worktree and branch
const RUN_ID = basename(OUT).replace(/[^A-Za-z0-9._-]/g, '-');
const BRANCH = `review/${RUN_ID}`;
const history = createHistory({ repo: REPO, reportsDir: REPORTS_DIR });
// the commit every report of this run describes (with --write-tests the worktree starts here)
const BASE_SHA = history.head();

// ---------------------------------------------------------------------------
// selection + order
// ---------------------------------------------------------------------------
log('Building the Nx project graph');
const graph = loadGraph();
let selected;
try {
  selected = selectProjects(graph, opts);
} catch (e) {
  die(e.message);
}
if (!selected.size) {
  const counts = new Map();
  for (const p of graph.projects.values()) {
    if (p.root.startsWith(opts.rootPrefix)) {
      for (const t of p.tags.filter((t) => !t.startsWith('npm:'))) {
        counts.set(t, (counts.get(t) ?? 0) + 1);
      }
    }
  }
  const available = [...counts].sort().map(([t, n]) => `${t} (${n})`).join(', ');
  die(`no project under "${opts.rootPrefix}" matches the selection${available ? `\n  tags under this prefix: ${available}` : ''}`);
}
const levels = computeLevels(selected, graph.deps);
const levelOf = new Map(levels.flatMap((lvl, i) => lvl.map((p) => [p, i])));

log(`${selected.size} project(s) in ${levels.length} level(s)`);
levels.forEach((lvl, i) => console.log(`  L${i}: ${lvl.join(', ')}`));
if (opts.dryRun) {
  process.exit(0);
}
if (opts.teams) {
  try {
    teams.assertTmux();
  } catch (e) {
    die(e.message);
  }
  warn('--teams: interactive sessions in tmux, no --budget-usd cap. Attach with `tmux attach -t review-<project>`.');
}

mkdirSync(join(OUT, 'logs'), { recursive: true });
ok(`Run directory: ${OUT}`);

// ---------------------------------------------------------------------------
// --write-tests: isolated worktree
// ---------------------------------------------------------------------------
let CWD = REPO;
let gitLock = Promise.resolve();
const withGitLock = (fn) => (gitLock = gitLock.then(fn, fn));
const git = (...args) => execFileSync('git', ['-C', CWD, ...args], { stdio: ['ignore', 'pipe', 'pipe'] }).toString();

const MR_TARGET = flags['mr-target'] ?? execFileSync('git', ['-C', REPO, 'branch', '--show-current']).toString().trim();
if (opts.openMr) {
  if (!MR_TARGET) {
    die('cannot detect the MR target branch (detached HEAD?) — pass --mr-target or --no-mr');
  }
  try {
    execFileSync('glab', ['--version'], { stdio: 'ignore' });
  } catch {
    die('--write-tests opens a merge request and needs glab in PATH — install it or pass --no-mr');
  }
}

if (opts.writeTests) {
  CWD = join(REPO, '.claude', 'worktrees', `review-${RUN_ID}`);
  if (!existsSync(CWD)) {
    log(`Creating worktree ${CWD} on branch ${BRANCH}`);
    let branchExists = true;
    try {
      execFileSync('git', ['-C', REPO, 'rev-parse', '--verify', '--quiet', `refs/heads/${BRANCH}`], { stdio: 'ignore' });
    } catch {
      branchExists = false;
    }
    // --resume after the MR was opened: the worktree is gone but the branch is still there
    const args = branchExists ? [CWD, BRANCH] : ['-b', BRANCH, CWD, 'HEAD'];
    execFileSync('git', ['-C', REPO, 'worktree', 'add', ...args], { stdio: 'inherit' });
    symlinkSync(join(REPO, 'node_modules'), join(CWD, 'node_modules'));
  }
  // the review agents may not be committed yet — make sure the worktree session sees them
  mkdirSync(join(CWD, '.claude', 'agents'), { recursive: true });
  for (const a of REVIEW_AGENTS) {
    cpSync(join(REPO, '.claude', 'agents', `${a}.md`), join(CWD, '.claude', 'agents', `${a}.md`));
  }
}
const IGNORED_CHANGES = new Set(['node_modules', ...REVIEW_AGENTS.map((a) => `.claude/agents/${a}.md`)]);

/**
 * Keeps only *.spec.ts changes under the project root (and other selected projects' roots, which
 * belong to concurrent runs), reverts everything else, and commits the project's specs.
 * @returns {string[]} warnings
 */
function enforceSpecOnly(project) {
  const warnings = [];
  const ownRoot = `${project.root}/`;
  const otherRoots = [...selected].filter((p) => p !== project.name).map((p) => `${graph.projects.get(p).root}/`);
  const keep = [];
  const status = git('status', '--porcelain', '--untracked-files=all').split('\n').filter(Boolean);
  for (const line of status) {
    const code = line.slice(0, 2);
    const path = line.slice(3).split(' -> ').pop();
    if (IGNORED_CHANGES.has(path) || path.startsWith('.claude/agents/')) {
      continue;
    }
    const isSpec = path.endsWith('.spec.ts');
    if (isSpec && path.startsWith(ownRoot)) {
      keep.push(path);
    } else if (isSpec && otherRoots.some((r) => path.startsWith(r))) {
      // owned by a concurrent project run
    } else {
      warnings.push(`Reverted a change outside the allowed *.spec.ts scope: \`${path}\``);
      if (code === '??') {
        rmSync(join(CWD, path), { force: true });
      } else {
        git('checkout', 'HEAD', '--', path);
      }
    }
  }
  if (keep.length) {
    git('add', '--', ...keep);
    git(
      'commit', '--no-verify',
      '-m', `test(${project.name}): reproduce package review findings`,
      '-m', `Specs written by tools/scripts/review.sh (run ${RUN_ID}). Each proven bug is an it.failing() test.`,
      '-m', 'Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>',
      '--', ...keep,
    );
  }
  return warnings;
}

// ---------------------------------------------------------------------------
// prompt
// ---------------------------------------------------------------------------
/** Finds the report of `name`: this run first, then the newest earlier run. */
function findReport(name) {
  const own = join(OUT, `${name}.json`);
  if (existsSync(own)) {
    return { file: own, runId: RUN_ID, report: JSON.parse(readFileSync(own, 'utf8')), current: true };
  }
  return history.latest(name, { exclude: OUT });
}

/** The project's own roots plus those of all its transitive dependencies. */
function closureRoots(name) {
  const seen = new Set([name]);
  const queue = [name];
  while (queue.length) {
    for (const d of graph.deps.get(queue.pop()) ?? []) {
      if (!seen.has(d)) {
        seen.add(d);
        queue.push(d);
      }
    }
  }
  return [...seen].map((p) => graph.projects.get(p)?.root).filter(Boolean);
}

function depFindings(deps) {
  if (!deps.length) {
    return '_This project has no workspace dependencies._';
  }
  return deps
    .map((d) => {
      const found = findReport(d);
      if (!found) {
        return `### ${d}\n_No report available (never reviewed, or its review failed)._`;
      }
      let heading = `### ${d}`;
      if (!found.current) {
        const changed = history.changedSince(found.report._meta?.commit, [graph.projects.get(d).root]);
        const why = selected.has(d) ? 'its review in this run failed, so this is' : 'not part of this run;';
        heading += `\n_(${why} the report from an earlier review: ${describeAge(found, changed)}. ` +
          `If files changed since, verify a finding in the current code before relying on it.)_`;
      }
      const relevant = (found.report.findings ?? []).filter((f) => f.severity !== 'info');
      const lines = relevant
        .slice(0, MAX_DEP_FINDINGS)
        .map((f) => `- \`${f.id}\` [${f.severity}/${f.category}${f.origin === 'dependency' ? `, from ${f.dependency}` : ''}] ${f.title} (\`${f.file}\`)`);
      if (relevant.length > MAX_DEP_FINDINGS) {
        lines.push(`- … ${relevant.length - MAX_DEP_FINDINGS} more in \`${found.file}\``);
      }
      return `${heading}\n${lines.join('\n') || '_No actionable findings._'}`;
    })
    .join('\n\n');
}

function previousFindings(project) {
  const prev = history.latest(project.name, { exclude: OUT });
  if (!prev?.report.findings?.length) {
    return '';
  }
  const changed = history.changedSince(prev.report._meta?.commit, [project.root]);
  const lines = prev.report.findings.map((f) => `- \`${f.id}\` [${f.severity}/${f.category}] ${f.title} (\`${f.file}${f.line ? `:${f.line}` : ''}\`)`);
  return [
    '## Previous review of this project',
    `There is an earlier report (${describeAge(prev, changed)}).`,
    '**Do your fresh review first and do not look at this list before the lenses have reported**, so the old findings do not steer the new review. Then:',
    '1. Check every previous finding against the current code and record it in `previousFindings` with status `fixed` (the problem is gone), `open` (still present), or `obsolete` (the code was removed or the finding was wrong), plus a one-line note.',
    '2. For a fresh finding that matches a previous `open` one, **reuse the previous id**. Number genuinely new findings after the highest previous id.',
    '3. A previous `open` finding the lenses missed is still a finding: add it, with the previous id.',
    '',
    ...lines,
  ].join('\n');
}

function checksInstructions(project) {
  if (!opts.runTests) {
    return '## Checks\nChecks are disabled for this run. Do not run lint/test/build; set every `checks` status to `skipped`.';
  }
  const available = ['lint', 'test', 'build'].filter((t) => project.targets.includes(t));
  return [
    '## Checks',
    `Have \`review-tests\` run these targets and report the result in \`checks\` (status \`n/a\` for a missing target): ${available.map((t) => `\`yarn nx run ${project.name}:${t}\``).join(', ') || 'none'}.`,
    'Turn every real failure into a finding with the relevant output as `evidence`.',
  ].join('\n');
}

function writeTestsInstructions(project) {
  if (!opts.writeTests) {
    return '';
  }
  return [
    '## Reproducing tests',
    `Test writing is enabled. For each critical/high correctness finding that a unit test can demonstrate, have \`review-tests\` write a focused \`*.spec.ts\` under \`${project.root}\` and run it.`,
    'A test that fails because of the bug proves it: set `testAdded` to its path and put the failure in `evidence`. Delete tests that pass (the suspicion was wrong) and drop or downgrade the finding.',
    'Then mark each proving test with Jest\'s `it.failing(...)` (or `test.failing`) and a comment `// package review: <finding title>` above it, and run it again to confirm it now passes. ' +
      'The specs are merged via a merge request, so CI must stay green while the bug exists. `it.failing` passes as long as the bug is present and turns red once someone fixes it; then it becomes a normal `it`.',
    `Only \`*.spec.ts\` files under \`${project.root}\` may be created or edited. Any other change is reverted automatically.`,
  ].join('\n');
}

function buildPrompt(project, resultFile) {
  const deps = graph.deps.get(project.name) ?? [];
  const vars = {
    PROJECT: project.name,
    ROOT: project.root,
    ABS_ROOT: join(CWD, project.root),
    TAGS: project.tags.map((t) => `\`${t}\``).join(', ') || 'none',
    TARGETS: project.targets.join(', ') || 'none',
    DEPS: deps.map((d) => `\`${d}\``).join(', ') || 'none',
    DEP_FINDINGS: depFindings(deps),
    TEAM_INSTRUCTIONS: opts.teams ? teams.TEAM_INSTRUCTIONS : print.TEAM_INSTRUCTIONS,
    CHECKS_INSTRUCTIONS: checksInstructions(project),
    WRITE_TESTS_INSTRUCTIONS: writeTestsInstructions(project),
    PREVIOUS_FINDINGS: previousFindings(project),
    OUTPUT_INSTRUCTIONS: '## Output\n' + (opts.teams ? teams.outputInstructions(resultFile) : print.OUTPUT_INSTRUCTIONS),
  };
  return PROMPT_TEMPLATE.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? '');
}

function allowedTools(project, resultFile) {
  const tools = [
    'Read', 'Grep', 'Glob', 'Agent', 'Task',
    'Bash(git log:*)', 'Bash(git diff:*)', 'Bash(git show:*)', 'Bash(git blame:*)',
    'Bash(yarn nx show:*)',
  ];
  if (opts.runTests) {
    for (const t of ['lint', 'test', 'build']) {
      tools.push(`Bash(yarn nx run ${project.name}:${t}:*)`);
    }
  }
  if (opts.writeTests) {
    tools.push(`Write(${project.root}/**/*.spec.ts)`, `Edit(${project.root}/**/*.spec.ts)`, 'Bash(yarn jest:*)');
  }
  if (opts.teams) {
    // agent-team coordination tools + the single result file
    tools.push('TeamCreate', 'TeamDelete', 'SendMessage', 'TaskCreate', 'TaskUpdate', 'TaskList', 'TaskGet', `Write(/${resultFile})`);
  }
  return tools;
}

// ---------------------------------------------------------------------------
// run
// ---------------------------------------------------------------------------
const rows = new Map();
let totalCost = 0;

async function reviewProject(name) {
  const project = graph.projects.get(name);
  const jsonFile = join(OUT, `${name}.json`);
  const row = { name, level: levelOf.get(name), tags: project.tags };
  rows.set(name, row);

  if (RESUME && existsSync(jsonFile)) {
    row.report = JSON.parse(readFileSync(jsonFile, 'utf8'));
    console.log(`  ⏭  ${name} (already reviewed)`);
    return;
  }

  if (opts.incremental) {
    const prev = history.latest(name, { exclude: OUT });
    const meta = prev?.report._meta;
    const sameScope = meta && (meta.options?.runTests || !opts.runTests) && (meta.options?.writeTests || !opts.writeTests);
    if (prev && sameScope && !meta.dirty && history.changedSince(meta.commit, closureRoots(name)) === 0) {
      const report = { ...prev.report, _meta: { ...meta, reusedFrom: prev.runId } };
      row.report = report;
      writeFileSync(jsonFile, JSON.stringify(report, null, 2));
      writeFileSync(
        join(OUT, `${name}.md`),
        renderProject(report, project, {
          level: row.level,
          deps: graph.deps.get(name) ?? [],
          warnings: [`Reused unchanged from run \`${prev.runId}\` (commit ${meta.commit.slice(0, 7)}): neither the project nor its dependencies changed since.`],
        }),
      );
      console.log(`  ♻  ${name} (unchanged since run ${prev.runId})`);
      return;
    }
  }

  if (opts.totalBudgetUsd !== undefined && totalCost >= opts.totalBudgetUsd) {
    row.error = `not started: run budget of $${opts.totalBudgetUsd} reached`;
    row.notStarted = true;
    return;
  }

  const logFile = join(OUT, 'logs', `${name}.log`);
  const resultFile = join(OUT, 'logs', `${name}.teams-result.json`);
  rmSync(resultFile, { force: true });
  const ctx = {
    project: name,
    prompt: buildPrompt(project, resultFile),
    cwd: CWD,
    allowedTools: allowedTools(project, resultFile),
    model: opts.model,
    budgetUsd: opts.budgetUsd,
    logFile,
    resultFile,
    timeoutMin: opts.timeoutMin,
  };
  console.log(`  ▸ ${name}`);
  const started = Date.now();
  try {
    const { report, costUsd } = opts.teams ? await teams.runTeams(ctx) : await print.runPrint(ctx);
    const warnings = opts.writeTests ? await withGitLock(() => enforceSpecOnly(project)) : [];
    const prevIds = (history.latest(name, { exclude: OUT })?.report.findings ?? []).map((f) => f.id);
    const accounted = new Set((report.previousFindings ?? []).map((p) => p.id));
    const unaccounted = prevIds.filter((id) => !accounted.has(id));
    if (unaccounted.length) {
      warnings.push(`${unaccounted.length} finding(s) of the previous review got no status: ${unaccounted.map((id) => `\`${id}\``).join(', ')}`);
    }
    report.project = name;
    report._meta = {
      project: name,
      runId: RUN_ID,
      commit: BASE_SHA,
      // the worktree only holds committed code; the main checkout may have local edits
      dirty: opts.writeTests ? false : history.isDirty(project.root),
      reviewedAt: new Date().toISOString(),
      options: { runTests: opts.runTests, writeTests: opts.writeTests, model: opts.model ?? null, teams: opts.teams },
    };
    row.report = report;
    totalCost += costUsd ?? 0;
    writeFileSync(jsonFile, JSON.stringify(report, null, 2));
    writeFileSync(
      join(OUT, `${name}.md`),
      renderProject(report, project, { level: row.level, deps: graph.deps.get(name) ?? [], costUsd, warnings }),
    );
    const secs = Math.round((Date.now() - started) / 1000);
    ok(`${name}: ${report.findings.length} finding(s) in ${secs}s${costUsd ? `, $${costUsd.toFixed(2)}` : ''}`);
  } catch (e) {
    if (opts.writeTests) {
      await withGitLock(() => enforceSpecOnly(project)).catch(() => undefined);
    }
    row.error = e.message;
    console.error(C.red(`✗ ${name}: ${e.message}`));
  }
}

/** Lists the commits the review added on top of the target, as `{sha, subject}`. */
function reviewCommits() {
  const base = execFileSync('git', ['-C', REPO, 'merge-base', MR_TARGET || 'HEAD', BRANCH]).toString().trim();
  return git('log', '--format=%h %s', `${base}..HEAD`).split('\n').filter(Boolean);
}

function mrDescription() {
  const sections = [];
  for (const name of levels.flat()) {
    const report = rows.get(name)?.report;
    const proven = (report?.findings ?? []).filter((f) => f.testAdded);
    if (proven.length) {
      sections.push(
        `### ${name}`,
        '',
        ...proven.map((f) => `- \`${f.id}\` **${f.severity}** ${f.title}: \`${f.testAdded}\``),
        '',
      );
    }
  }
  return [
    `Reproducing unit tests written by the automated package review (\`tools/scripts/review.sh\`, run \`${RUN_ID}\`).`,
    '',
    'Each proven bug is an `it.failing(...)` test: it passes while the bug exists and fails once the bug is fixed. Whoever fixes a bug turns its test into a normal `it(...)`.',
    '',
    `The full reports are in \`review-reports/${RUN_ID}/\` on the machine that ran the review.`,
    '',
    '## Proven findings',
    '',
    ...(sections.length ? sections : ['_The reports reference no spec files; see the commits._', '']),
    '🤖 Generated with [Claude Code](https://claude.com/claude-code)',
  ].join('\n');
}

/** The branch is on origin now, so the local copies are no longer needed. */
function removeWorktreeAndBranch() {
  execFileSync('git', ['-C', REPO, 'worktree', 'remove', '--force', CWD]);
  execFileSync('git', ['-C', REPO, 'branch', '-D', BRANCH], { stdio: 'ignore' });
}

/** Pushes the review branch and opens a draft MR, so the written specs are not lost. */
function publishSpecs() {
  const commits = reviewCommits();
  if (!commits.length) {
    console.log(`  specs: none written; removing worktree ${CWD}`);
    execFileSync('git', ['-C', REPO, 'worktree', 'remove', '--force', CWD]);
    execFileSync('git', ['-C', REPO, 'branch', '-D', BRANCH]);
    return;
  }
  console.log(`  specs: ${commits.length} commit(s) on ${BRANCH}`);
  if (!opts.openMr) {
    console.log(`         kept local in ${CWD} (--no-mr)`);
    return;
  }
  try {
    execFileSync('git', ['-C', CWD, 'push', '-u', 'origin', BRANCH], { stdio: 'inherit' });
    const descFile = join(OUT, 'mr-description.md');
    writeFileSync(descFile, mrDescription());
    const existing = execFileSync('glab', ['mr', 'list', '--source-branch', BRANCH, '--output', 'json'], { cwd: CWD })
      .toString();
    const open = JSON.parse(existing || '[]')[0];
    if (open) {
      execFileSync('glab', ['mr', 'update', String(open.iid), '--description', readFileSync(descFile, 'utf8')], {
        cwd: CWD,
        stdio: 'ignore',
      });
      ok(`Merge request updated: ${open.web_url}`);
      removeWorktreeAndBranch();
      return;
    }
    const out = execFileSync(
      'glab',
      [
        'mr', 'create', '--draft', '--yes', '--remove-source-branch',
        '--source-branch', BRANCH, '--target-branch', MR_TARGET,
        '--title', `test: reproducing specs from package review ${RUN_ID}`,
        '--description', readFileSync(descFile, 'utf8'),
      ],
      { cwd: CWD, stdio: ['ignore', 'pipe', 'inherit'] },
    ).toString();
    ok(`Merge request: ${out.trim().split('\n').pop()}`);
    removeWorktreeAndBranch();
  } catch (e) {
    console.error(C.red(`✗ could not push/open the MR: ${e.message}`));
    console.error(C.yellow(`  The specs are safe on the local branch ${BRANCH} (worktree ${CWD}).`));
    process.exitCode = 1;
  }
}

async function runPool(items, size, fn) {
  const queue = [...items];
  const workers = Array.from({ length: Math.min(size, queue.length) }, async () => {
    while (queue.length) {
      await fn(queue.shift());
    }
  });
  await Promise.all(workers);
}

function writeIndex() {
  const ordered = levels.flat().filter((p) => rows.has(p)).map((p) => rows.get(p));
  writeFileSync(join(OUT, 'index.md'), renderIndex(ordered, { args: argv, startedAt }));
}

for (const [i, level] of levels.entries()) {
  log(`Level ${i}/${levels.length - 1}: ${level.length} project(s)`);
  await runPool(level, opts.concurrency, reviewProject);
  writeIndex(); // keep the index current so an aborted run still has one
}

// ---------------------------------------------------------------------------
// report
// ---------------------------------------------------------------------------
log('Review report');
const failed = [...rows.values()].filter((r) => !r.report);
console.log(`  index: ${join(OUT, 'index.md')}`);
if (totalCost) {
  console.log(`  cost:  $${totalCost.toFixed(2)}`);
}
if (opts.writeTests) {
  publishSpecs();
}
const notStarted = failed.filter((r) => r.notStarted);
if (notStarted.length) {
  warn(`Run budget of $${opts.totalBudgetUsd} reached: ${notStarted.length} project(s) not started.`);
}
if (failed.length) {
  const errored = failed.filter((r) => !r.notStarted);
  if (errored.length) {
    console.error(C.red(`✗ ${errored.length} project(s) failed: ${errored.map((r) => r.name).join(', ')}`));
  }
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    if (/^--(resume|out)$/.test(argv[i])) {
      i++; // drop the flag and its value
    } else if (!/^--(resume|out)=/.test(argv[i])) {
      rest.push(argv[i]);
    }
  }
  console.error(C.yellow(`  Continue with: tools/scripts/review.sh --resume ${OUT} ${rest.join(' ')}`));
  process.exit(1);
}
ok('All projects reviewed.');
