#!/usr/bin/env node
/**
 * Builds `packages/angular/rxap.figcraft` from the capture in `tmp/figcraft-cache` (capture.mjs).
 *
 * - Links `packages/angular/angular-components.figcraft` (Angular Material + CDK) as a library. Every colour,
 *   radius, typography and elevation value is bound to the kit's `mat-sys` / `mat-components` variables and
 *   `mat-sys-*` styles, using the token the CSS declares, checked against what the browser rendered in light and
 *   dark. Values without a kit token stay literal (`build-report.json` lists them per class).
 * - One page per Angular library (named like its npm package), divided into `- Angular` and `- Material`.
 * - On each page one section per folder below `src/lib` (nested like the folders); classes directly in
 *   `src/lib` go into a section named like the library folder.
 * - One component set per showcased component or directive, named like its Angular selector (the first one of
 *   the selector list; the description lists all of them). Its variants are the ng-prism showcase variants
 *   (`variant=…`) times the showcase states (`state=default|Hover|…`); each variant's description is the template
 *   it renders. A dev resource links the source file on GitLab.
 *
 * Usage: node tools/figcraft/build.mjs [--project a,b] [--only ClassA,ClassB] [--out file.figcraft] [--keep-scripts]
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import {
  CACHE,
  DOC_NAME,
  KIT_FILE,
  KIT_NAME,
  LIBRARY_FILE,
  ROOT,
  TOOL_DIR,
  prismProjects,
  selectorClasses,
  readJson,
  writeJson,
} from './lib.mjs';
import { keepIds } from './keep-ids.mjs';
import { tokenCatalog } from './token-catalog.mjs';
import { SYS, TokenModel, hexa, parseExpr } from './token-model.mjs';

const { values: args } = parseArgs({
  options: {
    project: { type: 'string' },
    only: { type: 'string' },
    out: { type: 'string' },
    'keep-scripts': { type: 'boolean', default: false },
  },
});
const ONLY = args.only ? new Set(args.only.split(',')) : null;
const PROJECTS = args.project ? new Set(args.project.split(',')) : null;
const OUT = path.resolve(args.out ?? LIBRARY_FILE);
const SCRIPTS = path.join(CACHE, 'scripts');

// Canvas arrangement (figcraft-design rule 6a): rows 80 px apart, 40 px side padding, 80 px below the section
// top, sections 160 px apart. Variants inside a set: 24 px apart, 20 px set padding.
const GAP = 80,
  SIDE = 40,
  TOP = 80,
  SECTION_GAP = 160,
  ROW_MAX = 2400,
  VGAP = 24,
  SET_PAD = 20;

const overrides = readJson(path.join(TOOL_DIR, 'overrides.json'));
const report = {
  rawColors: {},
  svgs: 0,
  images: 0,
  skipped: [],
  gradients: 0,
  layers: 0,
  fontFallbacks: {},
  missingFonts: {},
  notInKit: {},
};

const projects = prismProjects().filter(
  (p) =>
    (!PROJECTS || PROJECTS.has(p.name)) &&
    fs.existsSync(path.join(CACHE, p.name, 'index.json')),
);
if (!projects.length)
  throw new Error(
    'No capture in tmp/figcraft-cache; run node tools/figcraft/capture.mjs first.',
  );
const captures = Object.fromEntries(
  projects.map((p) => [
    p.name,
    readJson(path.join(CACHE, p.name, 'index.json')),
  ]),
);

// ---------------------------------------------------------------------------------------------------------------
// Kit: the variables and styles rxap.figcraft may use

function readKit() {
  const dir = path.join(CACHE, 'kit');
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  execFileSync('unzip', ['-q', '-o', KIT_FILE, 'document.json', '-d', dir]);
  const doc = readJson(path.join(dir, 'document.json'));
  return {
    variables: new Set(
      Object.values(doc.variables.variables).map((v) => v.name),
    ),
    styles: new Set(doc.styles.map((s) => s.name)),
  };
}
const kit = readKit();

/** The token model of the capture, restricted to what the kit publishes. */
class KitTokenModel extends TokenModel {
  color(decl, current, light, dark, role) {
    const p = super.color(decl, current, light, dark, role);
    if (p.var && !kit.variables.has(p.var)) {
      report.notInKit[p.var] = (report.notInKit[p.var] ?? 0) + 1;
      return { color: hexa(light) };
    }
    return p;
  }
  number(decl, captured, type) {
    const n = super.number(decl, captured, type);
    if (n && !kit.variables.has(n)) {
      report.notInKit[n] = (report.notInKit[n] ?? 0) + 1;
      return null;
    }
    return n;
  }
}
const theme = readJson(path.join(CACHE, `tokens.${projects[0].name}.json`));
const tokens = new KitTokenModel(theme, tokenCatalog());

const git = (...a) =>
  execFileSync('git', a, { cwd: ROOT, encoding: 'utf8' }).trim();
const forge = (() => {
  const m = /gitlab\.com[:/](.+?)(\.git)?$/.exec(
    git('remote', 'get-url', 'origin'),
  );
  if (!m) return null;
  let branch = 'development';
  try {
    branch = git('symbolic-ref', 'refs/remotes/origin/HEAD').replace(
      /^refs\/remotes\/origin\//,
      '',
    );
  } catch {
    // no origin/HEAD: the default branch of rxap/packages
  }
  return `https://gitlab.com/${m[1]}/-/blob/${branch}`;
})();

/** Font families FigCraft can lay text out with on this machine (installed, or built in). */
const installedFonts = (() => {
  const file = path.join(CACHE, 'fonts-probe.json');
  fs.mkdirSync(CACHE, { recursive: true });
  fs.writeFileSync(
    file,
    JSON.stringify([{ command: 'text.fonts', params: {} }]),
  );
  const line = execFileSync('figcraft-cli', ['run', file], {
    encoding: 'utf8',
    maxBuffer: 1 << 26,
  }).split('\n')[0];
  return new Set(JSON.parse(line).result);
})();

