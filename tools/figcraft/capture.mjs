#!/usr/bin/env node
/**
 * Renders every ng-prism showcase variant (and state) of the static styleguide builds in `dist/prism/<project>`
 * and stores, per variant, the layer tree (`serialize-dom.js`), its colours in the dark scheme, the CSS
 * declarations behind its colours and type, and PNGs in light and dark. Output: `tmp/figcraft-cache/<project>/`.
 *
 * Build the styleguides first (one at a time: they share `applications/prism-host`):
 *   yarn nx run <project>:prism-build
 *
 * Usage: node tools/figcraft/capture.mjs [--project a,b] [--only ClassA,ClassB] [--concurrency 4]
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { createRequire } from 'node:module';
import {
  CACHE,
  ROOT,
  TOOL_DIR,
  launchChromium,
  prismProjects,
  readJson,
  serveStatic,
  walk,
  writeJson,
} from './lib.mjs';
import { declarations } from './declared.mjs';

const { values: args } = parseArgs({
  options: {
    project: { type: 'string' },
    only: { type: 'string' },
    concurrency: { type: 'string', default: '4' },
    timeout: { type: 'string', default: '20000' },
  },
});
const ONLY = args.only ? new Set(args.only.split(',')) : null;
const PROJECTS = args.project ? new Set(args.project.split(',')) : null;
const TIMEOUT = Number(args.timeout);
const SERIALIZER = path.join(TOOL_DIR, 'serialize-dom.js');
const OVERRIDES = readJson(path.join(TOOL_DIR, 'overrides.json')).classes;
// Showcases that show today's date (timeago, date cells, changelogs) would change the design file on every run.
const FIXED_TIME = new Date('2026-01-15T10:00:00Z');
const PAGE_OPTIONS = {
  viewport: { width: 1280, height: 900 },
  timezoneId: 'UTC',
  locale: 'en-US',
};
const ts = createRequire(import.meta.url)('typescript');

// ---------------------------------------------------------------------------------------------------------------
// Source index: what the runtime manifest does not expose (selector, source file, templates per variant)

function toJs(n, sf) {
  if (!n) return null;
  if (ts.isStringLiteralLike(n)) return n.text;
  if (ts.isNoSubstitutionTemplateLiteral?.(n)) return n.text;
  if (ts.isTemplateExpression(n)) return n.getText(sf).slice(1, -1);
  if (ts.isNumericLiteral(n)) return Number(n.text);
  if (n.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (n.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (n.kind === ts.SyntaxKind.NullKeyword) return null;
  if (ts.isArrayLiteralExpression(n)) return n.elements.map((e) => toJs(e, sf));
  if (ts.isObjectLiteralExpression(n)) {
    const o = {};
    for (const p of n.properties)
      if (ts.isPropertyAssignment(p))
        o[p.name.getText(sf).replace(/^["']|["']$/g, '')] = toJs(
          p.initializer,
          sf,
        );
    return o;
  }
  if (ts.isPrefixUnaryExpression(n) && ts.isNumericLiteral(n.operand))
    return -Number(n.operand.text);
  if (ts.isAsExpression(n) || ts.isParenthesizedExpression(n))
    return toJs(n.expression, sf);
  return null;
}

/**
 * The sections a class goes into: the secondary entry point folders (if any), then the folders below `src/lib`
 * that hold its own folder.
 */
function sectionPath(projectRoot, file) {
  const rel = path
    .relative(path.join(ROOT, projectRoot), path.dirname(file))
    .split(path.sep);
  const src = rel.indexOf('src');
  if (src < 0) return [];
  const parts = [
    ...rel.slice(0, src),
    ...rel.slice(src + (rel[src + 1] === 'lib' ? 2 : 1)),
  ];
  const base = path.basename(file).split('.')[0];
  if (parts.length > src && parts[parts.length - 1] === base) parts.pop();
  return parts;
}

