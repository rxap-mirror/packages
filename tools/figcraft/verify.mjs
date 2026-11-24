#!/usr/bin/env node
/**
 * Verifies `packages/angular/rxap.figcraft` against the code and the ng-prism capture:
 *
 *  1. coverage   every component and directive with a selector in a library with a styleguide has a component
 *                set on its library's page, every captured variant x state is a variant of it. Classes without a
 *                showcase are listed (`uncovered`): they need an `@Showcase` before they can be drawn.
 *  2. visual     every variant rendered by FigCraft (Light and Dark mode of the kit's `mat-sys`) against the
 *                browser's PNG; the share of differing pixels must stay below `maxDiff` (overrides.json).
 *  3. layout     sections of a page don't overlap and their children stay inside.
 *
 * Writes `tmp/figcraft-cache/verify/report.{json,md}`. Exit 0 ok, 1 error, 2 findings.
 *
 * Usage: node tools/figcraft/verify.mjs [--file x.figcraft] [--skip-visual] [--project a,b]
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { parseArgs } from 'node:util';
import {
  CACHE,
  KIT_NAME,
  LIBRARY_FILE,
  ROOT,
  TOOL_DIR,
  launchChromium,
  prismProjects,
  readJson,
  selectorClasses,
  writeJson,
} from './lib.mjs';

const { values: args } = parseArgs({
  options: {
    file: { type: 'string' },
    project: { type: 'string' },
    'skip-visual': { type: 'boolean', default: false },
  },
});
const FILE = path.resolve(args.file ?? LIBRARY_FILE);
const PROJECTS = args.project ? new Set(args.project.split(',')) : null;
const OUT = path.join(CACHE, 'verify');
const overrides = readJson(path.join(TOOL_DIR, 'overrides.json'));
const MAX_DIFF = overrides.defaults?.maxDiff ?? 0.1;
const findings = [];
const finding = (check, item, message) =>
  findings.push({ check, item, message });

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rxap-figcraft-verify-'));
execFileSync('unzip', ['-q', FILE, 'document.json', '-d', tmpDir]);
const doc = readJson(path.join(tmpDir, 'document.json'));
const N = doc.nodes;
const pageOf = (id) => {
  let n = N[id];
  while (n && n.type !== 'page') n = N[n.parent];
  return n;
};
const byKey = new Map();
for (const n of Object.values(N))
  if (n.plugin_data?.prismKey) byKey.set(n.plugin_data.prismKey, n);

const projects = prismProjects().filter(
  (p) => !PROJECTS || PROJECTS.has(p.name),
);

// ---------------------------------------------------------------------------------------------------------------
// 1. Coverage

const uncovered = [];
const empty = [];
const counts = { sets: 0, variants: 0, classes: 0 };
const visualItems = [];
for (const project of projects) {
  const indexFile = path.join(CACHE, project.name, 'index.json');
  const index = fs.existsSync(indexFile)
    ? readJson(indexFile)
    : { entries: [] };
  const captured = new Map(index.entries.map((e) => [e.className, e]));
  for (const { kind, selector, className, source } of selectorClasses(
    project,
  )) {
    counts.classes++;
    const entry = captured.get(className);
    const skip = overrides.classes[className]?.skip;
    if (!entry) {
      uncovered.push({
        project: project.packageName,
        className,
        kind,
        selector,
        source,
        reason: skip ?? 'no @Showcase',
      });
      continue;
    }
    if (skip) continue;
    const set = byKey.get(`${project.name}/${className}`);
    if (!set) {
      if (entry.captures.some((c) => !c.error && !c.empty && !c.excluded))
        finding(
          'coverage',
          `${project.packageName} ${className}`,
          'no component set',
        );
      else if (entry.captures.some((c) => c.error))
        finding(
          'coverage',
          `${project.packageName} ${className}`,
          `nothing captured (${entry.captures.map((c) => c.error ?? (c.empty ? 'empty' : c.excluded)).join('; ')})`,
        );
      else
        empty.push(
          `${project.packageName} ${className}: every variant renders nothing`,
        );
      continue;
    }
    counts.sets++;
    if (pageOf(set.id)?.name !== project.packageName)
      finding(
        'coverage',
        className,
        `on page "${pageOf(set.id)?.name}", not "${project.packageName}"`,
      );
    const want = selector.split(',')[0].trim();
    if (!set.name.startsWith(want))
      finding(
        'coverage',
        className,
        `component set named "${set.name}", not "${want}"`,
      );
    for (const c of entry.captures) {
      if (c.empty || c.excluded) {
        // A variant that renders nothing (an empty cell, a hidden state) has nothing to draw.
        empty.push(
          `${project.packageName} ${className} ${c.key}: ${c.empty ? 'renders nothing' : c.excluded}`,
        );
        continue;
      }
      if (c.error) {
        finding('coverage', `${className} ${c.key}`, c.error);
        continue;
      }
      const key = `${project.name}/${className}/${c.key}`;
      const v = byKey.get(key);
      if (!v) {
        finding('coverage', key, 'variant missing');
        continue;
      }
      counts.variants++;
      visualItems.push({
        key,
        id: v.id,
        project: project.name,
        className,
        capKey: c.key,
      });
    }
  }
}

// ---------------------------------------------------------------------------------------------------------------
// 3. Layout

const box = (n) => ({
  x: n.transform?.[4] ?? 0,
  y: n.transform?.[5] ?? 0,
  w: n.width,
  h: n.height,
});
for (const pageId of doc.pages) {
  const page = N[pageId];
  const top = (page.children ?? []).map((id) => N[id]);
  for (let i = 0; i < top.length; i++)
    for (let j = i + 1; j < top.length; j++) {
      const a = box(top[i]),
        b = box(top[j]);
      if (
        a.x < b.x + b.w &&
        b.x < a.x + a.w &&
        a.y < b.y + b.h &&
        b.y < a.y + a.h
      )
        finding(
          'layout',
          page.name,
          `"${top[i].name}" overlaps "${top[j].name}"`,
        );
    }
  const inside = (n) => {
    for (const id of n.children ?? []) {
      const c = N[id];
      const b = box(c);
      if (
        b.x < 0 ||
        b.y < 0 ||
        b.x + b.w > n.width + 0.5 ||
        b.y + b.h > n.height + 0.5
      )
        finding(
          'layout',
          `${page.name} / ${n.name}`,
          `"${c.name}" sticks out of its section`,
        );
      if (c.type === 'section') inside(c);
    }
  };
  top.filter((n) => n.type === 'section').forEach(inside);
}

// ---------------------------------------------------------------------------------------------------------------
// 2. Visual comparison

function exportAll(mode) {
  const dir = path.join(OUT, mode);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const steps = [];
  for (const pageId of doc.pages) {
    if (N[pageId].name.startsWith('-')) continue;
    steps.push({ command: 'page.select', params: { id: pageId } });
    steps.push({
      command: 'library.setVariableMode',
      params: {
        library: KIT_NAME,
        collection: 'mat-sys',
        mode: mode === 'dark' ? 'Dark' : 'Light',
      },
    });
  }
  steps.push({
    command: 'command.batch',
    params: {
      onError: 'continue',
      commands: visualItems.map((it) => ({
        command: 'file.export',
        params: {
          ids: [it.id],
          format: 'png',
          includeBoundingBox: true,
          path: path.join(dir, `${it.key.replace(/\//g, '__')}.png`),
        },
      })),
    },
  });
  const script = path.join(OUT, `export-${mode}.json`);
  fs.writeFileSync(script, JSON.stringify(steps));
  execFileSync('figcraft-cli', ['run', script, '--in', FILE], {
    encoding: 'utf8',
    maxBuffer: 1 << 28,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  return dir;
}

/**
 * Share of differing pixels of two PNGs, both flattened on the mode's surface colour, compared in Chromium (a
 * YIQ colour distance like pixelmatch's, threshold 0.15; antialiased edges are not excused, so the number is a
 * little stricter). Writes a diff image (differing pixels red).
 */