function fontFamily(layer, decl) {
  if (installedFonts.has(layer.fontFamily)) return layer.fontFamily;
  const key = `${layer.fontFamily} -> ${decl.platformFont}`;
  if (decl.platformFont && installedFonts.has(decl.platformFont)) {
    report.fontFallbacks[key] = (report.fontFallbacks[key] ?? 0) + 1;
    return decl.platformFont;
  }
  const matched = fontconfigMatch(layer.fontFamily);
  if (matched && installedFonts.has(matched)) {
    const via = `${layer.fontFamily} -> ${matched} (fc-match)`;
    report.fontFallbacks[via] = (report.fontFallbacks[via] ?? 0) + 1;
    return matched;
  }
  report.missingFonts[layer.fontFamily] =
    (report.missingFonts[layer.fontFamily] ?? 0) + 1;
  return layer.fontFamily;
}

const fcCache = new Map();
function fontconfigMatch(family) {
  if (!fcCache.has(family)) {
    let out = null;
    try {
      out =
        execFileSync('fc-match', ['-f', '%{family[0]}', family], {
          encoding: 'utf8',
        }).trim() || null;
    } catch {
      // fontconfig not available: keep the declared family.
    }
    fcCache.set(family, out);
  }
  return fcCache.get(family);
}

const clean = (s) =>
  String(s).replace(/[,=]/g, ' ').replace(/\s+/g, ' ').trim();

/** The component's name is its Angular selector: the first one of the list (all of them in the description). */
function componentName(entry) {
  return entry.selector ? entry.selector.split(',')[0].trim() : entry.className;
}

class Script {
  constructor(label) {
    this.label = label;
    this.steps = [];
    this.n = 0;
    this.svgs = [];
  }
  ref() {
    return `r${++this.n}`;
  }
  add(command, params, as) {
    const step = { command, params };
    if (as) step.as = as;
    this.steps.push(step);
    return as ? { $ref: as } : undefined;
  }
}

// Kit variables are copied into the file (linked, read-only) the first time a layer uses them; after that, layers
// refer to them by name like local variables. Styles are applied through the library every time.
const imported = new Set();
function useVar(s, name) {
  if (!imported.has(name)) {
    imported.add(name);
    s.add('library.importVariable', { library: KIT_NAME, variable: name });
  }
  return { $var: name };
}
function applyStyle(s, ids, style) {
  if (!kit.styles.has(style)) return false;
  s.add('library.applyStyle', { library: KIT_NAME, style, ids });
  return true;
}
const paintOf = (s, p) => (p.var ? useVar(s, p.var) : p.color);

function rawColor(owner, c) {
  (report.rawColors[owner] ??= new Set()).add(hexa(c));
}

// ---------------------------------------------------------------------------------------------------------------
// Layer replay

function paint(ctx, decl, current, light, dark, role) {
  const p = tokens.color(decl, current, light, dark, role);
  if (p.color) rawColor(ctx.owner, light);
  return p;
}

function parseExprSafe(v) {
  try {
    return parseExpr(v);
  } catch {
    return null;
  }
}