function sourceIndex(project) {
  const out = {};
  for (const file of walk(path.join(ROOT, project.root))) {
    if (!file.endsWith('.ts') || /\.(spec|stories)\.ts$/.test(file)) continue;
    if (/[/\\](prism|node_modules)[/\\]/.test(file)) continue;
    const text = fs.readFileSync(file, 'utf8');
    if (!text.includes('@Showcase')) continue;
    const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
    sf.forEachChild((node) => {
      if (!ts.isClassDeclaration(node) || !node.name) return;
      const decorators = ts.getDecorators?.(node) ?? node.decorators ?? [];
      const info = {
        className: node.name.text,
        source: path.relative(ROOT, file),
        sections: sectionPath(project.root, file),
      };
      for (const d of decorators) {
        if (!ts.isCallExpression(d.expression)) continue;
        const name = d.expression.expression.getText(sf);
        const arg = d.expression.arguments[0];
        if (name === 'Component' || name === 'Directive') {
          const meta = toJs(arg, sf) ?? {};
          info.kind = name === 'Component' ? 'component' : 'directive';
          info.selector =
            typeof meta.selector === 'string'
              ? meta.selector.replace(/\s+/g, ' ')
              : null;
        } else if (name === 'Showcase') {
          const cfg = toJs(arg, sf) ?? {};
          info.description = cfg.description ?? '';
          info.variants = (cfg.variants ?? []).map((v) => ({
            name: v?.name ?? null,
            description: v?.description ?? null,
            template: v?.host?.template ?? v?.template ?? null,
            inputs: v?.inputs ?? null,
            content: typeof v?.content === 'string' ? v.content : null,
          }));
        }
      }
      if (info.variants) out[info.className] = info;
    });
  }
  return out;
}

/**
 * The template a variant stands for: the showcase's own host template, else the selector with the variant's
 * inputs bound and its content projected (`<rxap-x [label]="'Save'">content</rxap-x>`).
 */
function usage(selector, variant) {
  if (variant?.template) return variant.template.trim();
  const first = (selector ?? '').split(',')[0].trim();
  if (!first) return null;
  const m = /^([a-z][\w-]*)?((?:\[[^\]]+\])*)$/i.exec(first);
  const tag = m?.[1] ?? 'div';
  const attrs = [
    ...(m?.[2] ?? '').matchAll(/\[([^\]=]+)(?:=([^\]]+))?\]/g),
  ].map((a) => (a[2] ? `${a[1]}=${a[2]}` : a[1]));
  for (const [k, v] of Object.entries(variant?.inputs ?? {})) {
    if (v === null || v === undefined) continue;
    const literal =
      typeof v === 'string' ? `'${v.replace(/'/g, "\\'")}'` : JSON.stringify(v);
    attrs.push(`[${k}]="${literal.replace(/"/g, '&quot;')}"`);
  }
  const open = `<${tag}${attrs.length ? ' ' + attrs.join(' ') : ''}>`;
  return `${open}${variant?.content ?? ''}</${tag}>`;
}

// ---------------------------------------------------------------------------------------------------------------
// Rendering

async function settle(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise((r) =>
      requestAnimationFrame(() => requestAnimationFrame(r)),
    );
  });
}

/** Waits until the showcase stops adding or removing content (data loaded after a delay), at most 3 s. */
async function quiet(page, marker) {
  await page.evaluate(
    (m) =>
      new Promise((resolve) => {
        const root = document.querySelector(m);
        if (!root) return resolve();
        let timer;
        const done = () => {
          observer.disconnect();
          clearTimeout(cap);
          resolve();
        };
        const observer = new MutationObserver(() => {
          clearTimeout(timer);
          timer = setTimeout(done, 400);
        });
        observer.observe(root, {
          childList: true,
          subtree: true,
          characterData: true,
        });
        timer = setTimeout(done, 400);
        const cap = setTimeout(done, 3000);
      }),
    marker,
  );
}

async function setScheme(page, scheme) {
  await page.evaluate((s) => {
    // Switch at once: transitions would leave the screenshot halfway between the two schemes.
    const style = document.createElement('style');
    style.textContent =
      '*, *::before, *::after { transition: none !important; animation: none !important; }';
    document.head.appendChild(style);
    document.documentElement.style.colorScheme = s;
  }, scheme);
  await settle(page);
}

/**
 * Opens what the showcase only shows after an interaction (a menu, a select panel, a dialog), as configured in
 * `tools/figcraft/overrides.json` (`open: {action: click|hover|contextmenu|focus, selector}`).
 */
