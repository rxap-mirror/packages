/**
 * `--teams` runner: agent teams do not spawn in `claude -p`, so each project gets an interactive
 * `claude` session in a detached tmux session with CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1. The
 * lead writes its JSON report to a known file; we poll for it, validate it, then kill the session.
 *
 * There is no budget cap in this mode (`--max-budget-usd` is print-mode only).
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

const SCHEMA_PATH = fileURLToPath(new URL('./schema.json', import.meta.url));

export const TEAM_INSTRUCTIONS =
  'Create an **agent team** for this review. Spawn one teammate per review lens, using the subagent definitions of the same name as teammate types. ' +
  'Let the teammates challenge each other\'s findings (e.g. correctness hands suspected bugs to tests, deps cross-checks origin attribution). ' +
  'When all teammates are done, shut the team down and merge the findings yourself.';

export const outputInstructions = (resultFile) =>
  `Write the final report as JSON matching the schema in \`${SCHEMA_PATH}\` to \`${resultFile}\` using the Write tool. ` +
  'Write that file exactly once, as the very last step, after the team is shut down. Then stop.';

export function assertTmux() {
  try {
    execFileSync('tmux', ['-V'], { stdio: 'ignore' });
  } catch {
    throw new Error('--teams needs tmux in PATH');
  }
}

const tmux = (...args) => execFileSync('tmux', args, { stdio: ['ignore', 'pipe', 'ignore'] }).toString();

/**
 * @returns {Promise<{report: object}>}
 */
export async function runTeams({ project, prompt, cwd, allowedTools, model, logFile, resultFile, timeoutMin }) {
  const session = `review-${project}`.replace(/[^A-Za-z0-9_-]/g, '_');
  const promptFile = logFile.replace(/\.log$/, '.prompt.md');
  const launcher = logFile.replace(/\.log$/, '.teams.sh');
  writeFileSync(promptFile, prompt);
  const modelArg = model ? `--model '${model}' ` : '';
  writeFileSync(
    launcher,
    [
      '#!/usr/bin/env bash',
      `cd '${cwd}'`,
      'export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1',
      `exec claude ${modelArg}--permission-mode dontAsk --allowedTools '${allowedTools.join(',')}' "$(cat '${promptFile}')"`,
      '',
    ].join('\n'),
    { mode: 0o755 },
  );

  try {
    tmux('kill-session', '-t', session);
  } catch {
    // no stale session
  }
  tmux('new-session', '-d', '-s', session, '-x', '250', '-y', '60', launcher);

  const deadline = Date.now() + timeoutMin * 60_000;
  try {
    while (Date.now() < deadline) {
      await sleep(10_000);
      if (existsSync(resultFile)) {
        // give the Write a moment to complete, then validate
        await sleep(2_000);
        const report = JSON.parse(readFileSync(resultFile, 'utf8'));
        if (!Array.isArray(report.findings)) {
          throw new Error(`${resultFile} has no findings array`);
        }
        return { report };
      }
      try {
        tmux('has-session', '-t', session);
      } catch {
        throw new Error('tmux session ended without writing the report');
      }
    }
    throw new Error(`timed out after ${timeoutMin} min`);
  } finally {
    try {
      writeFileSync(logFile, tmux('capture-pane', '-p', '-J', '-S', '-', '-t', session), { flag: 'a' });
      tmux('kill-session', '-t', session);
    } catch {
      // session already gone
    }
  }
}