function emitText(s, layer, parent, ctx) {
  const d = ctx.dark?.[layer.fcId] ?? {};
  const decl = ctx.decl?.[layer.fcId] ?? {};
  const ref = s.ref();
  const props = {
    fontFamily: fontFamily(layer, decl),
    fontStyle: layer.fontStyle,
    fontSize: layer.fontSize,
    letterSpacing: layer.letterSpacing,
    textAlign: layer.textAlign,
    textCase: layer.textCase,
    textDecoration: layer.textDecoration,
  };
  if (typeof layer.lineHeight === 'number') props.lineHeight = layer.lineHeight;
  const color = paint(
    ctx,
    layer.placeholder ? undefined : decl.color,
    undefined,
    layer.color,
    layer.placeholder ? d.placeholder : d.text,
    'text',
  );
  props.fill = paintOf(s, color);
  if (layer.wrap) {
    props.textAutoResize = 'height';
    props.width = layer.width + 1;
  }
  s.add(
    'node.create',
    {
      type: 'text',
      parent,
      x: layer.x,
      y: layer.y,
      text: layer.characters,
      name: layer.name,
      props,
      select: false,
    },
    ref,
  );
  if (color.var && color.opacity < 0.999)
    s.add('fill.set', {
      ids: [{ $ref: ref }],
      index: 0,
      opacity: color.opacity,
    });
  if (layer.placeholder) return;
  // Typography: the `font: var(--mat-sys-<role>)` shorthand becomes the kit's text style, component tokens become
  // bindings to the kit's variables.
  const field = (p) =>
    decl[p] && !/^font:/.test(decl[p]) ? decl[p] : undefined;
  const role = tokens.fontRole(decl.font ?? decl['font-size']);
  const roleSize = role
    ? tokens.evalNumber(parseExprSafe(`var(--${role}-size)`))
    : NaN;
  const roleWeight = role
    ? tokens.evalNumber(parseExprSafe(`var(--${role}-weight)`))
    : NaN;
  const roleTracking = role
    ? tokens.evalNumber(parseExprSafe(`var(--${role}-tracking)`))
    : NaN;
  const roleLine = role
    ? tokens.evalNumber(parseExprSafe(`var(--${role}-line-height)`))
    : NaN;
  const roleFont = role
    ? String(tokens.raw[`--${role}-font`] ?? '')
        .split(',')[0]
        .replace(/["']/g, '')
        .trim()
    : '';
  if (
    role &&
    Math.abs(roleSize - layer.fontSize) < 0.05 &&
    Math.abs(roleWeight - (layer.fontWeight ?? 400)) < 1 &&
    Math.abs(roleTracking - (layer.letterSpacing ?? 0)) < 0.05 &&
    (typeof layer.lineHeight !== 'number' ||
      Math.abs(roleLine - layer.lineHeight) < 0.5) &&
    roleFont === props.fontFamily &&
    ![
      'font-size',
      'line-height',
      'letter-spacing',
      'font-family',
      'font-weight',
    ].some(field) &&
    applyStyle(s, [{ $ref: ref }], role)
  ) {
    s.add('node.set', {
      ids: [{ $ref: ref }],
      props: { fill: paintOf(s, color) },
    });
    return;
  }
  const binds = [
    ['fontSize', tokens.number(field('font-size'), layer.fontSize)],
    [
      'lineHeight',
      typeof layer.lineHeight === 'number'
        ? tokens.number(field('line-height'), layer.lineHeight)
        : null,
    ],
    [
      'letterSpacing',
      tokens.number(field('letter-spacing'), layer.letterSpacing),
    ],
    ['fontWeight', tokens.number(field('font-weight'), layer.fontWeight)],
    [
      'fontFamily',
      field('font-family')
        ? tokens.number(field('font-family'), null, 'string')
        : null,
    ],
  ];
  for (const [f, variable] of binds)
    if (variable) {
      useVar(s, variable);
      s.add('variable.bind', { ids: [{ $ref: ref }], field: f, variable });
    }
}

/** An SVG file drawn into a w x h box (its viewBox scaled by `ratio`, a preserveAspectRatio value). */
function sizedSvg(svg, w, h, ratio) {
  return svg.replace(/<svg\b([^>]*)>/, (_m, attrs) => {
    let a = attrs.replace(/\s(width|height)\s*=\s*(["'])[^"']*\2/g, '');
    if (!/viewBox\s*=/.test(a)) {
      const vw = /width\s*=\s*["']([\d.]+)/.exec(attrs)?.[1],
        vh = /height\s*=\s*["']([\d.]+)/.exec(attrs)?.[1];
      if (vw && vh) a += ` viewBox="0 0 ${vw} ${vh}"`;
    }
    a = a.replace(/\spreserveAspectRatio\s*=\s*(["'])[^"']*\1/, '');
    return `<svg${a} width="${w}" height="${h}" preserveAspectRatio="${ratio}">`;
  });
}

/**
 * A CSS background image drawn into a w x h box the way the browser lays it out: `background-size` (cover,
 * contain, auto, lengths, percentages), `background-position` and `background-repeat`. Returns one SVG holding a
 * nested <svg> per tile.
 */
function backgroundSvg(svg, w, h, bg) {
  const open = /<svg\b([^>]*)>/.exec(svg);
  if (!open) return sizedSvg(svg, w, h, 'xMidYMid meet');
  const attrs = open[1];
  const num = (re) => Number(re.exec(attrs)?.[1]);
  const vb = /viewBox\s*=\s*["']([^"']+)["']/
    .exec(attrs)?.[1]
    ?.trim()
    .split(/[\s,]+/)
    .map(Number);
  let iw = num(/\swidth\s*=\s*["']([\d.]+)/),
    ih = num(/\sheight\s*=\s*["']([\d.]+)/);
  if (!(iw > 0 && ih > 0) && vb?.length === 4) [iw, ih] = [vb[2], vb[3]];
  if (!(iw > 0 && ih > 0)) [iw, ih] = [w, h];
  const viewBox = vb?.length === 4 ? vb.join(' ') : `0 0 ${iw} ${ih}`;
  const inner = svg
    .slice(open.index + open[0].length)
    .replace(/<\/svg>\s*$/, '');

  // Tile size.
  const size = String(bg.size ?? 'auto')
    .split(',')[0]
    .trim();
  let tw, th;
  if (size === 'cover' || size === 'contain') {
    const k = (size === 'cover' ? Math.max : Math.min)(w / iw, h / ih);
    [tw, th] = [iw * k, ih * k];
  } else {
    const [sx = 'auto', sy = 'auto'] = size.split(/\s+/);
    const len = (v, box) =>
      v.endsWith('%') ? (parseFloat(v) / 100) * box : parseFloat(v);
    tw = sx === 'auto' ? NaN : len(sx, w);
    th = sy === 'auto' ? NaN : len(sy, h);
    if (Number.isNaN(tw) && Number.isNaN(th)) [tw, th] = [iw, ih];
    else if (Number.isNaN(tw)) tw = (th * iw) / ih;
    else if (Number.isNaN(th)) th = (tw * ih) / iw;
  }
  // Position of the first tile (percentages place the tile's point on the box's point).
  const [px = '0%', py = '0%'] = String(bg.position ?? '0% 0%')
    .split(',')[0]
    .trim()
    .split(/\s+/);
  const pos = (v, box, t) =>
    v.endsWith('%') ? (parseFloat(v) / 100) * (box - t) : parseFloat(v) || 0;
  const ox = pos(px, w, tw),
    oy = pos(py, h, th);
  // Repeat per axis.
  const rep = String(bg.repeat ?? 'repeat')
    .split(',')[0]
    .trim()
    .split(/\s+/);
  const [rx, ry] =
    rep.length === 2
      ? rep.map((r) => r !== 'no-repeat')
      : rep[0] === 'repeat-x'
        ? [true, false]
        : rep[0] === 'repeat-y'
          ? [false, true]
          : rep[0] === 'no-repeat'
            ? [false, false]
            : [true, true];
  const starts = (o, t, box, r) => {
    if (!r || !(t > 0.5)) return [o];
    const out = [];
    for (let v = o - Math.ceil(o / t) * t; v < box && out.length < 200; v += t)
      out.push(v);
    return out;
  };
  const xs = starts(ox, tw, w, rx),
    ys = starts(oy, th, h, ry);
  const r2 = (n) => Math.round(n * 100) / 100;
  const tiles = ys.flatMap((y) =>
    xs.map(
      (x) =>
        `<svg x="${r2(x)}" y="${r2(y)}" width="${r2(tw)}" height="${r2(th)}" viewBox="${viewBox}" preserveAspectRatio="none">${inner}</svg>`,
    ),
  );
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${tiles.join('')}</svg>`;
}

function emitLayer(s, layer, parent, ctx) {
  report.layers++;
  if (layer.type === 'text') return emitText(s, layer, parent, ctx);
  const d = ctx.dark?.[layer.fcId] ?? {};
  const decl = ctx.decl?.[layer.fcId] ?? {};
  if (layer.type === 'svg') {
    report.svgs++;
    const ref = s.ref();
    s.add(
      'file.import',
      {
        data: Buffer.from(layer.markup).toString('base64'),
        name: `${layer.name}.svg`,
        x: 0,
        y: 0,
      },
      ref,
    );
    s.add('node.reparent', { ids: [{ $ref: ref }], parent });
    s.add('node.set', {
      ids: [{ $ref: ref }],
      props: {
        name: layer.name,
        x: layer.x,
        y: layer.y,
        opacity: layer.opacity ?? 1,
      },
    });
    s.svgs.push({
      ref,
      owner: ctx.owner,
      markup: layer.markup,
      dark: d.svg ?? [],
      decl: decl.svg ?? [],
      current: decl.svgColor,
    });
    return;
  }
  if (layer.type === 'polygon') {
    const sideName = ['top', 'right', 'bottom', 'left'][layer.side];
    const p = paint(
      ctx,
      decl[`border-${sideName}-color`],
      decl.color,
      layer.color,
      d.border?.[layer.side],
      'fill',
    );
    const ref = s.ref();
    s.add(
      'node.create',
      {
        type: 'vector',
        parent,
        x: layer.x,
        y: layer.y,
        points: layer.points,
        closed: true,
        name: layer.name,
        props: {
          fill: paintOf(s, p),
          stroke: 'none',
          ...(layer.opacity < 1 && { opacity: layer.opacity }),
        },
        select: false,
      },
      ref,
    );
    if (p.var && p.opacity < 0.999)
      s.add('fill.set', { ids: [{ $ref: ref }], index: 0, opacity: p.opacity });
    return;
  }
  if (layer.type === 'image') {
    report.images++;
    const file = layer.file && path.join(CACHE, 'images', layer.file);
    if (file && fs.existsSync(file) && file.endsWith('.svg')) {
      const ratio =
        { fill: 'none', cover: 'xMidYMid slice' }[layer.fit] ?? 'xMidYMid meet';
      const svg = sizedSvg(
        fs.readFileSync(file, 'utf8'),
        layer.width,
        layer.height,
        ratio,
      );
      const ref = s.ref();
      s.add(
        'file.import',
        {
          data: Buffer.from(svg).toString('base64'),
          name: `${layer.name}.svg`,
          x: 0,
          y: 0,
        },
        ref,
      );
      s.add('node.reparent', { ids: [{ $ref: ref }], parent });
      s.add('node.set', {
        ids: [{ $ref: ref }],
        props: {
          name: layer.name,
          x: layer.x,
          y: layer.y,
          ...(layer.radius && { cornerRadius: layer.radius, clip: true }),
        },
      });
    } else if (file && fs.existsSync(file)) {
      const ref = s.ref();
      s.add(
        'image.place',
        {
          path: file,
          parent,
          x: layer.x,
          y: layer.y,
          width: layer.width,
          height: layer.height,
          name: layer.name,
          mode:
            layer.fit === 'contain' || layer.fit === 'scale-down'
              ? 'fit'
              : 'fill',
        },
        ref,
      );
      if (layer.radius)
        s.add('node.set', {
          ids: [{ $ref: ref }],
          props: { cornerRadius: layer.radius },
        });
    } else {
      s.add('node.create', {
        type: 'rectangle',
        parent,
        x: layer.x,
        y: layer.y,
        width: layer.width,
        height: layer.height,
        name: `${layer.name} (image)`,
        props: { fill: '#C4C4C4' },
        select: false,
      });
    }
    return;
  }
  const ref = s.ref();
  const props = { clip: !!layer.clip };
  if (layer.opacity !== undefined && layer.opacity < 1)
    props.opacity = layer.opacity;
  if (layer.radius) props.cornerRadius = layer.radius;
  if (layer.rotation) props.rotation = layer.rotation;
  let fill = null,
    stroke = null;
  if (layer.fill) {
    fill = paint(
      ctx,
      decl['background-color'],
      decl.color,
      layer.fill,
      d.fill,
      'fill',
    );
    props.fill = paintOf(s, fill);
  } else if (layer.effects) {
    // A CSS box-shadow is cast by the box only; FigCraft casts the shadow of an unfilled frame's content. Filled
    // with what is behind it, the frame casts a box shadow that looks the same.
    props.fill = ctx.backdrop;
  } else {
    props.fill = 'none';
  }
  const opaque =
    layer.fill &&
    (layer.fill.a ?? 1) > 0.999 &&
    !(fill?.var && fill.opacity < 0.999);
  if (layer.gradient) report.gradients++;
  if (layer.border) {
    const sides = layer.border;
    const i = sides.findIndex(Boolean);
    const sideName = ['top', 'right', 'bottom', 'left'][i];
    stroke = paint(
      ctx,
      decl[`border-${sideName}-color`],
      decl.color,
      sides[i].c,
      d.border?.[i],
      'stroke',
    );
    props.stroke = paintOf(s, stroke);
    props.strokeAlign = 'inside';
    const w = sides.map((x) => (x ? x.w : 0));
    if (w.every((x) => x === w[0])) props.strokeWeight = w[0];
    else
      Object.assign(props, {
        strokeTopWeight: w[0],
        strokeRightWeight: w[1],
        strokeBottomWeight: w[2],
        strokeLeftWeight: w[3],
      });
    if (sides[i].dashed) props.dashes = [sides[i].w * 2, sides[i].w * 2];
  }
  const level = layer.effects ? tokens.elevation(decl['box-shadow']) : null;
  const levelStyle = level && kit.styles.has(level) ? level : null;
  if (layer.effects && !levelStyle) {
    props.effects = layer.effects.map((e) => ({
      type: e.type,
      color: {
        r: e.color.r / 255,
        g: e.color.g / 255,
        b: e.color.b / 255,
        a: e.color.a,
      },
      offset: e.offset,
      radius: e.radius,
      spread: e.spread,
      visible: true,
      blend: 'normal',
    }));
  }
  s.add(
    'node.create',
    {
      type: layer.root ? 'component' : 'frame',
      parent,
      x: layer.x,
      y: layer.y,
      width: Math.max(0.01, layer.width),
      height: Math.max(0.01, layer.height),
      name: layer.name,
      props,
      select: false,
    },
    ref,
  );
  if (fill?.var && fill.opacity < 0.999)
    s.add('fill.set', {
      ids: [{ $ref: ref }],
      index: 0,
      opacity: fill.opacity,
    });
  const bg =
    layer.bgImage?.file && path.join(CACHE, 'images', layer.bgImage.file);
  if (bg && fs.existsSync(bg) && !bg.endsWith('.svg')) {
    report.images++;
    s.add('image.place', {
      path: bg,
      target: { $ref: ref },
      mode: /contain/.test(layer.bgImage.size)
        ? 'fit'
        : /cover/.test(layer.bgImage.size) ||
            /^no-repeat/.test(layer.bgImage.repeat ?? 'no-repeat')
          ? 'fill'
          : 'tile',
    });
  } else if (bg && fs.existsSync(bg)) {
    report.images++;
    const svg = backgroundSvg(
      fs.readFileSync(bg, 'utf8'),
      layer.width,
      layer.height,
      layer.bgImage,
    );
    // The background is clipped to the box (and its rounded corners), as in CSS.
    s.add('node.set', { ids: [{ $ref: ref }], props: { clip: true } });
    const icon = s.ref();
    s.add(
      'file.import',
      {
        data: Buffer.from(svg).toString('base64'),
        name: 'background.svg',
        x: 0,
        y: 0,
      },
      icon,
    );
    s.add('node.reparent', { ids: [{ $ref: icon }], parent: { $ref: ref } });
    s.add('node.set', {
      ids: [{ $ref: icon }],
      props: { name: 'background-image', x: 0, y: 0 },
    });
  }
  if (stroke?.var && stroke.opacity < 0.999)
    s.add('stroke.set', {
      ids: [{ $ref: ref }],
      index: 0,
      opacity: stroke.opacity,
    });
  if (levelStyle) applyStyle(s, [{ $ref: ref }], levelStyle);
  const rd = decl['border-top-left-radius'];
  if (
    layer.radius &&
    rd &&
    ['top-right', 'bottom-right', 'bottom-left'].every(
      (c) => decl[`border-${c}-radius`] === rd,
    )
  ) {
    const v = tokens.evalNumber(parseExprSafe(rd));
    const shown = Math.min(v, Math.min(layer.width, layer.height) / 2);
    if (Number.isFinite(v) && Math.abs(shown - layer.radius[0]) < 0.6) {
      const variable = tokens.number(rd, v);
      if (variable) {
        useVar(s, variable);
        s.add('variable.bind', {
          ids: [{ $ref: ref }],
          field: 'cornerRadius',
          variable,
        });
      }
    }
  }
  const meta = {};
  if (layer.pluginData) meta.pluginData = layer.pluginData;
  if (layer.description && layer.root) meta.description = layer.description;
  if (Object.keys(meta).length)
    s.add('node.set', { ids: [{ $ref: ref }], props: meta });
  const inner = opaque ? { ...ctx, backdrop: props.fill } : ctx;
  for (const c of layer.children ?? []) emitLayer(s, c, { $ref: ref }, inner);
  if (layer.layout) {
    s.add('node.set', {
      ids: [{ $ref: ref }],
      props: {
        layout: layer.layout,
        gap: layer.gap,
        padding: layer.padding,
        strokesIncluded: false,
        mainAlign: layer.mainAlign,
        crossAlign: layer.crossAlign,
        sizingH: layer.sizingH,
        sizingV: layer.sizingV,
      },
    });
  }
  return { $ref: ref };
}

// ---------------------------------------------------------------------------------------------------------------
// Pages, sections, component sets

const ok = (c) => !c.error && !c.empty && !c.excluded;

/** One row per variant, one column per state. */
function setGeometry(entry) {
  const caps = entry.captures.filter(ok);
  const states = [null, ...entry.states.map((_, i) => i)].filter((st) =>
    caps.some((c) => c.state === st),
  );
  const variants = [...new Set(caps.map((c) => c.variant))];
  const colW = states.map((st) =>
    Math.max(...caps.filter((c) => c.state === st).map((c) => c.width)),
  );
  const rowH = variants.map((v) =>
    Math.max(...caps.filter((c) => c.variant === v).map((c) => c.height)),
  );
  const cells = caps.map((c) => {
    const col = states.indexOf(c.state),
      row = variants.indexOf(c.variant);
    return {
      cap: c,
      x: SET_PAD + colW.slice(0, col).reduce((a, b) => a + b + VGAP, 0),
      y: SET_PAD + rowH.slice(0, row).reduce((a, b) => a + b + VGAP, 0),
    };
  });
  return {
    cells,
    width:
      SET_PAD * 2 + colW.reduce((a, b) => a + b, 0) + VGAP * (colW.length - 1),
    height:
      SET_PAD * 2 + rowH.reduce((a, b) => a + b, 0) + VGAP * (rowH.length - 1),
  };
}

function shelf(items, startY) {
  let x = SIDE,
    y = startY,
    rowH = 0,
    width = 0;
  const pos = items.map((it) => {
    if (x > SIDE && x + it.width > ROW_MAX) {
      x = SIDE;
      y += rowH + GAP;
      rowH = 0;
    }
    const p = { x, y };
    x += it.width + GAP;
    rowH = Math.max(rowH, it.height);
    width = Math.max(width, x - GAP);
    return p;
  });
  return { pos, width: width + SIDE, height: y + rowH - startY };
}

function setDescription(entry, project) {
  const kind = entry.kind === 'directive' ? 'Directive' : 'Component';
  const lines = [
    `${entry.className} · ${kind} · import from '${project.packageName}'`,
  ];
  if (entry.selector) lines.push(`Selector: ${entry.selector}`);
  if (entry.description) lines.push('', entry.description);
  const described = entry.variants.filter((v) => v.description);
  if (described.length) {
    lines.push('', 'Variants:');
    for (const v of described) lines.push(`- ${v.name}: ${v.description}`);
  }
  if (entry.parts.length)
    lines.push(
      '',
      `Parts: ${entry.parts.map((p) => `${p.selector ?? p.className} (${p.className})`).join(', ')}`,
    );
  return lines.join('\n');
}

const captureData = (project, entry, cap) =>
  readJson(path.join(CACHE, project.name, entry.className, `${cap.key}.json`));

function emitComponentSet(s, section, entry, project, at, usedNames) {
  const geo = setGeometry(entry);
  const stateNames = ['default', ...entry.states];
  const refs = geo.cells.map((cell) => {
    const cap = cell.cap;
    const data = captureData(project, entry, cap);
    const v = entry.variants.find((x) => x.index === cap.variant);
    const root = {
      type: 'frame',
      root: true,
      name: `variant=${clean(v?.name ?? '') || cap.variant}, state=${clean(stateNames[cap.state === null ? 0 : cap.state + 1])}`,
      x: at.x + cell.x,
      y: at.y + cell.y,
      width: cap.width,
      height: cap.height,
      children: data.tree.children,
      pluginData: { prismKey: `${project.name}/${entry.className}/${cap.key}` },
      description: v?.template ?? '',
    };
    return emitLayer(s, root, section, {
      owner: entry.className,
      dark: data.dark,
      decl: data.decl,
      backdrop: useVar(s, `color/${SYS}-surface`),
    });
  });
  const setRef = s.ref();
  s.add('component.combineVariants', { ids: refs }, setRef);
  let name = componentName(entry);
  if (usedNames.has(name)) name = `${name} (${entry.className})`;
  usedNames.add(name);
  s.add('node.set', {
    ids: [{ $ref: setRef }],
    props: {
      name,
      description: setDescription(entry, project),
      pluginData: { prismKey: `${project.name}/${entry.className}` },
    },
  });
  if (forge && entry.source)
    s.add('devResource.add', {
      id: { $ref: setRef },
      url: `${forge}/${entry.source}`,
      name: path.basename(entry.source),
    });
}

/** The section tree of a page: one node per folder, holding the classes of that folder. */
function sectionTree(project, entries) {
  const rootName = path.basename(project.root);
  const root = { name: rootName, key: '', entries: [], children: new Map() };
  for (const e of entries) {
    let node = root;
    for (const part of e.sections) {
      if (!node.children.has(part))
        node.children.set(part, {
          name: part,
          key: `${node.key}/${part}`,
          entries: [],
          children: new Map(),
        });
      node = node.children.get(part);
    }
    node.entries.push(e);
  }
  return root;
}

/** Sizes a section (and its nested ones): sets in a shelf at the top, nested sections stacked below. */
function measure(node) {
  node.sets = node.entries.map((e) => ({ entry: e, ...setGeometry(e) }));
  node.setShelf = shelf(node.sets, TOP);
  let y = node.sets.length ? TOP + node.setShelf.height + GAP : TOP;
  let width = node.sets.length ? node.setShelf.width : 400;
  node.kids = [...node.children.values()].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  for (const k of node.kids) {
    measure(k);
    k.at = { x: SIDE, y };
    y += k.height + GAP;
    width = Math.max(width, k.width + SIDE * 2);
  }
  node.width = width;
  node.height = y - GAP + SIDE;
  return node;
}

function emitSection(s, node, parent, at, project, usedNames) {
  const ref = s.ref();
  s.add(
    'node.create',
    {
      type: 'section',
      ...(parent && { parent }),
      x: at.x,
      y: at.y,
      width: node.width,
      height: node.height,
      name: node.name,
      select: false,
    },
    ref,
  );
  s.add('node.set', {
    ids: [{ $ref: ref }],
    props: {
      fill: useVar(
        s,
        parent ? `color/${SYS}-surface-container-low` : `color/${SYS}-surface`,
      ),
      pluginData: { prismKey: `${project.name}/section${node.key}` },
    },
  });
  node.sets.forEach((set, i) =>
    emitComponentSet(
      s,
      { $ref: ref },
      set.entry,
      project,
      node.setShelf.pos[i],
      usedNames,
    ),
  );
  for (const k of node.kids)
    emitSection(s, k, { $ref: ref }, k.at, project, usedNames);
}

function entriesOf(project) {
  return (captures[project.name]?.entries ?? [])
    .filter((e) => (!ONLY || ONLY.has(e.className)) && e.captures.some(ok))
    .filter((e) => {
      const o = overrides.classes[e.className];
      if (o?.skip) report.skipped.push(`${e.className}: ${o.skip}`);
      return !o?.skip;
    })
    .sort((a, b) => componentName(a).localeCompare(componentName(b)));
}

/** Components and directives of a library that have no component set: they need an `@Showcase` first. */
function missingOf(project, entries) {
  const drawn = new Set(entries.map((e) => e.className));
  return selectorClasses(project)
    .filter((c) => !drawn.has(c.className))
    .sort((a, b) => a.selector.localeCompare(b.selector));
}

/**
 * A note section listing what the page does not draw (selector, class, why), so a gap in the design is seen
 * where the component would be.
 */
function emitMissing(s, project, missing, y) {
  const lines = missing.map((c) => {
    const reason =
      overrides.classes[c.className]?.skip ??
      (captures[project.name]?.entries.some((e) => e.className === c.className)
        ? 'showcase renders nothing'
        : 'no @Showcase');
    return `${c.selector.split(',')[0].trim()}  ·  ${c.className} (${c.kind})  ·  ${reason}  ·  ${c.source}`;
  });
  const width = 1200;
  // body-small wraps at about 150 characters in 1120 px; 20 px per line plus the 4 px gap.
  const height =
    TOP + 48 + lines.reduce((a, l) => a + 20 * Math.ceil(l.length / 140) + 4, 0) + SIDE;
  const sec = s.ref();
  s.add(
    'node.create',
    {
      type: 'section',
      x: 0,
      y,
      width,
      height,
      name: 'Without a showcase',
      select: false,
    },
    sec,
  );
  s.add('node.set', {
    ids: [{ $ref: sec }],
    props: {
      fill: useVar(s, `color/${SYS}-surface-container`),
      pluginData: { prismKey: `${project.name}/missing` },
    },
  });
  const col = s.ref();
  s.add(
    'node.create',
    {
      type: 'frame',
      parent: { $ref: sec },
      x: SIDE,
      y: TOP,
      width: width - SIDE * 2,
      height: 100,
      name: 'missing',
      props: {
        fill: 'none',
        clip: false,
        layout: 'vertical',
        gap: 4,
        sizingV: 'hug',
      },
      select: false,
    },
    col,
  );
  const texts = [
    [
      'mat-sys-title-small',
      'Not drawn: these components and directives have no ng-prism showcase that renders something. Add one (skill ng-prism:showcase) and regenerate.',
    ],
    ...lines.map((l) => ['mat-sys-body-small', l]),
  ];
  for (const [style, text] of texts) {
    const t = s.ref();
    s.add(
      'node.create',
      {
        type: 'text',
        parent: { $ref: col },
        width: width - SIDE * 2,
        text,
        props: {
          fill: useVar(s, `color/${SYS}-on-surface-variant`),
          textAutoResize: 'height',
        },
        select: false,
      },
      t,
    );
    applyStyle(s, [{ $ref: t }], style);
  }
  return height;
}

function emitPage(s, project) {
  const entries = entriesOf(project);
  const missing = missingOf(project, entries);
  let y = 0;
  if (entries.length) {
    const tree = measure(sectionTree(project, entries));
    const usedNames = new Set();
    // A page with only nested sections gets them as top-level sections (no empty wrapper around them).
    if (!tree.entries.length) {
      for (const k of tree.kids) {
        emitSection(s, k, null, { x: 0, y }, project, usedNames);
        y += k.height + SECTION_GAP;
      }
    } else {
      emitSection(s, tree, null, { x: 0, y: 0 }, project, usedNames);
      y = tree.height + SECTION_GAP;
    }
  }
  if (missing.length) emitMissing(s, project, missing, y);
  return entries.length;
}

// ---------------------------------------------------------------------------------------------------------------

function run(script, { input, output }) {
  fs.mkdirSync(SCRIPTS, { recursive: true });
  const file = path.join(SCRIPTS, `${script.label}.json`);
  fs.writeFileSync(file, JSON.stringify(script.steps));
  const a = ['run', file];
  if (input) a.push('--in', input);
  if (output) a.push('--out', output);
  let out;
  try {
    out = execFileSync('figcraft-cli', a, {
      encoding: 'utf8',
      maxBuffer: 1 << 30,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (e) {
    const lines = String(e.stdout ?? '')
      .split('\n')
      .filter((l) => l.includes('"ok":false'));
    throw new Error(
      `figcraft-cli run ${script.label} failed:\n${lines.join('\n') || e.stderr || e.message}`,
    );
  }
  if (!args['keep-scripts']) fs.rmSync(file);
  return out
    .split('\n')
    .filter(Boolean)
    .map((l) => {
      try {
        return JSON.parse(l);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

const cssRgb = (css) => {
  const s = String(css ?? '').trim();
  if (s.startsWith('#'))
    return `${parseInt(s.slice(1, 3), 16)},${parseInt(s.slice(3, 5), 16)},${parseInt(s.slice(5, 7), 16)}`;
  const m = s.match(/^rgba?\(([^)]*)\)/);
  return m
    ? m[1]
        .split(/[\s,/]+/)
        .slice(0, 3)
        .map(Number)
        .join(',')
    : null;
};
const toRgba = (css) => {
  const m = String(css)
    .match(/[\d.]+/g)
    ?.map(Number) ?? [0, 0, 0];
  return { r: m[0], g: m[1], b: m[2], a: m[3] ?? 1 };
};

/** Imported SVGs (icons): bind their colours (read back with selection.colors) to the declared tokens. */
function bindSvgColors(svgs, file) {
  if (!svgs.length) return;
  const q = new Script('svg-colors');
  for (const j of svgs) q.add('selection.colors', { ids: [j.id] });
  const res = run(q, { input: file });
  const bind = new Script('svg-bind');
  let n = 0;
  svgs.forEach((j, i) => {
    const lights = [
      ...j.markup.matchAll(/(?<![\w-])(fill|stroke):\s*([^;"]+)/gi),
    ].map((m) => m[2].trim());
    const byLight = new Map();
    lights.forEach((l, k) => {
      const key = cssRgb(l);
      if (key && !byLight.has(key))
        byLight.set(key, { dark: j.dark[k], decl: j.decl[k] });
    });
    for (const c of res[i]?.result?.colors ?? []) {
      const p = c.paint;
      if (!p || p.type !== 'solid') continue;
      const c0 = p.color;
      const light =
        typeof c0 === 'string'
          ? {
              r: parseInt(c0.slice(1, 3), 16),
              g: parseInt(c0.slice(3, 5), 16),
              b: parseInt(c0.slice(5, 7), 16),
              a:
                (c0.length === 9 ? parseInt(c0.slice(7, 9), 16) / 255 : 1) *
                (p.opacity ?? 1),
            }
          : {
              r: Math.round(c0.r * 255),
              g: Math.round(c0.g * 255),
              b: Math.round(c0.b * 255),
              a: (c0.a ?? 1) * (p.opacity ?? 1),
            };
      const hit = byLight.get(`${light.r},${light.g},${light.b}`);
      const dark = hit?.dark && cssRgb(hit.dark) ? toRgba(hit.dark) : null;
      const decl =
        hit?.decl && /currentcolor/i.test(hit.decl) ? j.current : hit?.decl;
      const r = tokens.color(decl, j.current, light, dark, 'fill');
      if (r.var) {
        useVar(bind, r.var);
        bind.add('selection.bindColorVariable', {
          targets: c.targets,
          variable: r.var,
        });
        n++;
      } else rawColor(j.owner, light);
    }
  });
  if (n) run(bind, { input: file, output: file });
}

/** The first page: what the file is, how it is made, and one line per library page. */
function emitOverview(s, pages) {
  s.add('library.setVariableMode', {
    library: KIT_NAME,
    collection: SYS,
    mode: 'Light',
  });
  const sec = s.ref();
  const libs = pages.filter((p) => p.project);
  const lines = [
    ['mat-sys-headline-medium', 'rxap · Angular components and directives'],
    [
      'mat-sys-body-large',
      'Generated from the ng-prism styleguides of packages/angular (tools/figcraft). Do not edit by hand: change the showcase or the component, then regenerate.',
    ],
    [
      'mat-sys-body-medium',
      'One page per library, one section per source folder below src/lib, one component set per component or directive, named like its Angular selector. Variants are the ng-prism showcase variants times their states.',
    ],
    [
      'mat-sys-body-medium',
      'Colours, type and elevation are bound to the angular-components library (Angular Material + CDK): switch mat-sys between Light and Dark to change the scheme.',
    ],
    ['mat-sys-title-medium', 'Libraries'],
    ...libs.map((p) => [
      'mat-sys-body-medium',
      `${p.name} (${p.project.root}) · ${p.count ?? 0} components and directives`,
    ]),
  ];
  // Lines wrap at 1120 px (about 150 characters of body text); the column hugs them.
  const lineH = ([style, text]) =>
    (/headline/.test(style) ? 36 : 24) *
    Math.max(1, Math.ceil(text.length / 140));
  const height = TOP + lines.reduce((a, l) => a + lineH(l) + 16, 0) + SIDE;
  s.add(
    'node.create',
    {
      type: 'section',
      x: 0,
      y: 0,
      width: 1200,
      height,
      name: 'rxap',
      select: false,
    },
    sec,
  );
  s.add('node.set', {
    ids: [{ $ref: sec }],
    props: { fill: useVar(s, `color/${SYS}-surface`) },
  });
  const col = s.ref();
  s.add(
    'node.create',
    {
      type: 'frame',
      parent: { $ref: sec },
      x: SIDE,
      y: TOP,
      width: 1200 - SIDE * 2,
      height: 100,
      name: 'overview',
      props: {
        fill: 'none',
        clip: false,
        layout: 'vertical',
        gap: 16,
        sizingV: 'hug',
      },
      select: false,
    },
    col,
  );
  for (const [style, text] of lines) {
    const t = s.ref();
    s.add(
      'node.create',
      {
        type: 'text',
        parent: { $ref: col },
        width: 1200 - SIDE * 2,
        text,
        props: {
          fill: useVar(s, `color/${SYS}-on-surface`),
          textAutoResize: 'height',
        },
        select: false,
      },
      t,
    );
    applyStyle(s, [{ $ref: t }], style);
  }
}

function main() {
  const core = projects.filter((p) => !p.material);
  const material = projects.filter((p) => p.material);
  const pages = [
    { name: 'Overview', overview: true },
    ...(core.length ? [{ name: '- Angular' }] : []),
    ...core.map((p) => ({ name: p.packageName, project: p })),
    ...(material.length ? [{ name: '- Material' }] : []),
    ...material.map((p) => ({ name: p.packageName, project: p })),
  ];

  for (const page of pages)
    if (page.project) page.count = entriesOf(page.project).length;
  report.skipped = [];
  const scripts = pages.map((page, index) => {
    const s = new Script(`page-${index}`);
    s.page = page;
    if (index === 0) {
      s.add('file.rename', { name: DOC_NAME });
      s.add('library.add', { path: KIT_FILE });
      s.add('page.rename', { name: page.name });
      emitOverview(s, pages);
    } else {
      s.add('page.add', { name: page.name });
    }
    if (page.project) {
      s.add('page.select', { index });
      s.add('library.setVariableMode', {
        library: KIT_NAME,
        collection: SYS,
        mode: 'Light',
      });
      emitPage(s, page.project);
    }
    return s;
  });

  const tmp = `${OUT}.tmp.figcraft`;
  fs.rmSync(tmp, { force: true });
  const svgs = [];
  scripts.forEach((s, i) => {
    const results = run(s, { input: i ? tmp : undefined, output: tmp });
    const byRef = new Map();
    s.steps.forEach(
      (st, k) => st.as && byRef.set(st.as, results[k]?.result?.id),
    );
    for (const j of s.svgs) svgs.push({ ...j, id: byRef.get(j.ref) });
    console.log(
      `[figcraft-build] ${s.page.name}: ${s.page.count ?? 0} classes, ${s.steps.length} steps`,
    );
  });
  bindSvgColors(
    svgs.filter((j) => j.id !== undefined),
    tmp,
  );
  if (fs.existsSync(OUT) && fs.statSync(OUT).size > 4096) {
    const kept = keepIds(OUT, tmp);
    console.log(
      `[figcraft-build] ids kept from ${path.relative(ROOT, OUT)}: ${kept.nodes.kept} layers (${kept.nodes.new} new, ${kept.nodes.removed} removed), ` +
        `${kept.assets.kept} variables/styles (${kept.assets.new} new)`,
    );
  }
  const fin = new Script('publish');
  fin.add('page.select', { index: 0 });
  fin.add('library.publish', {
    description: `rxap Angular components and directives from ng-prism (${git('rev-parse', '--short', 'HEAD')})`,
  });
  try {
    run(fin, { input: tmp, output: tmp });
  } catch (e) {
    if (!/no changes to publish/.test(e.message)) throw e;
    console.log('[figcraft-build] library unchanged: no new version published');
  }
  fs.renameSync(tmp, OUT);

  const raw = Object.fromEntries(
    Object.entries(report.rawColors).map(([k, v]) => [k, [...v]]),
  );
  writeJson(path.join(CACHE, 'build-report.json'), {
    ...report,
    rawColors: raw,
    tokens: tokens.stats,
  });
  console.log(
    `[figcraft-build] wrote ${path.relative(ROOT, OUT)}: ${report.layers} layers, ${report.svgs} svgs; ` +
      `colours: ${tokens.stats.bound} by declaration, ${tokens.stats.heuristic} by value, ${tokens.stats.raw} literal; ${tokens.stats.numeric} size/type bindings`,
  );
}

main();
