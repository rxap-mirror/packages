// Turns the CSS declarations the capture read (`var(--mat-<ns>-<key>, var(--mat-sys-<role>))`,
// `color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent)`, ...) into FigCraft variables named like
// the code, and checks every binding against the colour or size the browser rendered.
//
// Collections (see figcraft/README.md):
//   mat-sys         modes Light / Dark   color/mat-sys-*, typescale/mat-sys-*, shape/mat-sys-*, state/mat-sys-*
//   mat-components  mode Default         <namespace>/mat-<namespace>-<key>, aliases of mat-sys (or literals)
import { SYSTEM_COLOR } from './declared.mjs';
import { matchToken } from './tokens.mjs';

export const SYS = 'mat-sys';
export const COMP = 'mat-components';

// ---------------------------------------------------------------------------------------------------------------
// Parsing

function balanced(str, open) {
  let depth = 0;
  for (let i = open; i < str.length; i++) {
    if (str[i] === '(') depth++;
    else if (str[i] === ')' && --depth === 0) return i;
  }
  return -1;
}

function splitTop(str) {
  const out = [];
  let depth = 0,
    cur = '';
  for (const ch of str) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ',' && !depth) {
      out.push(cur.trim());
      cur = '';
    } else cur += ch;
  }
  out.push(cur.trim());
  return out;
}

/** var()/color-mix() expression tree of a declared value (a `prop: value` shorthand prefix is dropped). */
export function parseExpr(raw) {
  if (raw === undefined || raw === null) return null;
  let str = String(raw).trim();
  const pre = /^([a-z-]+):\s*([\s\S]*)$/.exec(str);
  if (pre && !/^(var|color-mix)\(/.test(str)) str = pre[2];
  if (/^currentcolor$/i.test(str)) return { current: true };
  const iv = str.indexOf('var('),
    im = str.indexOf('color-mix(');
  const idx = [iv, im].filter((i) => i >= 0).sort((a, b) => a - b)[0];
  if (idx === undefined) return { literal: str };
  if (idx === iv) {
    const end = balanced(str, iv + 3);
    const [name, ...rest] = splitTop(str.slice(iv + 4, end));
    const fallback = rest.length ? rest.join(', ') : null;
    return {
      var: name.replace(/^--/, ''),
      fallback: fallback === null ? null : parseExpr(fallback),
    };
  }
  const end = balanced(str, im + 9);
  const args = splitTop(str.slice(im + 10, end));
  const part = (s) => {
    const m = /^([\s\S]*?)\s+([\d.]+)%$/.exec(s);
    return m
      ? { expr: parseExpr(m[1]), pct: Number(m[2]) / 100 }
      : { expr: parseExpr(s), pct: null };
  };
  const a = part(args[1]),
    b = part(args[2] ?? 'transparent');
  const pa = a.pct ?? (b.pct === null ? 0.5 : 1 - b.pct);
  return { mix: { a: a.expr, b: b.expr, t: pa } };
}

// ---------------------------------------------------------------------------------------------------------------
// Values

const remPx = (v) => {
  const s = String(v).trim();
  if (/rem$/.test(s)) return parseFloat(s) * 16;
  if (/px$/.test(s)) return parseFloat(s);
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
};

function cssColor(str) {
  const s = String(str).trim().toLowerCase();
  if (s === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };
  if (s === 'white') return { r: 255, g: 255, b: 255, a: 1 };
  if (s === 'black') return { r: 0, g: 0, b: 0, a: 1 };
  let m = /^#([0-9a-f]{3,8})$/.exec(s);
  if (m) {
    let h = m[1];
    if (h.length <= 4) h = [...h].map((x) => x + x).join('');
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
      a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1,
    };
  }
  m = /^rgba?\(([^)]*)\)$/.exec(s);
  if (m) {
    const n = m[1]
      .split(/[\s,/]+/)
      .filter(Boolean)
      .map(parseFloat);
    return { r: n[0], g: n[1], b: n[2], a: n[3] ?? 1 };
  }
  return null;
}

const hex2 = (n) =>
  Math.round(Math.max(0, Math.min(255, n)))
    .toString(16)
    .padStart(2, '0');
export const hexa = (c) =>
  `#${hex2(c.r)}${hex2(c.g)}${hex2(c.b)}${c.a >= 0.999 ? '' : hex2(c.a * 255)}`.toUpperCase();