async function differ() {
  const browser = await launchChromium();
  const page = await browser.newPage();
  await page.setContent('<canvas></canvas>');
  return {
    async diff(aFile, bFile, outFile, bg) {
      const res = await page.evaluate(
        async ({ a, b, bg }) => {
          const load = (src) =>
            new Promise((ok, ko) => {
              const i = new Image();
              i.onload = () => ok(i);
              i.onerror = ko;
              i.src = src;
            });
          const [ia, ib] = await Promise.all([load(a), load(b)]);
          const w = Math.min(ia.width, ib.width),
            h = Math.min(ia.height, ib.height);
          const pixels = (img) => {
            const c = new OffscreenCanvas(w, h);
            const x = c.getContext('2d');
            x.fillStyle = bg;
            x.fillRect(0, 0, w, h);
            x.drawImage(img, 0, 0);
            return x.getImageData(0, 0, w, h).data;
          };
          const pa = pixels(ia),
            pb = pixels(ib);
          const out = new OffscreenCanvas(w, h);
          const ox = out.getContext('2d');
          const od = ox.createImageData(w, h);
          const yiq = (r, g, b2) => [
            r * 0.29889531 + g * 0.58662247 + b2 * 0.11448223,
            r * 0.59597799 - g * 0.2741761 - b2 * 0.32180189,
            r * 0.21147017 - g * 0.52261711 + b2 * 0.31114694,
          ];
          const maxDelta = 35215 * 0.15 * 0.15;
          const delta = (p, i, q, j) => {
            const [y1, i1, q1] = yiq(p[i], p[i + 1], p[i + 2]);
            const [y2, i2, q2] = yiq(q[j], q[j + 1], q[j + 2]);
            return (
              0.5053 * (y1 - y2) ** 2 +
              0.299 * (i1 - i2) ** 2 +
              0.1957 * (q1 - q2) ** 2
            );
          };
          // Text and edges land up to a pixel apart (glyph positioning differs between Chrome and FigCraft): a
          // pixel only differs when no pixel of the other image within one pixel matches it.
          const near = (p, q, x, y) => {
            for (let dy = -1; dy <= 1; dy++)
              for (let dx = -1; dx <= 1; dx++) {
                const xx = x + dx,
                  yy = y + dy;
                if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
                if (delta(p, (y * w + x) * 4, q, (yy * w + xx) * 4) <= maxDelta)
                  return true;
              }
            return false;
          };
          let n = 0;
          for (let i = 0; i < pa.length; i += 4) {
            const x = (i / 4) % w,
              y = Math.floor(i / 4 / w);
            const g = (pa[i] + pa[i + 1] + pa[i + 2]) / 3;
            if (
              delta(pa, i, pb, i) > maxDelta &&
              (!near(pa, pb, x, y) || !near(pb, pa, x, y))
            ) {
              n++;
              od.data.set([255, 0, 0, 255], i);
            } else od.data.set([g, g, g, 64], i);
          }
          ox.putImageData(od, 0, 0);
          const blob = await out.convertToBlob({ type: 'image/png' });
          const buf = new Uint8Array(await blob.arrayBuffer());
          let s = '';
          for (const x of buf) s += String.fromCharCode(x);
          return {
            n,
            w,
            h,
            sizeDelta: Math.max(
              Math.abs(ia.width - ib.width),
              Math.abs(ia.height - ib.height),
            ),
            png: btoa(s),
          };
        },
        {
          a: `data:image/png;base64,${fs.readFileSync(aFile).toString('base64')}`,
          b: `data:image/png;base64,${fs.readFileSync(bFile).toString('base64')}`,
          bg,
        },
      );
      fs.writeFileSync(outFile, Buffer.from(res.png, 'base64'));
      return {
        ratio: res.n / Math.max(1, res.w * res.h),
        pixels: res.n,
        sizeDelta: res.sizeDelta,
      };
    },
    close: () => browser.close(),
  };
}