async function openSurface(page, open) {
  await page.addStyleTag({
    content: '.cdk-overlay-backdrop { opacity: 0 !important; }',
  });
  const target = page.locator(`.demo-wrap ${open.selector}`).first();
  if (open.action === 'hover') await target.hover({ force: true });
  else if (open.action === 'focus') await target.focus();
  else if (open.action === 'contextmenu')
    await target.click({ button: 'right', force: true });
  else await target.click({ force: true });
  await page
    .waitForFunction(
      () =>
        [
          ...document.querySelectorAll(
            '.cdk-overlay-container .cdk-overlay-pane, .demo-wrap :popover-open > .cdk-overlay-pane',
          ),
        ].some(
          (p) => p.childElementCount && p.getBoundingClientRect().height > 0,
        ),
      undefined,
      { timeout: 3000 },
    )
    .catch(() => {
      throw new Error(
        `open: no overlay after ${open.action} on ${open.selector}`,
      );
    });
  await page
    .waitForFunction(
      () =>
        document
          .getAnimations()
          .every(
            (a) =>
              a.playState !== 'running' ||
              a.effect?.getComputedTiming().iterations === Infinity,
          ),
      undefined,
      { timeout: 3000, polling: 50 },
    )
    .catch(() => {});
  await page.waitForTimeout(100);
  await settle(page);
}

/** Renders one URL and stores its layer tree, dark colours and PNGs. */
async function captureOne(
  page,
  url,
  marker,
  outBase,
  open = null,
  viewport = null,
) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: TIMEOUT });
  await page.waitForSelector(marker, { state: 'attached', timeout: TIMEOUT });
  const excluded = await page.getAttribute(marker, 'data-prism-excluded');
  if (excluded !== null) return { excluded };
  await quiet(page, marker);
  // Content larger than the window would be cut: grow the window until nothing sticks out. Full-screen layouts
  // (`viewport` in overrides.json) are drawn at a fixed screen size instead: they always fill the window.
  for (let round = 0; round < (viewport ? 0 : 4); round++) {
    const extent = await page.evaluate(() => {
      let left = 0,
        top = 0,
        right = 0,
        bottom = 0;
      for (const e of document.querySelectorAll('.demo-wrap *')) {
        const r = e.getBoundingClientRect();
        if (r.width > 1 && r.height > 1) {
          left = Math.min(left, r.left);
          top = Math.min(top, r.top);
          right = Math.max(right, r.right);
          bottom = Math.max(bottom, r.bottom);
        }
      }
      return { left, top, right, bottom };
    });
    const vp = page.viewportSize();
    const over = (lo, hi, size) => Math.max(0, -lo, hi - size);
    const dx = over(0, extent.right, vp.width);
    const dy = over(extent.top, extent.bottom, vp.height);
    if (!dx && !dy) break;
    const grow = (size, d) =>
      d ? Math.min(4000, Math.ceil(size + 2 * d) + 40) : size;
    const width = grow(vp.width, dx),
      height = grow(vp.height, dy);
    if (width === vp.width && height === vp.height) break;
    await page.setViewportSize({ width, height });
    await settle(page);
  }
  // The application baseline `ng add @angular/material` writes for body, instead of the styleguide shell's own
  // text colour and font, which would otherwise leak into every component as literals.
  await page.addStyleTag({
    content: `:root .demo-wrap[data-prism-rendered] { color: var(--mat-sys-on-surface); font: var(--mat-sys-body-medium); }`,
  });
  // A full-screen layout sizes itself to the window (100vw/100vh): the stage, which ng-prism places next to its
  // navigation, takes the whole window, so the layout is seen as in an app.
  if (viewport)
    await page.addStyleTag({
      content: `:root .demo-wrap[data-prism-rendered] { position: fixed !important; inset: 0 !important; z-index: 10000; margin: 0 !important; padding: 0 !important; background: var(--mat-sys-surface); }`,
    });
  await page.waitForTimeout(150);
  await settle(page);
  if (open) await openSurface(page, open);
  await page.addScriptTag({ path: SERIALIZER });
  const result = await page.evaluate((overlayOnly) => {
    const wrap = document.querySelector('.demo-wrap');
    const roots = overlayOnly ? [] : [...wrap.children];
    const panes = [
      ...document.querySelectorAll(
        '.cdk-overlay-container .cdk-overlay-pane, .demo-wrap :popover-open > .cdk-overlay-pane',
      ),
    ].filter((p) => p.childElementCount);
    const tree = window.__fcSerialize([...roots, ...panes]);
    const box = tree.box;
    delete tree.box;
    return { tree, box, hasOverlay: panes.length > 0 };
  }, !!open?.overlayOnly);
  if (!result.box || !result.tree.width) return { empty: true };
  await saveImages(page, result.tree);
  const clip = {
    x: result.box.x,
    y: result.box.y,
    width: Math.max(1, result.box.width),
    height: Math.max(1, result.box.height),
  };
  const decl = await declarations(page);
  await page.evaluate(() => window.__fcRestore());
  await settle(page);
  await page.screenshot({
    path: `${outBase}.light.png`,
    clip,
    omitBackground: true,
  });
  await setScheme(page, 'dark');
  const dark = await page.evaluate(() => window.__fcColors());
  await page.screenshot({
    path: `${outBase}.dark.png`,
    clip,
    omitBackground: true,
  });
  return { tree: result.tree, dark, decl, hasOverlay: result.hasOverlay };
}

