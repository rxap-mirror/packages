// Shared helpers for the rxap FigCraft pipeline (capture, build, verify).
//
// The pipeline is a port of the one that generates `angular-components.figcraft` (Angular Material + CDK) in the
// ng-prism styleguides of angular/components (`prism/scripts/figcraft`). That file is linked here as a library:
// rxap.figcraft binds its colours, typography and elevation to the kit's `mat-sys` / `mat-components` variables
// and styles instead of creating its own.
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);
export const TOOL_DIR = path.join(ROOT, 'tools/figcraft');
export const CACHE = path.join(ROOT, 'tmp/figcraft-cache');
export const ANGULAR_DIR = path.join(ROOT, 'packages/angular');
export const LIBRARY_FILE = path.join(ANGULAR_DIR, 'rxap.figcraft');
export const KIT_FILE = path.join(ANGULAR_DIR, 'angular-components.figcraft');
export const KIT_NAME = 'angular-components';
export const DOC_NAME = 'rxap';

export const readJson = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
export const writeJson = (f, v) => {
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, JSON.stringify(v, null, 2) + '\n');
};

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}
export { walk };

/**
 * Every Angular library with an ng-prism styleguide (a `prism-build` target): Nx project name, root, npm package
 * name and the folder its static styleguide build is written to.
 */
export function prismProjects() {
  const out = [];
  for (const file of walk(ANGULAR_DIR)) {
    if (path.basename(file) !== 'project.json') continue;
    const project = readJson(file);
    const target = project.targets?.['prism-build'];
    if (!target) continue;
    const root = path.dirname(file);
    const pkg = readJson(path.join(root, 'package.json'));
    out.push({
      name: project.name,
      root: path.relative(ROOT, root),
      packageName: pkg.name,
      dist: path.join(ROOT, target.options.outputPath),
      material: path.relative(ANGULAR_DIR, root).startsWith('material/'),
    });
  }
  return out.sort((a, b) => a.packageName.localeCompare(b.packageName));
}

/** Serves a static ng-prism build (SPA fallback to index.html) on a free port. */
export function serveStatic(dir) {
  const types = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.woff2': 'font/woff2',
    '.ico': 'image/x-icon',
  };
  const server = http.createServer((req, res) => {
    const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let file = path.join(dir, url);
    if (
      !file.startsWith(dir) ||
      !fs.existsSync(file) ||
      fs.statSync(file).isDirectory()
    )
      file = path.join(dir, 'index.html');
    res.writeHead(200, {
      'content-type': types[path.extname(file)] ?? 'application/octet-stream',
    });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) =>
    server.listen(0, '127.0.0.1', () =>
      resolve({
        url: `http://127.0.0.1:${server.address().port}/`,
        close: () => server.close(),
      }),
    ),
  );
}

/** Launches Playwright's Chromium; falls back to the newest Chromium in the Playwright cache. */
export async function launchChromium() {
  const { chromium } = await import('playwright');
  try {
    return await chromium.launch();
  } catch (error) {
    const cache = path.join(os.homedir(), '.cache/ms-playwright');
    const dirs = fs.existsSync(cache)
      ? fs.readdirSync(cache).filter((d) => /^chromium-\d+$/.test(d))
      : [];
    dirs.sort((a, b) => Number(b.split('-')[1]) - Number(a.split('-')[1]));
    for (const d of dirs) {
      const exe = path.join(cache, d, 'chrome-linux64/chrome');
      if (fs.existsSync(exe)) return chromium.launch({ executablePath: exe });
    }
    throw error;
  }
}

/**
 * Every component and directive with a selector in a project (spec, stories, showcase and prism files left out):
 * {className, kind, selector, source}.
 */
export function selectorClasses(project) {
  const out = [];
  for (const file of walk(path.join(ROOT, project.root))) {
    if (!file.endsWith('.ts') || /\.(spec|stories|showcase)\.ts$/.test(file))
      continue;
    if (/[/\\]prism[/\\]/.test(file)) continue;
    const text = fs.readFileSync(file, 'utf8');
    for (const m of text.matchAll(
      /@(Component|Directive)\(\s*\{[\s\S]*?selector:\s*['"`]([^'"`]+)['"`][\s\S]*?\}\s*\)[\s\S]*?export\s+(?:abstract\s+)?class\s+(\w+)/g,
    ))
      out.push({
        kind: m[1].toLowerCase(),
        selector: m[2].replace(/\s+/g, ' '),
        className: m[3],
        source: path.relative(ROOT, file),
      });
  }
  return out;
}