function closeColor(x, y) {
  if (!x || !y) return false;
  const da = Math.abs((x.a ?? 1) - (y.a ?? 1));
  if (da > 0.02) return false;
  if ((x.a ?? 1) < 0.02) return true;
  return (
    Math.abs(x.r - y.r) <= 2 &&
    Math.abs(x.g - y.g) <= 2 &&
    Math.abs(x.b - y.b) <= 2
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Registry

export class TokenModel {
  constructor(theme, catalog) {
    this.theme = theme;
    this.catalog = catalog;
    this.colorTable = {
      list: Object.keys(theme.light.colors)
        .filter((n) => theme.dark.colors[n])
        .map((name) => ({
          name,
          light: theme.light.colors[name],
          dark: theme.dark.colors[name],
        }))
        .filter((t) => t.light.a === 1 && t.dark.a === 1),
    };
    this.raw = theme.light.raw;
    /** component variables in creation order: name -> {type, value, description, codeSyntax} */
    this.comp = new Map();
    /** CSS system colours seen in the capture (in mat-sys, Light/Dark as the browser resolved them) */
    this.scheme = new Map();
    this.stats = { bound: 0, heuristic: 0, raw: 0, numeric: 0, conflicts: [] };
  }

  // ---- system variables ----
  sysColorName(role) {
    return `color/mat-sys-${role}`;
  }
  isSysColor(token) {
    return /^mat-sys-/.test(token) && !!this.theme.light.colors[token.slice(8)];
  }

  sysVariables() {
    const out = [];
    for (const t of this.colorTable.list) {
      out.push({
        name: this.sysColorName(t.name),
        type: 'color',
        values: { Light: hexa(t.light), Dark: hexa(t.dark) },
        css: `--mat-sys-${t.name}`,
      });
    }
    for (const [k, v] of Object.entries(this.raw)) {
      const name = k.slice(2);
      let m;
      if (
        (m =
          /^--mat-sys-((?:display|headline|title|body|label)-(?:large|medium|small))-(font|line-height|size|tracking|weight)$/.exec(
            k,
          ))
      ) {
        const isFont = m[2] === 'font';
        out.push({
          name: `typescale/${name}`,
          type: isFont ? 'string' : 'number',
          value: isFont
            ? v.split(',')[0].replace(/["']/g, '').trim()
            : remPx(v),
          css: k,
        });
      } else if (
        /^--mat-sys-corner-/.test(k) &&
        /^[\d.]+(px|rem)?$/.test(v.trim())
      ) {
        out.push({
          name: `shape/${name}`,
          type: 'number',
          value: remPx(v),
          css: k,
        });
      } else if (/^--mat-sys-.*-state-layer-opacity$/.test(k)) {
        out.push({
          name: `state/${name}`,
          type: 'number',
          value: parseFloat(v),
          css: k,
        });
      }
    }
    return out;
  }

  sysVarName(token) {
    this.sysNames ??= new Set(this.sysVariables().map((v) => v.name));
    let name = null;
    if (this.isSysColor(token)) name = this.sysColorName(token.slice(8));
    else if (/^mat-sys-(display|headline|title|body|label)-/.test(token))
      name = `typescale/${token}`;
    else if (/^mat-sys-corner-/.test(token)) name = `shape/${token}`;
    else if (/-state-layer-opacity$/.test(token)) name = `state/${token}`;
    // Only tokens that exist as variables (`--mat-sys-body-large` is the font shorthand, not one of them).
    return name && this.sysNames.has(name) ? name : null;
  }

  // ---- evaluation ----
  evalColor(expr, mode, current) {
    if (!expr) return null;
    if (expr.current)
      return current ? this.evalColor(current, mode, null) : null;
    if (expr.literal !== undefined) return cssColor(expr.literal);
    if (expr.var) {
      if (/^mat-sys-/.test(expr.var)) {
        const c = this.theme[mode].colors[expr.var.slice(8)];
        return c ? { ...c } : this.evalColor(expr.fallback, mode, current);
      }
      return this.evalColor(expr.fallback, mode, current); // component tokens are unset unless overridden
    }
    if (expr.mix) {
      const a = this.evalColor(expr.mix.a, mode, current),
        b = this.evalColor(expr.mix.b, mode, current);
      if (!a || !b) return null;
      const t = expr.mix.t;
      const alpha = a.a * t + b.a * (1 - t);
      if (alpha === 0) return { r: 0, g: 0, b: 0, a: 0 };
      const ch = (k) => (a[k] * a.a * t + b[k] * b.a * (1 - t)) / alpha;
      return { r: ch('r'), g: ch('g'), b: ch('b'), a: alpha };
    }
    return null;
  }

  evalNumber(expr) {
    if (!expr) return NaN;
    if (expr.literal !== undefined) return remPx(expr.literal);
    if (expr.var) {
      if (/^mat-sys-/.test(expr.var) && this.raw[`--${expr.var}`] !== undefined)
        return remPx(this.raw[`--${expr.var}`]);
      return this.evalNumber(expr.fallback);
    }
    return NaN;
  }

  // ---- variable values ----
  /** The FigCraft value of a component token's fallback: an alias, an alpha/mix of variables or a literal. */
  valueOf(expr, type) {
    if (!expr) return null;
    if (expr.var) {
      const name = this.varFor(expr.var, expr.fallback, type);
      return name ? { alias: name } : null;
    }
    if (type === 'color') {
      if (expr.literal !== undefined) {
        const c = cssColor(expr.literal);
        return c ? hexa(c) : null;
      }
      if (expr.mix) {
        const { a, b, t } = expr.mix;
        const av = a?.var ? this.varFor(a.var, a.fallback, 'color') : null;
        const bTransparent =
          b?.literal !== undefined && cssColor(b.literal)?.a === 0;
        if (av && bTransparent)
          return {
            alpha: { variable: av, opacity: Math.round(t * 1000) / 1000 },
          };
        const bv = b?.var ? this.varFor(b.var, b.fallback, 'color') : null;
        const op = (e, v) =>
          v
            ? { variable: v }
            : e?.literal !== undefined && cssColor(e.literal)
              ? { literal: hexa(cssColor(e.literal)) }
              : null;
        const from = op(b, bv),
          to = op(a, av);
        if (from && to)
          return { mix: { from, to, t: Math.round(t * 1000) / 1000 } };
      }
      return null;
    }
    if (expr.literal !== undefined) {
      if (type === 'string')
        return expr.literal.split(',')[0].replace(/["']/g, '').trim();
      const n = remPx(expr.literal);
      return Number.isFinite(n) ? n : null;
    }
    return null;
  }

  /** The variable name for a token (creating the component variable on first use), or null. */
  varFor(token, fallback, type) {
    if (/^mat-sys-/.test(token)) return this.sysVarName(token);
    const key = token.replace(/^mat-/, '');
    const info = this.catalog[key];
    if (!info) return null; // not an Angular Material token (e.g. the styleguide's own variables)
    const name = `${info.namespace}/${token}`;
    const existing = this.comp.get(name);
    if (existing) {
      if (existing.type !== type) return null;
      return name;
    }
    const value = this.valueOf(fallback, type);
    if (value === null) return null;
    this.comp.set(name, {
      name,
      type,
      value,
      css: `--${token}`,
      mixin: info.mixin,
      key: info.key,
    });
    return name;
  }

  // ---- bindings ----
  /**
   * Paint for a layer: a variable when the declared chain renders exactly the captured colour in light and
   * dark, else the system colour both values match, else the literal colour.
   */
  color(decl, current, light, dark, role) {
    const expr = parseExpr(decl);
    const cur = parseExpr(current);
    const kw =
      expr?.literal !== undefined && SYSTEM_COLOR.test(expr.literal.trim())
        ? expr.literal.trim().toLowerCase()
        : expr?.current &&
            cur?.literal !== undefined &&
            SYSTEM_COLOR.test(cur.literal.trim())
          ? cur.literal.trim().toLowerCase()
          : null;
    if (kw && light && dark) {
      const name = `color-scheme/${kw}`;
      const seen = this.scheme.get(name);
      if (!seen)
        this.scheme.set(name, {
          name,
          type: 'color',
          values: { Light: hexa(light), Dark: hexa(dark) },
          css: kw,
          light,
          dark,
        });
      if (
        !seen ||
        (closeColor(seen.light, light) && closeColor(seen.dark, dark))
      ) {
        this.stats.bound++;
        return { var: name, opacity: 1 };
      }
    }
    if (expr && (expr.var || expr.current)) {
      const target = expr.current ? cur : expr;
      if (target?.var) {
        const l = this.evalColor(target, 'light', null),
          d = this.evalColor(target, 'dark', null);
        if (closeColor(l, light) && (!dark || closeColor(d, dark))) {
          const name = this.varFor(target.var, target.fallback, 'color');
          if (name) {
            this.stats.bound++;
            return { var: name, opacity: 1 };
          }
        }
      }
    }
    const token = matchToken(this.colorTable, light, dark, role);
    if (token) {
      this.stats.heuristic++;
      return { var: this.sysColorName(token), opacity: light.a };
    }
    this.stats.raw++;
    return { color: hexa(light) };
  }

  /** A numeric (or font family) variable for a typography/shape field, when it renders the captured value. */
  number(decl, captured, type = 'number') {
    const expr = parseExpr(decl);
    if (!expr?.var) return null;
    if (type === 'number') {
      const v = this.evalNumber(expr);
      if (
        !Number.isFinite(v) ||
        !Number.isFinite(captured) ||
        Math.abs(v - captured) > 0.05
      )
        return null;
    }
    const name = this.varFor(expr.var, expr.fallback, type);
    if (name) this.stats.numeric++;
    return name;
  }

  /** The `font` shorthand role (`var(--mat-sys-body-large)`) when the text uses one. */
  fontRole(decl) {
    const expr = parseExpr(decl);
    const find = (e) =>
      !e
        ? null
        : e.var &&
            /^mat-sys-(display|headline|title|body|label)-(large|medium|small)$/.test(
              e.var,
            )
          ? e.var
          : find(e.fallback);
    return find(expr);
  }

  /** The elevation level a box-shadow chain falls back to, e.g. `mat-sys-level1`. */
  elevation(decl) {
    const m = /--(mat-sys-level\d)/.exec(String(decl ?? ''));
    return m ? m[1] : null;
  }
}