/** Stores the bytes of every <img> layer in `tmp/figcraft-cache/images/<sha1>.<ext>` and links the layer to it. */
async function saveImages(page, tree) {
  const imgs = [];
  const walkTree = (n) => {
    if (n.type === 'image' && n.src) imgs.push(n);
    if (n.bgImage?.src) imgs.push(n.bgImage);
    (n.children ?? []).forEach(walkTree);
  };
  tree.children.forEach(walkTree);
  for (const img of imgs) {
    try {
      let body, type;
      if (img.src.startsWith('data:')) {
        const m = /^data:([^;,]+)((?:;[^;,]*)*),(.*)$/s.exec(img.src);
        type = m[1];
        body = /;base64/.test(m[2])
          ? Buffer.from(m[3], 'base64')
          : Buffer.from(decodeURIComponent(m[3]));
      } else {
        const res = await page.request.get(img.src, { timeout: TIMEOUT });
        if (!res.ok()) continue;
        body = await res.body();
        type = res.headers()['content-type'] ?? '';
      }
      const ext = /svg/.test(type)
        ? 'svg'
        : /png/.test(type)
          ? 'png'
          : /webp/.test(type)
            ? 'webp'
            : /gif/.test(type)
              ? 'gif'
              : 'jpg';
      const file = `${crypto.createHash('sha1').update(body).digest('hex')}.${ext}`;
      const dest = path.join(CACHE, 'images', file);
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.writeFileSync(dest, body);
      }
      img.file = file;
    } catch {
      // Unreachable image: the builder draws a placeholder.
    }
  }
}

