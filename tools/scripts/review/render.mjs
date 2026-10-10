/**
 * Renders the per-project review JSON into Markdown, and the run index.
 */

export const SEVERITIES = ['critical', 'high', 'medium', 'low', 'info'];

const SEVERITY_ICON = { critical: '🟥', high: '🟧', medium: '🟨', low: '🟦', info: '⬜' };
const CHECK_ICON = { pass: '✅', fail: '❌', skipped: '⏭️', 'n/a': '–' };

// the npm:* tags mirror the package.json keywords and only add noise
const displayTags = (tags) => tags.filter((t) => !t.startsWith('npm:'));

const escapeCell = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');

function location(f) {
  return f.line ? `${f.file}:${f.line}` : f.file;
}

function renderFinding(f) {
  const lines = [`#### <a id="${f.id}"></a>${SEVERITY_ICON[f.severity]} \`${f.id}\` ${f.title}`, ''];
  const meta = [`**Severity:** ${f.severity}`, `**Category:** ${f.category}`, `**Location:** \`${location(f)}\``];
  if (f.origin === 'dependency' && f.dependency) {
    const upstream = f.upstreamFindingId
      ? ` ([${f.upstreamFindingId}](${f.dependency}.md#${f.upstreamFindingId}))`
      : '';
    meta.push(`**From:** [${f.dependency}](${f.dependency}.md)${upstream}`);
  }
  lines.push(meta.join(' · '), '', f.detail, '');
  if (f.evidence) {
    lines.push('<details><summary>Evidence</summary>', '', '```', f.evidence.trim(), '```', '', '</details>', '');
  }
  if (f.suggestedFix) {
    lines.push(`**Suggested fix:** ${f.suggestedFix}`, '');
  }
  if (f.testAdded) {
    lines.push(`**Reproducing test:** \`${f.testAdded}\``, '');
  }
  return lines.join('\n');
}

function renderGroup(title, findings) {
  const out = [`## ${title} (${findings.length})`, ''];
  if (!findings.length) {
    out.push('_None._', '');
    return out.join('\n');
  }
  for (const severity of SEVERITIES) {
    const group = findings.filter((f) => f.severity === severity);
    if (group.length) {
      out.push(`### ${severity} (${group.length})`, '', ...group.map(renderFinding));
    }
  }
  return out.join('\n');
}

function renderPrevious(previous) {
  if (!previous?.length) {
    return '';
  }
  const by = (status) => previous.filter((p) => p.status === status);
  const out = [
    '## Since the last review',
    '',
    `${by('fixed').length} fixed · ${by('obsolete').length} obsolete · ${by('open').length} still open (listed again below under the same id)`,
    '',
  ];
  for (const status of ['fixed', 'obsolete']) {
    for (const p of by(status)) {
      out.push(`- ${status === 'fixed' ? '✅' : '🗑️'} \`${p.id}\` ${status}${p.note ? `: ${p.note}` : ''}`);
    }
  }
  out.push('');
  return out.join('\n');
}

/**
 * @param {object} report  structured output (schema.json)
 * @param {{name: string, root: string, tags: string[]}} project
 * @param {{level: number, deps: string[], costUsd?: number, warnings?: string[]}} meta
 */
export function renderProject(report, project, meta) {
  const findings = report.findings ?? [];
  const checks = Object.entries(report.checks ?? {})
    .map(([k, v]) => `${k} ${CHECK_ICON[v.status] ?? v.status}${v.notes ? ` (${escapeCell(v.notes)})` : ''}`)
    .join(' · ');
  const out = [
    `# ${project.name}`,
    '',
    `- **Root:** \`${project.root}\``,
    `- **Tags:** ${displayTags(project.tags).map((t) => `\`${t}\``).join(', ') || '–'}`,
    `- **Level:** ${meta.level}`,
    `- **Dependencies:** ${meta.deps.map((d) => `[${d}](${d}.md)`).join(', ') || '–'}`,
    `- **Checks:** ${checks || '–'}`,
  ];
  if (meta.costUsd !== undefined) {
    out.push(`- **Cost:** $${meta.costUsd.toFixed(2)}`);
  }
  out.push('');
  for (const w of meta.warnings ?? []) {
    out.push(`> ⚠️ ${w}`, '');
  }
  out.push('## Summary', '', report.summary, '');
  out.push(renderPrevious(report.previousFindings));
  out.push(renderGroup('Internal issues', findings.filter((f) => f.origin !== 'dependency')));
  out.push(renderGroup('Issues from dependencies', findings.filter((f) => f.origin === 'dependency')));
  return out.join('\n');
}

/**
 * @param {{name: string, level: number, tags: string[], report?: object, error?: string, skipped?: boolean}[]} rows
 */
export function renderIndex(rows, { args, startedAt }) {
  const out = [
    '# Package review',
    '',
    `- **Started:** ${startedAt}`,
    `- **Command:** \`tools/scripts/review.sh ${args.join(' ')}\``,
    `- **Projects:** ${rows.length}`,
    '',
    `| Level | Project | Tags | ${SEVERITIES.join(' | ')} | Internal | From deps | Checks |`,
    `|---|---|---|${SEVERITIES.map(() => '---').join('|')}|---|---|---|`,
  ];
  const totals = Object.fromEntries(SEVERITIES.map((s) => [s, 0]));
  for (const row of rows) {
    if (!row.report) {
      out.push(`| ${row.level} | ${row.name} | ${displayTags(row.tags).join(', ')} | ${SEVERITIES.map(() => '').join(' | ')} | | | ${row.notStarted ? '⏸️ not started' : '❌ failed'} |`);
      continue;
    }
    const findings = row.report.findings ?? [];
    const counts = SEVERITIES.map((s) => {
      const n = findings.filter((f) => f.severity === s).length;
      totals[s] += n;
      return n || '';
    });
    const internal = findings.filter((f) => f.origin !== 'dependency').length;
    const checks = Object.entries(row.report.checks ?? {})
      .map(([k, v]) => `${k} ${CHECK_ICON[v.status] ?? v.status}`)
      .join(' ');
    out.push(
      `| ${row.level} | [${row.name}](${row.name}.md)${row.report._meta?.reusedFrom ? ' ♻' : ''} | ${escapeCell(displayTags(row.tags).join(', '))} | ${counts.join(' | ')} | ${internal} | ${findings.length - internal} | ${checks} |`,
    );
  }
  out.push(`| | **Total** | | ${SEVERITIES.map((s) => `**${totals[s]}**`).join(' | ')} | | | |`, '');
  if (rows.some((r) => r.report?._meta?.reusedFrom)) {
    out.push('♻ = unchanged since an earlier run, report reused (`--incremental`).', '');
  }
  const notStarted = rows.filter((r) => !r.report && r.notStarted);
  if (notStarted.length) {
    out.push('## Not started (run budget reached)', '', `${notStarted.map((r) => r.name).join(', ')}`, '', 'Continue with `--resume <this run directory>`.', '');
  }
  const failed = rows.filter((r) => !r.report && !r.notStarted);
  if (failed.length) {
    out.push('## Failed runs', '');
    for (const r of failed) {
      out.push(`- **${r.name}**: ${escapeCell(r.error)} (see \`logs/${r.name}.log\`)`);
    }
    out.push('');
  }
  return out.join('\n');
}