const visual = [];
if (!args['skip-visual'] && visualItems.length) {
  const theme = readJson(path.join(CACHE, `tokens.${projects[0].name}.json`));
  const css = (c) => `rgb(${c.r}, ${c.g}, ${c.b})`;
  const surface = {
    light: css(theme.light.colors.surface),
    dark: css(theme.dark.colors.surface),
  };
  const d = await differ();
  try {
    for (const mode of ['light', 'dark']) {
      const dir = exportAll(mode);
      for (const it of visualItems) {
        const got = path.join(dir, `${it.key.replace(/\//g, '__')}.png`);
        const want = path.join(
          CACHE,
          it.project,
          it.className,
          `${it.capKey}.${mode}.png`,
        );
        if (!fs.existsSync(got) || !fs.existsSync(want)) {
          finding('visual', `${it.key} (${mode})`, 'no render to compare');
          continue;
        }
        const r = await d.diff(
          got,
          want,
          got.replace(/\.png$/, '.diff.png'),
          surface[mode],
        );
        const max = overrides.classes[it.className]?.maxDiff ?? MAX_DIFF;
        visual.push({
          key: it.key,
          mode,
          ratio: r.ratio,
          sizeDelta: r.sizeDelta,
          max,
        });
        // Small renders (a short label) reach a high share with a few pixels of glyph drift.
        const minPixels =
          overrides.classes[it.className]?.minPixels ??
          overrides.defaults?.minPixels ??
          0;
        if (r.ratio > max && r.pixels > minPixels)
          finding(
            'visual',
            `${it.key} (${mode})`,
            `${(r.ratio * 100).toFixed(1)} % of the pixels differ (allowed ${(max * 100).toFixed(1)} %)`,
          );
        if (r.sizeDelta > 2)
          finding(
            'visual',
            `${it.key} (${mode})`,
            `size differs by ${r.sizeDelta} px`,
          );
      }
    }
  } finally {
    await d.close();
  }
}