async function captureProject(browser, project) {
  if (!fs.existsSync(path.join(project.dist, 'index.html'))) {
    console.warn(
      `[figcraft-capture] ${project.name}: no build in ${path.relative(ROOT, project.dist)}; run yarn nx run ${project.name}:prism-build`,
    );
    return 1;
  }
  const server = await serveStatic(project.dist);
  const sources = sourceIndex(project);
  const outDir = path.join(CACHE, project.name);
  const errors = [];

  const page = await browser.newPage({
    viewport: { width: 1280, height: 900 },
  });
  page.on('pageerror', (e) => errors.push(`(boot) ${e.message}`));
  await page.goto(server.url, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => globalThis.__PRISM_MANIFEST__, undefined, {
    timeout: TIMEOUT,
  });
  const manifest = await page.evaluate(() => globalThis.__PRISM_MANIFEST__);
  await page.addScriptTag({ path: SERIALIZER });
  const tokens = { light: await page.evaluate(() => window.__fcTokens()) };
  await setScheme(page, 'dark');
  tokens.dark = await page.evaluate(() => window.__fcTokens());
  await page.close();
  writeJson(path.join(CACHE, `tokens.${project.name}.json`), tokens);

  const jobs = [];
  const entries = [];
  for (const c of manifest.components) {
    const info = sources[c.className];
    if (!info) {
      // A class of another library whose providers the shared prism-host merges in.
      continue;
    }
    const entry = {
      className: c.className,
      title: c.title,
      kind: info.kind ?? 'component',
      selector: info.selector ?? null,
      source: info.source,
      sections: info.sections,
      description: info.description ?? '',
      parts: (c.parts ?? []).map((p) => ({
        className: p.className,
        selector: p.selector,
      })),
      states: (c.states ?? []).map((s) => s.name),
      variants: c.variants.map((v) => ({
        index: v.index,
        name: v.name,
        description: info.variants?.[v.index]?.description ?? null,
        template: usage(info.selector, info.variants?.[v.index]),
        inputs: info.variants?.[v.index]?.inputs ?? null,
      })),
      captures: [],
    };
    entries.push(entry);
    const open = OVERRIDES[c.className]?.open ?? null;
    if (open) entry.states.push('open');
    if (ONLY && !ONLY.has(c.className)) continue;
    if (OVERRIDES[c.className]?.skip) continue;
    for (const v of c.variants) {
      for (const s of [undefined, ...(c.states ?? []).map((x) => x.index)])
        jobs.push({ entry, variant: v.index, state: s, open: null });
      const only = open?.variants;
      if (open && (!only || only.includes(v.index)))
        jobs.push({
          entry,
          variant: v.index,
          state: entry.states.length - 1,
          open,
        });
    }
  }

  let done = 0;
  const workers = Array.from({ length: Number(args.concurrency) }, async () => {
    const newPage = async () => {
      const pg = await browser.newPage(PAGE_OPTIONS);
      await pg.clock.setFixedTime(FIXED_TIME);
      pg.on('pageerror', (e) => errors.push(`${pg.url()}: ${e.message}`));
      return pg;
    };
    let p = await newPage();
    while (jobs.length) {
      if (p.isClosed()) p = await newPage();
      const { entry, variant, state, open } = jobs.shift();
      // The opened surface is an extra state after the showcase's own ones (key `<v>-open`).
      const prismState = open ? undefined : state;
      const key = `${variant}${state === undefined ? '' : open ? '-open' : `-s${state}`}`;
      const url = `${server.url}?component=${entry.className}&variant=${variant}${prismState === undefined ? '' : `&state=${prismState}`}&capture=1`;
      const marker = `.demo-wrap[data-prism-rendered="${entry.className}:${variant}${prismState === undefined ? '' : `:${prismState}`}"]`;
      const base = path.join(outDir, entry.className, key);
      fs.mkdirSync(path.dirname(base), { recursive: true });
      try {
        const viewport = OVERRIDES[entry.className]?.viewport ?? null;
        await p.setViewportSize(viewport ?? { width: 1280, height: 900 });
        const res = await captureOne(p, url, marker, base, open, viewport);
        const rec = { key, variant, state: state ?? null };
        if (res.excluded) rec.excluded = res.excluded;
        else if (res.empty) rec.empty = true;
        else {
          writeJson(`${base}.json`, {
            tree: res.tree,
            dark: res.dark,
            decl: res.decl,
          });
          rec.width = res.tree.width;
          rec.height = res.tree.height;
          if (res.hasOverlay) rec.overlay = true;
        }
        entry.captures.push(rec);
      } catch (e) {
        errors.push(
          `${entry.className} ${key}: ${String(e.message).split('\n')[0]}`,
        );
        entry.captures.push({
          key,
          variant,
          state: state ?? null,
          error: String(e.message).split('\n')[0],
        });
      }
      if (++done % 25 === 0)
        console.log(`[figcraft-capture] ${project.name}: ${done} captured`);
    }
    if (!p.isClosed()) await p.close();
  });
  await Promise.all(workers);
  server.close();

  const indexFile = path.join(outDir, 'index.json');
  if (ONLY && fs.existsSync(indexFile)) {
    const prev = new Map(
      readJson(indexFile).entries.map((e) => [e.className, e]),
    );
    for (const e of entries)
      if (!ONLY.has(e.className) && prev.has(e.className))
        e.captures = prev.get(e.className).captures;
  }
  for (const e of entries)
    e.captures.sort(
      (a, b) => a.variant - b.variant || (a.state ?? -1) - (b.state ?? -1),
    );
  writeJson(indexFile, {
    project: project.name,
    packageName: project.packageName,
    root: project.root,
    capturedAt: new Date().toISOString(),
    entries,
  });
  const n = entries.reduce((s, e) => s + e.captures.length, 0);
  console.log(
    `[figcraft-capture] ${project.name}: ${entries.length} classes, ${n} captures, ${errors.length} errors`,
  );
  for (const e of errors)
    console.warn(`[figcraft-capture] ${project.name} ERROR ${e}`);
  return errors.length;
}

const browser = await launchChromium();
let failed = 0;
try {
  for (const project of prismProjects())
    if (!PROJECTS || PROJECTS.has(project.name))
      failed += await captureProject(browser, project);
} finally {
  await browser.close();
}
process.exit(failed ? 2 : 0);
