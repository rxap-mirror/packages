// Runs in the browser (added with page.addScriptTag). Turns a rendered ng-prism canvas into a plain
// layer tree the FigCraft builder can replay: frames for boxes, text layers for text runs, SVG markup
// for inline <svg>, image references for <img>. Coordinates are relative to the parent layer.
//
//   window.__fcSerialize(roots: Element[]) -> {width, height, children: Layer[]}
//   window.__fcColors() -> {[fcId]: {fill?, stroke?: [t,r,b,l], text?, svg?: string[]}} (for the dark pass)
//   window.__fcTokens() -> {colors: {name: rgba}, type: {...}, shape: {...}, elevation: {...}}
(() => {
  const EPS = 1;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  const ctx2d = canvas.getContext('2d', {willReadFrequently: true});
  const colorCache = new Map();

  /** Any CSS colour -> {r,g,b,a} in 0..255 / 0..1, exact to 8 bit (the canvas does the parsing). */
  function parseColor(css) {
    if (!css || css === 'transparent' || css === 'none') return null;
    if (colorCache.has(css)) return colorCache.get(css);
    let out = null;
    const m = /^rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)$/.exec(css);
    const srgb =
      /^color\(srgb\s+([-\d.e]+)\s+([-\d.e]+)\s+([-\d.e]+)(?:\s*\/\s*([\d.e]+))?\)$/.exec(css);
    if (m) {
      out = {
        r: Math.round(+m[1]),
        g: Math.round(+m[2]),
        b: Math.round(+m[3]),
        a: m[4] === undefined ? 1 : +m[4],
      };
    } else if (srgb) {
      const ch = v => Math.round(Math.max(0, Math.min(1, +v)) * 255);
      out = {
        r: ch(srgb[1]),
        g: ch(srgb[2]),
        b: ch(srgb[3]),
        a: srgb[4] === undefined ? 1 : +(+srgb[4]).toFixed(3),
      };
    } else {
      ctx2d.clearRect(0, 0, 1, 1);
      ctx2d.fillStyle = '#000';
      ctx2d.fillStyle = css;
      ctx2d.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = ctx2d.getImageData(0, 0, 1, 1).data;
      out = a
        ? {
            r: Math.round((r * 255) / a),
            g: Math.round((g * 255) / a),
            b: Math.round((b * 255) / a),
            a: +(a / 255).toFixed(3),
          }
        : null;
      if (out) for (const k of ['r', 'g', 'b']) out[k] = Math.min(255, out[k]);
    }
    if (out && out.a === 0) out = null;
    colorCache.set(css, out);
    return out;
  }

  const px = v =>
    v === '' || v === 'auto' || v === 'normal' || v === 'none' ? null : parseFloat(v);
  /** The total CSS scale of an element (ancestors' transforms included): rendered box / layout box. */
  function scaleOf(el, r) {
    if (!(el instanceof HTMLElement) || !el.offsetWidth || !el.offsetHeight) return 1;
    const sx = r.width / el.offsetWidth,
      sy = r.height / el.offsetHeight;
    return Math.abs(sx - sy) < 0.02 && Math.abs(sx - 1) > 0.01 ? sx : 1;
  }
  const round = v => Math.round(v * 100) / 100;

  function shadows(css) {
    if (!css || css === 'none') return [];
    // Split on commas outside parentheses.
    const parts = [];
    let depth = 0,
      cur = '';
    for (const ch of css) {
      if (ch === '(') depth++;
      if (ch === ')') depth--;
      if (ch === ',' && !depth) {
        parts.push(cur);
        cur = '';
      } else cur += ch;
    }
    parts.push(cur);
    return parts
      .map(p => {
        const inset = /\binset\b/.test(p);
        const colorMatch =
          /(rgba?\([^)]*\)|#[0-9a-f]{3,8}|color\([^)]*\)|oklch\([^)]*\)|[a-z]+(?=\s|$))/i.exec(
            p.replace(/\binset\b/, ''),
          );
        const color = parseColor(colorMatch ? colorMatch[1] : 'black');
        const nums =
          p.replace(colorMatch ? colorMatch[1] : '', '').match(/-?[\d.]+px|\b0\b/g) || [];
        const [x = 0, y = 0, blur = 0, spread = 0] = nums.map(parseFloat);
        return color
          ? {
              type: inset ? 'innerShadow' : 'dropShadow',
              color,
              offset: [x, y],
              radius: blur,
              spread,
            }
          : null;
      })
      .filter(Boolean);
  }

  const FONT_STYLES = {
    100: 'Thin',
    200: 'ExtraLight',
    300: 'Light',
    400: 'Regular',
    500: 'Medium',
    600: 'SemiBold',
    700: 'Bold',
    800: 'ExtraBold',
    900: 'Black',
  };
  function fontStyle(cs) {
    const w = Math.round(parseFloat(cs.fontWeight) / 100) * 100;
    const base = FONT_STYLES[w] || 'Regular';
    return cs.fontStyle === 'italic' ? (base === 'Regular' ? 'Italic' : base + ' Italic') : base;
  }
  const firstFamily = cs =>
    cs.fontFamily
      .split(',')[0]
      .trim()
      .replace(/^["']|["']$/g, '');

  function layerName(el) {
    const tag = el.tagName.toLowerCase();
    if (el.dataset.fcPseudo) return `${el.dataset.fcPseudo}`;
    const cls = [...el.classList].find(c => !/^(ng-|cdk-visually|mat-focus-indicator$)/.test(c));
    return cls ? `${tag}.${cls}` : tag;
  }

  /** Pseudo-elements become real spans so they can be measured like any other box. */
  function materializePseudos(root) {
    const style = document.createElement('style');
    style.dataset.fcPseudoOff = '';
    style.textContent = '[data-fc-p]::before,[data-fc-p]::after{content:none!important}';
    document.head.appendChild(style);
    const els = [root, ...root.querySelectorAll('*')];
    for (const el of els) {
      if (
        el instanceof SVGElement ||
        /^(INPUT|IMG|TEXTAREA|SELECT|BR|HR|IFRAME|VIDEO|CANVAS)$/.test(el.tagName)
      )
        continue;
      const made = [];
      for (const pseudo of ['::before', '::after']) {
        const cs = getComputedStyle(el, pseudo);
        if (
          !cs.content ||
          cs.content === 'none' ||
          cs.content === 'normal' ||
          cs.display === 'none'
        )
          continue;
        if (parseFloat(cs.opacity) === 0 || cs.visibility === 'hidden') continue;
        const span = document.createElement('span');
        span.dataset.fcPseudo = `${layerName(el)}${pseudo}`;
        for (let i = 0; i < cs.length; i++) {
          const prop = cs[i];
          if (prop.startsWith('--') || prop === 'content') continue;
          span.style.setProperty(prop, cs.getPropertyValue(prop));
        }
        const text = /^"(.*)"$/.exec(cs.content);
        if (text)
          span.textContent = text[1].replace(/\\([0-9a-f]{1,6})\s?/gi, (_, h) =>
            String.fromCodePoint(parseInt(h, 16)),
          );
        made.push([pseudo, span]);
      }
      if (!made.length) continue;
      el.setAttribute('data-fc-p', '');
      for (const [pseudo, span] of made) pseudo === '::before' ? el.prepend(span) : el.append(span);
    }
  }

  let nextId = 1;
  const SKIP_TAGS = /^(SCRIPT|STYLE|TEMPLATE|NOSCRIPT|LINK|META)$/;

  function visibleBox(r) {
    return r.width > 0.01 && r.height > 0.01;
  }

  /**
   * Form controls Chrome draws itself (appearance auto, UA border untouched): their computed 2px outset/inset
   * border isn't what shows. Chrome draws 1px, rounded, and a button's border grey (buttonborder computes to
   * black/white). Measured on Chrome's form controls: button 3px radius, #767676 light / #6b6b6b dark border;
   * fields 2px radius, border as computed.
   */
  const NATIVE_BUTTON_BORDER = {
    light: {r: 118, g: 118, b: 118, a: 1},
    dark: {r: 107, g: 107, b: 107, a: 1},
  };
  function nativeControl(el, cs) {
    if (cs.appearance === 'none' || !/^(BUTTON|INPUT|SELECT|TEXTAREA)$/.test(el.tagName))
      return null;
    const styles = ['Top', 'Right', 'Bottom', 'Left'].map(s => cs[`border${s}Style`]);
    const button = el.tagName === 'BUTTON' || /^(button|submit|reset)$/.test(el.type);
    if (button && styles.every(x => x === 'outset')) return 'button';
    if (
      !button &&
      el.type !== 'checkbox' &&
      el.type !== 'radio' &&
      styles.every(x => x === 'inset')
    )
      return 'field';
    return null;
  }

  function nativeToggleSvg(el, w, h) {
    const k = Math.min(w, h) / 13;
    const on = el.checked || el.indeterminate;
    const open = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`;
    if (el.type === 'radio') {
      const c = `cx="${w / 2}" cy="${h / 2}"`;
      const rr = Math.min(w, h) / 2;
      return on
        ? `${open}<circle ${c} r="${rr - 0.5}" fill="#ffffff" stroke="#0075ff"/><circle ${c} r="${rr * 0.55}" fill="#0075ff"/></svg>`
        : `${open}<circle ${c} r="${rr - 0.5}" fill="#ffffff" stroke="#767676"/></svg>`;
    }
    if (!on)
      return `${open}<rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="${2 * k}" fill="#ffffff" stroke="#767676"/></svg>`;
    const mark = el.indeterminate
      ? `M${3 * k} ${6.5 * k}H${10 * k}`
      : `M${2.8 * k} ${6.6 * k}L${5.4 * k} ${9.2 * k}L${10.4 * k} ${3.9 * k}`;
    return `${open}<rect width="${w}" height="${h}" rx="${2 * k}" fill="#0075ff"/><path d="${mark}" fill="none" stroke="#ffffff" stroke-width="${1.8 * k}"/></svg>`;
  }

  /**
   * A CSS triangle: a box without content area whose only visible border side is drawn as the wedge the borders
   * make (the native-select arrow of mat-form-field, menu carets). Returns a polygon layer, or null.
   */
  function cssTriangle(cs, r, paints) {
    if (!paints.border || paints.fill || paints.bgImage || paints.gradient) return null;
    const [bt, br, bb, bl] = ['Top', 'Right', 'Bottom', 'Left'].map(
      s => parseFloat(cs[`border${s}Width`]) || 0,
    );
    const W = r.width,
      H = r.height;
    if (W - bl - br > 0.5 && H - bt - bb > 0.5) return null;
    const sides = paints.border.map((b, i) => (b && b.c.a > 0 ? i : -1)).filter(i => i >= 0);
    if (sides.length !== 1) return null;
    const side = sides[0];
    const pts = [
      [
        [0, 0],
        [W, 0],
        [W - br, bt],
        [bl, bt],
      ],
      [
        [W, 0],
        [W, H],
        [W - br, H - bb],
        [W - br, bt],
      ],
      [
        [0, H],
        [W, H],
        [W - br, H - bb],
        [bl, H - bb],
      ],
      [
        [0, 0],
        [0, H],
        [bl, H - bb],
        [bl, bt],
      ],
    ][side];
    const minX = Math.min(...pts.map(p => p[0])),
      minY = Math.min(...pts.map(p => p[1]));
    const points = pts
      .map(([x, y]) => [round(x - minX), round(y - minY)])
      .filter((p, i, a) => a.findIndex(q => q[0] === p[0] && q[1] === p[1]) === i);
    return {
      type: 'polygon',
      side,
      color: paints.border[side].c,
      points,
      dx: minX,
      dy: minY,
      width: round(Math.max(...points.map(p => p[0]))),
      height: round(Math.max(...points.map(p => p[1]))),
    };
  }

  function paintsOf(el, cs) {
    const out = {};
    const native = nativeControl(el, cs);
    if (native) {
      el.dataset.fcNative = native;
      const bg = parseColor(cs.backgroundColor);
      if (bg) out.fill = bg;
      const c = native === 'button' ? NATIVE_BUTTON_BORDER.light : parseColor(cs.borderTopColor);
      if (c) out.border = [0, 1, 2, 3].map(() => ({w: 1, c, dashed: false}));
      out.nativeRadius = native === 'button' ? 3 : 2;
      return out;
    }
    const bg = parseColor(cs.backgroundColor);
    if (bg) out.fill = bg;
    const sides = ['Top', 'Right', 'Bottom', 'Left'].map(s => {
      const w = parseFloat(cs[`border${s}Width`]) || 0;
      const style = cs[`border${s}Style`];
      const c =
        w && style !== 'none' && style !== 'hidden' ? parseColor(cs[`border${s}Color`]) : null;
      return c ? {w, c, dashed: style === 'dashed' || style === 'dotted'} : null;
    });
    if (sides.some(Boolean)) out.border = sides;
    const sh = shadows(cs.boxShadow);
    if (sh.length) out.effects = sh;
    if (cs.backgroundImage && cs.backgroundImage !== 'none') {
      // A data URL may hold quotes (escaped in the computed value): `url("data:image/svg+xml;utf8,<svg xmlns=\"…\">")`.
      const url =
        /url\("((?:[^"\\]|\\.)*)"\)/.exec(cs.backgroundImage) ??
        /url\(([^)]+)\)/.exec(cs.backgroundImage);
      if (url)
        out.bgImage = {
          src: new URL(url[1].replace(/\\(.)/g, '$1'), location.href).href,
          size: cs.backgroundSize,
          repeat: cs.backgroundRepeat,
          position: cs.backgroundPosition,
        };
      else if (/gradient/.test(cs.backgroundImage)) out.gradient = cs.backgroundImage;
    }
    return out;
  }

  function scalePaints(p, k) {
    if (k === 1 || !p.border) return p;
    return {...p, border: p.border.map(b => b && {...b, w: round(b.w * k)})};
  }

  function radii(cs, w, h, k = 1) {
    const one = v => {
      const parts = v.split(' ');
      const val = parts[0];
      const n = val.endsWith('%')
        ? (parseFloat(val) / 100) * Math.min(w, h)
        : (parseFloat(val) || 0) * k;
      return round(Math.min(n, Math.min(w, h) / 2));
    };
    const r = [
      cs.borderTopLeftRadius,
      cs.borderTopRightRadius,
      cs.borderBottomRightRadius,
      cs.borderBottomLeftRadius,
    ].map(one);
    return r.some(Boolean) ? r : null;
  }

  function textLayer(node, parentRect, cs, owner) {
    const raw = node.textContent;
    const preserve = /^(pre|pre-wrap|break-spaces)$/.test(cs.whiteSpace);
    const text = preserve ? raw : raw.replace(/\s+/g, ' ');
    if (!text.trim()) return null;
    const range = document.createRange();
    range.selectNodeContents(node);
    // Measure the trimmed text: a collapsed leading space still takes room ("icon␣are"), and the layer holds the
    // text without it, so its box must start at the first glyph.
    if (!preserve) {
      range.setStart(node, raw.search(/\S/));
      range.setEnd(node, raw.trimEnd().length);
    }
    const rects = [...range.getClientRects()].filter(visibleBox);
    if (!rects.length) return null;
    const box = range.getBoundingClientRect();
    const color = parseColor(cs.color);
    if (!color) return null;
    const lines = new Set(rects.map(r => Math.round(r.top))).size;
    const k = scaleOf(owner, owner.getBoundingClientRect());
    const lh = px(cs.lineHeight);
    const fid = (owner.dataset.fcId ||= String(nextId++));
    // The range's box is the glyphs' content area; FigCraft places text by its line box, centring the glyphs
    // in it as browsers do (half-leading). Move up by the half-leading so the glyphs land where they were.
    const content = rects[0].height;
    const line = lh === null ? content : lh * k;
    const top = box.top - (line - content) / 2;
    return {
      type: 'text',
      fcId: fid,
      x: round(box.left - parentRect.left),
      y: round(top - parentRect.top),
      width: round(box.width),
      height: round(lines * line),
      characters: preserve ? text : text.trim(),
      fontFamily: firstFamily(cs),
      fontStyle: fontStyle(cs),
      fontWeight: Math.round(parseFloat(cs.fontWeight)),
      fontSize: round(parseFloat(cs.fontSize) * k),
      lineHeight: round(line),
      letterSpacing: round((px(cs.letterSpacing) ?? 0) * k),
      // start/end follow the writing direction (right-to-left text starts on the right).
      textAlign:
        {
          start: cs.direction === 'rtl' ? 'right' : 'left',
          left: 'left',
          center: 'center',
          right: 'right',
          end: cs.direction === 'rtl' ? 'left' : 'right',
          justify: 'justified',
        }[cs.textAlign] || 'left',
      textCase:
        {uppercase: 'upper', lowercase: 'lower', capitalize: 'title'}[cs.textTransform] ||
        'original',
      textDecoration: /underline/.test(cs.textDecorationLine)
        ? 'underline'
        : /line-through/.test(cs.textDecorationLine)
          ? 'strikethrough'
          : 'none',
      wrap: lines > 1,
      color,
      opacity: 1,
    };
  }

  function svgLayer(el, parentRect) {
    const r = el.getBoundingClientRect();
    if (!visibleBox(r)) return null;
    const clone = el.cloneNode(true);
    const src = [el, ...el.querySelectorAll('*')];
    const dst = [clone, ...clone.querySelectorAll('*')];
    const colors = [];
    src.forEach((s, i) => {
      const cs = getComputedStyle(s);
      const d = dst[i];
      for (const p of [
        'fill',
        'stroke',
        'stroke-width',
        'stroke-dasharray',
        'stroke-dashoffset',
        'stroke-linecap',
        'stroke-linejoin',
        'opacity',
        'fill-opacity',
        'stroke-opacity',
        'fill-rule',
        'visibility',
        'display',
      ]) {
        const v = cs.getPropertyValue(p);
        if (v) d.style.setProperty(p, v);
      }
      if (s instanceof SVGGeometryElement && cs.strokeDasharray !== 'none') {
        const dashes = cs.strokeDasharray
          .split(/[ ,]+/)
          .map(parseFloat)
          .filter(n => !isNaN(n));
        const offset = parseFloat(cs.strokeDashoffset) || 0;
        let len = 0;
        try {
          len = s.getTotalLength();
        } catch {}
        if (dashes.length === 1 && len && dashes[0] >= len - 0.5) {
          // One dash as long as the path: drawn fully when the offset is 0, a partial "draw-in" otherwise.
          if (Math.abs(offset) < 0.5) d.style.setProperty('stroke-dasharray', 'none');
          else if (Math.abs(offset) >= len - 0.5) d.style.setProperty('stroke', 'none');
        }
      }
      if (cs.transform && cs.transform !== 'none' && i > 0)
        d.style.setProperty('transform', cs.transform);
      if (cs.transformOrigin && i > 0) d.style.setProperty('transform-origin', cs.transformOrigin);
      colors.push(cs.fill, cs.stroke);
      d.removeAttribute('class');
    });
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.setAttribute('width', String(round(r.width)));
    clone.setAttribute('height', String(round(r.height)));
    clone.style.removeProperty('transform');
    const fid = (el.dataset.fcId ||= String(nextId++));
    return {
      type: 'svg',
      fcId: fid,
      name: layerName(el),
      x: round(r.left - parentRect.left),
      y: round(r.top - parentRect.top),
      width: round(r.width),
      height: round(r.height),
      markup: clone.outerHTML,
      opacity: +getComputedStyle(el).opacity,
    };
  }

  /**
   * Checks whether FigCraft's auto layout would place the children exactly where the browser did.
   * Returns the layout props when it does, otherwise null (the frame keeps absolute positions).
   */
  function verifiedLayout(el, cs, w, h, kids) {
    if (!/flex/.test(cs.display) || cs.flexWrap !== 'nowrap' || kids.length === 0) return null;
    if (kids.some(k => k.absolute)) return null;
    const row = cs.flexDirection === 'row';
    if (!row && cs.flexDirection !== 'column') return null;
    const pad = ['Top', 'Right', 'Bottom', 'Left'].map(
      s => (parseFloat(cs[`padding${s}`]) || 0) + (parseFloat(cs[`border${s}Width`]) || 0),
    );
    const mainStart = row ? pad[3] : pad[0];
    const mainEnd = row ? pad[1] : pad[2];
    const crossStart = row ? pad[0] : pad[3];
    const crossEnd = row ? pad[2] : pad[1];
    const mainSize = row ? w : h;
    const crossSize = row ? h : w;
    const pos = k => (row ? k.x : k.y);
    const size = k => (row ? k.width : k.height);
    const cpos = k => (row ? k.y : k.x);
    const csize = k => (row ? k.height : k.width);
    const sorted = [...kids].sort((a, b) => pos(a) - pos(b));
    if (sorted.some((k, i) => k !== kids[i])) return null; // visual order differs from DOM order (order, *-reverse)
    const total = sorted.reduce((s, k) => s + size(k), 0);
    const gaps = sorted.slice(1).map((k, i) => pos(k) - (pos(sorted[i]) + size(sorted[i])));
    const gap = gaps.length ? gaps[0] : 0;
    if (gaps.some(g => Math.abs(g - gap) > EPS) || gap < -EPS) return null;
    const used = total + gap * gaps.length;
    const free = mainSize - mainStart - mainEnd - used;
    const jc = cs.justifyContent;
    let mainAlign = 'min';
    let start = mainStart;
    if (/center/.test(jc)) {
      mainAlign = 'center';
      start = mainStart + free / 2;
    } else if (/(flex-)?end|right/.test(jc)) {
      mainAlign = 'max';
      start = mainStart + free;
    } else if (jc === 'space-between' && sorted.length > 1) {
      mainAlign = 'spaceBetween';
      start = mainStart;
    }
    if (mainAlign !== 'spaceBetween' && Math.abs(pos(sorted[0]) - start) > EPS) {
      // A single child placed by margins: try the other alignments before giving up.
      const tries = [
        ['min', mainStart],
        ['center', mainStart + free / 2],
        ['max', mainStart + free],
      ];
      const hit = tries.find(([, s]) => Math.abs(pos(sorted[0]) - s) <= EPS);
      if (!hit) return null;
      [mainAlign, start] = hit;
    }
    const crossInner = crossSize - crossStart - crossEnd;
    const crossAligns = ['min', 'center', 'max'];
    const crossOf = (a, k) =>
      a === 'min'
        ? crossStart
        : a === 'center'
          ? crossStart + (crossInner - csize(k)) / 2
          : crossStart + crossInner - csize(k);
    const crossAlign = crossAligns.find(a =>
      sorted.every(k => Math.abs(cpos(k) - crossOf(a, k)) <= EPS),
    );
    if (!crossAlign) return null;
    const natMain = mainStart + used + mainEnd;
    const natCross = crossStart + Math.max(...sorted.map(csize)) + crossEnd;
    const hugMain = Math.abs(natMain - mainSize) <= EPS && mainAlign !== 'spaceBetween';
    const hugCross = Math.abs(natCross - crossSize) <= EPS;
    return {
      layout: row ? 'horizontal' : 'vertical',
      gap: round(mainAlign === 'spaceBetween' ? 0 : gap),
      padding: pad.map(round),
      mainAlign,
      crossAlign,
      sizingH: (row ? hugMain : hugCross) ? 'hug' : 'fixed',
      sizingV: (row ? hugCross : hugMain) ? 'hug' : 'fixed',
    };
  }

  /** CSS paint order inside a stacking context: negative z, in-flow, positioned (z auto/0), positive z. */
  function paintKey(cs) {
    const positioned = cs.position !== 'static';
    const z = cs.zIndex === 'auto' ? 0 : parseInt(cs.zIndex, 10) || 0;
    if (z < 0) return [-1, z];
    if (z > 0 && (positioned || /flex|grid/.test(cs.display))) return [2, z];
    return [positioned ? 1 : 0, 0];
  }
  const withKey = (layers, cs) => layers.map(l => (l.pk ? l : {...l, pk: paintKey(cs)}));

  /** The box an absolutely (or fixed) positioned element is placed in; null for the viewport. */
  function containingBlock(el, position) {
    for (let p = el.parentElement; p; p = p.parentElement) {
      const cs = getComputedStyle(p);
      if (position === 'absolute' && cs.position !== 'static') return p;
      if (
        cs.transform !== 'none' ||
        cs.filter !== 'none' ||
        cs.perspective !== 'none' ||
        /paint|layout|strict|content/.test(cs.contain) ||
        /transform|filter/.test(cs.willChange)
      )
        return p;
    }
    return null;
  }

  /**
   * Layers of an absolutely positioned element remember its containing block (`esc`): `overflow` clips such an
   * element only when the clipping box is that block or inside it (an MDC chip's outline is the `::before` of its
   * clipped action, placed in the whole chip).
   */
  let rootSet = new Set();

  function walk(el, parentRect) {
    const out = walkBox(el, parentRect);
    if (!(el instanceof HTMLElement) || !out.length) return out;
    const position = getComputedStyle(el).position;
    if (position !== 'absolute' && position !== 'fixed') return out;
    const cb = containingBlock(el, position);
    for (const l of out)
      if (l.esc === undefined || l.esc === el || (l.esc && el.contains(l.esc))) l.esc = cb;
    return out;
  }

  function walkBox(el, parentRect) {
    if (SKIP_TAGS.test(el.tagName)) return [];
    // An open popover (a CDK overlay rendered inline, e.g. the mat-select panel) sits in the top layer: it is
    // serialized as a root of its own, like the panes of the overlay container.
    if (!rootSet.has(el) && el.matches?.(':popover-open')) return [];
    if (el instanceof SVGElement && el.tagName.toLowerCase() !== 'svg') return [];
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || parseFloat(cs.opacity) === 0) return [];
    if (el.tagName === 'svg')
      return cs.visibility === 'hidden'
        ? []
        : withKey([svgLayer(el, parentRect)].filter(Boolean), cs);
    const hidden = cs.visibility === 'hidden';
    const r = el.getBoundingClientRect();

    // Native checkboxes and radios have no CSS box to read: Chrome draws them (accent #0075ff, border #767676).
    if (el.tagName === 'INPUT' && /^(checkbox|radio)$/.test(el.type) && cs.appearance !== 'none') {
      if (hidden || !visibleBox(r)) return [];
      return withKey(
        [
          {
            type: 'svg',
            fcId: (el.dataset.fcId ||= String(nextId++)),
            name: `input[type=${el.type}]`,
            x: round(r.left - parentRect.left),
            y: round(r.top - parentRect.top),
            width: round(r.width),
            height: round(r.height),
            opacity: el.disabled ? 0.45 : 1,
            markup: nativeToggleSvg(el, r.width, r.height),
          },
        ],
        cs,
      );
    }

    if (el.tagName === 'IMG') {
      if (hidden || !visibleBox(r)) return [];
      return withKey(
        [
          {
            type: 'image',
            fcId: (el.dataset.fcId ||= String(nextId++)),
            name: layerName(el),
            src: el.currentSrc || el.src,
            x: round(r.left - parentRect.left),
            y: round(r.top - parentRect.top),
            width: round(r.width),
            height: round(r.height),
            radius: radii(cs, r.width, r.height),
            fit: cs.objectFit,
            opacity: +cs.opacity,
          },
        ],
        cs,
      );
    }

    // A clipping box without area (a collapsed wrapper, overflow: hidden) shows none of its content.
    if (/hidden|clip|auto|scroll/.test(cs.overflowX + cs.overflowY) && !visibleBox(r)) return [];
    const paints = hidden ? {} : paintsOf(el, cs);
    const triangle = !hidden && !el.children.length && cssTriangle(cs, r, paints);
    if (triangle)
      return withKey(
        [
          {
            ...triangle,
            fcId: (el.dataset.fcId ||= String(nextId++)),
            name: layerName(el),
            x: round(r.left - parentRect.left + triangle.dx),
            y: round(r.top - parentRect.top + triangle.dy),
            opacity: +cs.opacity,
          },
        ],
        cs,
      );
    const hasVisual = !!(
      paints.fill ||
      paints.border ||
      paints.effects ||
      paints.bgImage ||
      paints.gradient
    );
    const clips = /hidden|clip|auto|scroll/.test(cs.overflowX + cs.overflowY) && visibleBox(r);
    const kids = [];
    // Children are positioned relative to this element's box when it becomes a frame; decided after.
    for (const child of el.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) {
        if (hidden) continue;
        const t = textLayer(child, r, cs, el);
        if (t) kids.push(t);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        kids.push(...walk(child, r));
      }
    }
    for (const k of kids) {
      const kcs = k.el ? getComputedStyle(k.el) : null;
      k.absolute = kcs ? /absolute|fixed/.test(kcs.position) : false;
      k.pk ??= [0, 0];
    }
    const paintOrder = () => {
      // Draw order follows CSS paint order, not DOM order (e.g. an ::after surface behind a positioned icon).
      const order = kids
        .map((k, i) => [k, i])
        .sort((a, b) => a[0].pk[0] - b[0].pk[0] || a[0].pk[1] - b[0].pk[1] || a[1] - b[1])
        .map(x => x[0]);
      if (order.some((k, i) => k !== kids[i])) kids.splice(0, kids.length, ...order);
    };
    // Native form controls draw their own text; their value shows as a text layer.
    // A <select> shows its selected option; a <textarea> wraps from the top.
    const shown = el.tagName === 'SELECT' ? (el.selectedOptions?.[0]?.text ?? '') : el.value;
    const area = el.tagName === 'TEXTAREA';
    if (
      /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) &&
      !hidden &&
      shown &&
      !/checkbox|radio|range|hidden/.test(el.type)
    ) {
      const color = parseColor(cs.color);
      const pad = ['Top', 'Left'].map(
        s => (parseFloat(cs[`padding${s}`]) || 0) + (parseFloat(cs[`border${s}Width`]) || 0),
      );
      const lh = px(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2;
      if (color)
        kids.push({
          type: 'text',
          fcId: (el.dataset.fcId ||= String(nextId++)),
          x: pad[1],
          y: area ? pad[0] : round((r.height - lh) / 2),
          width: round(r.width - pad[1] * 2),
          height: area ? round(r.height - pad[0] * 2) : lh,
          characters: shown,
          fontFamily: firstFamily(cs),
          fontStyle: fontStyle(cs),
          fontSize: parseFloat(cs.fontSize),
          lineHeight: px(cs.lineHeight) ?? 'auto',
          letterSpacing: px(cs.letterSpacing) ?? 0,
          textAlign: 'left',
          textCase: 'original',
          textDecoration: 'none',
          wrap: area,
          color,
          opacity: 1,
        });
    } else if (
      (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') &&
      !hidden &&
      !el.value &&
      el.placeholder
    ) {
      const ph = getComputedStyle(el, '::placeholder');
      const color = parseColor(ph.color);
      const pad = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.borderLeftWidth) || 0);
      const lh = px(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2;
      if (color && parseFloat(ph.opacity) > 0)
        kids.push({
          type: 'text',
          fcId: (el.dataset.fcId ||= String(nextId++)),
          name: 'placeholder',
          x: pad,
          y: round((r.height - lh) / 2),
          width: round(r.width - pad * 2),
          height: lh,
          characters: el.placeholder,
          fontFamily: firstFamily(ph),
          fontStyle: fontStyle(ph),
          fontSize: parseFloat(ph.fontSize),
          lineHeight: lh,
          letterSpacing: px(ph.letterSpacing) ?? 0,
          textAlign: 'left',
          textCase: 'original',
          textDecoration: 'none',
          wrap: false,
          color,
          opacity: 1,
          placeholder: true,
        });
    }

    // Absolutely positioned content placed outside this box isn't clipped by it: it leaves the frame.
    let escaped = [];
    if (clips) {
      escaped = kids.filter(
        k => k.esc !== undefined && k.esc !== el && !(k.esc && el.contains(k.esc)),
      );
      if (escaped.length) kids.splice(0, kids.length, ...kids.filter(k => !escaped.includes(k)));
    }
    const lift = list =>
      list.map(k => ({
        ...k,
        x: round(k.x + r.left - parentRect.left),
        y: round(k.y + r.top - parentRect.top),
      }));

    const isHost = el.tagName.includes('-') || el.hasAttribute('data-prism-subject');
    const keep =
      visibleBox(r) &&
      (hasVisual ||
        ((clips || isHost || parseFloat(cs.opacity) < 1) && kids.length > 0) ||
        kids.length > 1);
    if (!keep) {
      // Flatten: re-base the children onto the parent's box.
      // An element without a box of its own passes its stacking position on to what it contains.
      paintOrder();
      const own = paintKey(cs);
      return [
        ...lift(kids).map(k => ({...k, pk: own[0] || own[1] ? own : k.pk})),
        ...lift(escaped),
      ];
    }
    const fid = (el.dataset.fcId ||= String(nextId++));
    const frame = {
      type: 'frame',
      fcId: fid,
      name: layerName(el),
      el,
      x: round(r.left - parentRect.left),
      y: round(r.top - parentRect.top),
      width: round(r.width),
      height: round(r.height),
      opacity: +cs.opacity,
      clip: clips,
      // A native control keeps Chrome's own radius unless the CSS rounds it (Chrome then clips its look to that).
      radius:
        radii(cs, r.width, r.height, scaleOf(el, r)) ??
        (paints.nativeRadius ? [0, 1, 2, 3].map(() => paints.nativeRadius) : null),
      ...scalePaints(paints, scaleOf(el, r)),
      children: kids,
    };
    if (isHost && el.hasAttribute('data-prism-subject')) frame.subject = true;
    const layout = verifiedLayout(el, cs, r.width, r.height, kids);
    // Auto layout places children in list order, so only frames without it are re-stacked.
    if (layout) Object.assign(frame, layout);
    else paintOrder();
    frame.pk = paintKey(cs);
    // A rotated box without children (a CSS check mark, a chevron): its own size, turned around its centre.
    const m = /^matrix\(([^)]+)\)$/.exec(cs.transform);
    if (m && !kids.length && el.offsetWidth) {
      const [a, b] = m[1].split(',').map(Number);
      const theta = Math.atan2(b, a);
      if (Math.abs(theta) > 0.01) {
        const k =
          Math.hypot(a, b) *
          (scaleOf(el.parentElement ?? el, (el.parentElement ?? el).getBoundingClientRect()) || 1);
        const w = el.offsetWidth * k,
          h = el.offsetHeight * k;
        const cx = r.left + r.width / 2,
          cy = r.top + r.height / 2;
        // FigCraft turns a new layer around its centre, counter-clockwise for positive angles.
        frame.x = round(cx - w / 2 - parentRect.left);
        frame.y = round(cy - h / 2 - parentRect.top);
        frame.width = round(w);
        frame.height = round(h);
        frame.rotation = round((-theta * 180) / Math.PI);
        frame.radius = radii(cs, w, h, k);
      }
    }
    return [frame, ...lift(escaped)];
  }

  function strip(node) {
    delete node.el;
    delete node.pk;
    delete node.esc;
    node.children?.forEach(strip);
    return node;
  }

  /** Page-space bounds of what the layers paint (clipped frames cut their children off). */
  function bounds(layers, ox, oy, acc) {
    for (const l of layers) {
      const x = ox + l.x,
        y = oy + l.y;
      acc.push([x, y, x + l.width, y + l.height]);
      if (l.children && !l.clip) bounds(l.children, x, y, acc);
    }
    return acc;
  }

  window.__fcSerialize = input => {
    // ng-prism wraps a showcase in an anonymous host component; its children are the real roots.
    const roots = input.flatMap(r => (r.tagName === 'NG-COMPONENT' ? [...r.children] : [r]));
    roots.forEach(materializePseudos);
    rootSet = new Set(roots);
    const children = roots.flatMap(root => walk(root, {left: 0, top: 0})).map(strip);
    const b = bounds(children, 0, 0, []);
    if (!b.length) return {width: 0, height: 0, box: null, children: []};
    const left = Math.min(...b.map(x => x[0])),
      top = Math.min(...b.map(x => x[1]));
    const right = Math.max(...b.map(x => x[2])),
      bottom = Math.max(...b.map(x => x[3]));
    for (const c of children) {
      c.x = round(c.x - left);
      c.y = round(c.y - top);
    }
    return {
      width: round(right - left),
      height: round(bottom - top),
      box: {x: left, y: top, width: right - left, height: bottom - top},
      children,
    };
  };

  /** Shows the page as it was: the real pseudo-elements again, the measured stand-ins hidden. */
  window.__fcRestore = () => {
    document.querySelectorAll('style[data-fc-pseudo-off]').forEach(s => s.remove());
    document
      .querySelectorAll('[data-fc-pseudo]')
      .forEach(s => s.style.setProperty('display', 'none', 'important'));
  };

  /** Colours per serialized element, for the second (dark) pass over the same DOM. */
  window.__fcColors = () => {
    const out = {};
    for (const el of document.querySelectorAll('[data-fc-id]')) {
      // A materialized pseudo-element holds literal light values; the real pseudo still follows the scheme.
      const pseudo = el.dataset.fcPseudo;
      const cs = pseudo
        ? getComputedStyle(el.parentElement, pseudo.endsWith('::before') ? '::before' : '::after')
        : getComputedStyle(el);
      const entry = {text: parseColor(cs.color), fill: parseColor(cs.backgroundColor)};
      entry.border = ['Top', 'Right', 'Bottom', 'Left'].map(s => parseColor(cs[`border${s}Color`]));
      if (el.dataset.fcNative === 'button')
        entry.border = entry.border.map(() => NATIVE_BUTTON_BORDER.dark);
      entry.effects = shadows(cs.boxShadow).map(s => s.color);
      if (el.tagName === 'svg')
        entry.svg = [el, ...el.querySelectorAll('*')].flatMap(s => [
          getComputedStyle(s).fill,
          getComputedStyle(s).stroke,
        ]);
      if (el.placeholder)
        entry.placeholder = parseColor(getComputedStyle(el, '::placeholder').color);
      out[el.dataset.fcId] = entry;
    }
    return out;
  };

  /** The theme's system tokens, resolved in the current colour scheme. */
  window.__fcTokens = () => {
    const names = new Set();
    for (const sheet of document.styleSheets) {
      let rules;
      try {
        rules = sheet.cssRules;
      } catch {
        continue;
      }
      const visit = list => {
        for (const rule of list) {
          if (rule.style)
            for (let i = 0; i < rule.style.length; i++)
              if (rule.style[i].startsWith('--mat-sys-')) names.add(rule.style[i]);
          if (rule.cssRules) visit(rule.cssRules);
        }
      };
      visit(rules);
    }
    const probe = document.createElement('div');
    document.body.appendChild(probe);
    const root = getComputedStyle(document.documentElement);
    const out = {colors: {}, raw: {}};
    for (const name of [...names].sort()) {
      const raw = root.getPropertyValue(name).trim();
      out.raw[name] = raw;
      probe.style.color = '';
      probe.style.color = `var(${name})`;
      if (
        /color|light-dark|^#|rgb|hsl|oklch/.test(raw) ||
        /-(primary|secondary|tertiary|error|surface|outline|shadow|scrim|background|inverse)/.test(
          name,
        )
      ) {
        const c = parseColor(getComputedStyle(probe).color);
        if (c && !/font|weight|size|line-height|tracking|corner|level|shape/.test(name))
          out.colors[name.slice('--mat-sys-'.length)] = c;
      }
    }
    probe.remove();
    return out;
  };
})();