// ---------------------------------------------------------------------------------------------------------------
// Report

const report = {
  file: path.relative(ROOT, FILE),
  counts,
  findings,
  uncovered,
  empty,
  visual,
};
writeJson(path.join(OUT, 'report.json'), report);
const byCheck = (c) => findings.filter((f) => f.check === c);
const worst = [...visual].sort((a, b) => b.ratio - a.ratio).slice(0, 20);
const median = visual.length
  ? visual.map((v) => v.ratio).sort((a, b) => a - b)[visual.length >> 1]
  : 0;
const md = [
  '# rxap.figcraft verification',
  '',
  `File: \`${report.file}\` · ${counts.classes} components and directives with a selector, ${counts.sets} component sets, ${counts.variants} variants, ${uncovered.length} without a showcase`,
  '',
  '| Check | Findings |',
  '|---|---|',
  ...['coverage', 'visual', 'layout'].map(
    (c) => `| ${c} | ${byCheck(c).length} |`,
  ),
  '',
  visual.length
    ? `Visual: median ${(median * 100).toFixed(2)} % differing pixels; worst:`
    : 'Visual: skipped.',
  '',
  ...worst.map(
    (v) => `- ${v.key} (${v.mode}): ${(v.ratio * 100).toFixed(2)} %`,
  ),
  '',
  '## Findings',
  '',
  ...(findings.length
    ? findings.map((f) => `- **${f.check}** \`${f.item}\`: ${f.message}`)
    : ['None.']),
  '',
  '## Variants that render nothing',
  '',
  ...(empty.length ? empty.map((e) => `- ${e}`) : ['None.']),
  '',
  '## Not in the design (no showcase)',
  '',
  ...(uncovered.length
    ? uncovered.map(
        (u) =>
          `- ${u.project} \`${u.selector}\` (${u.className}, ${u.kind}): ${u.reason}`,
      )
    : ['None.']),
  '',
].join('\n');
fs.writeFileSync(path.join(OUT, 'report.md'), md);
console.log(md.split('## Findings')[0].trim());
console.log(
  `\n[figcraft-verify] ${findings.length} finding(s), ${uncovered.length} uncovered; report: ${path.relative(ROOT, path.join(OUT, 'report.md'))}`,
);
fs.rmSync(tmpDir, { recursive: true, force: true });
process.exit(findings.length ? 2 : 0);
