/**
 * Default runner: one headless `claude -p` per project. The lead fans out to the review-*
 * subagents (.claude/agents) via the Agent tool and returns schema-validated JSON
 * (`--json-schema` → `structured_output`).
 */

import { spawn } from 'node:child_process';
import { createWriteStream, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const SCHEMA = JSON.stringify(JSON.parse(readFileSync(fileURLToPath(new URL('./schema.json', import.meta.url)), 'utf8')));

export const TEAM_INSTRUCTIONS =
  'Dispatch the five review lenses as subagents **in parallel** (one message, five Agent tool calls, `subagent_type` = the lens name). ' +
  'Wait for all of them, then merge their findings. Verify anything surprising yourself before reporting it.';

export const OUTPUT_INSTRUCTIONS =
  'Return the final report as structured output matching the provided JSON schema. Set `project` to the project name.';

/**
 * @returns {Promise<{report: object, costUsd?: number}>}
 */
export function runPrint({ prompt, cwd, allowedTools, model, budgetUsd, logFile }) {
  const args = [
    '-p',
    '--output-format', 'json',
    '--json-schema', SCHEMA,
    '--permission-mode', 'dontAsk',
    '--allowedTools', allowedTools.join(','),
    '--no-session-persistence',
  ];
  if (model) {
    args.push('--model', model);
  }
  if (budgetUsd) {
    args.push('--max-budget-usd', String(budgetUsd));
  }

  return new Promise((resolve, reject) => {
    const log = createWriteStream(logFile, { flags: 'a' });
    log.write(`$ claude ${args.filter((a) => a !== SCHEMA).join(' ')} <schema>\n\n--- prompt ---\n${prompt}\n--- output ---\n`);
    const child = spawn('claude', args, { cwd, stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '';
    child.stdout.on('data', (d) => {
      stdout += d;
      log.write(d);
    });
    child.stderr.on('data', (d) => log.write(d));
    child.on('error', (e) => {
      log.end();
      reject(e);
    });
    child.on('close', (code) => {
      log.end();
      let result;
      try {
        result = JSON.parse(stdout);
      } catch {
        return reject(new Error(`claude exited with ${code} and no JSON result`));
      }
      if (result.is_error || !result.structured_output) {
        return reject(new Error(`claude failed (${result.subtype ?? `exit ${code}`}): ${String(result.result ?? '').slice(0, 300)}`));
      }
      resolve({ report: result.structured_output, costUsd: result.total_cost_usd });
    });
    child.stdin.end(prompt);
  });
}
