// Reads, per serialized element, the CSS declaration that wins for the properties the library binds to
// tokens (colours, radius, shadow, typography), through the Chrome DevTools Protocol's matched styles.
// The values keep their `var(--mat-<component>-<token>, var(--mat-sys-<role>))` chains, which the builder
// turns into FigCraft variables named like the code.

/** CSS system colours: the browser resolves them per `color-scheme` (native buttons, inputs, the canvas). */
export const SYSTEM_COLOR =
  /^(accentcolor|accentcolortext|activetext|buttonborder|buttonface|buttontext|canvas|canvastext|field|fieldtext|graytext|highlight|highlighttext|linktext|mark|marktext|selecteditem|selecteditemtext|visitedtext)$/i;

const FRAME_PROPS = [
  'background-color',
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
  'border-top-left-radius',
  'border-top-right-radius',
  'border-bottom-right-radius',
  'border-bottom-left-radius',
  'box-shadow',
];
const TEXT_PROPS = [
  'color',
  'font-size',
  'line-height',
  'font-weight',
  'letter-spacing',
  'font-family',
  'font',
];
const INHERITED = new Set([
  'color',
  'font-size',
  'line-height',
  'font-weight',
  'letter-spacing',
  'font-family',
  'font',
  'fill',
  'stroke',
]);
const SHORTHANDS = {
  'background-color': ['background'],
  'border-top-color': ['border-top', 'border-color', 'border'],
  'border-right-color': ['border-right', 'border-color', 'border'],
  'border-bottom-color': ['border-bottom', 'border-color', 'border'],
  'border-left-color': ['border-left', 'border-color', 'border'],
  'border-top-left-radius': ['border-radius'],
  'border-top-right-radius': ['border-radius'],
  'border-bottom-right-radius': ['border-radius'],
  'border-bottom-left-radius': ['border-radius'],
  'font-size': ['font'],
  'line-height': ['font'],
  'font-weight': ['font'],
  'font-family': ['font'],
};

/** The winning declared value of `prop` in one list of style sources (highest priority last). */
function winning(styles, prop) {
  for (const important of [true, false]) {
    for (let i = styles.length - 1; i >= 0; i--) {
      const props = styles[i]?.cssProperties ?? [];
      for (let j = props.length - 1; j >= 0; j--) {
        const p = props[j];
        if (p.name !== prop || p.disabled || p.parsedOk === false) continue;
        if (!!p.important !== important) continue;
        if (p.value === undefined) continue;
        return p.value;
      }
    }
  }
  return undefined;
}

/** Style sources of a node, lowest priority first: matched rules, then the inline style. */
const sourcesOf = (m) =>
  [...(m.matchedCSSRules ?? []).map((r) => r.rule.style), m.inlineStyle].filter(
    Boolean,
  );

function resolve(prop, own, inherited) {
  const chain = [own, ...(INHERITED.has(prop) ? inherited : [])];
  for (const styles of chain) {
    for (const name of [prop, ...(SHORTHANDS[prop] ?? [])]) {
      const v = winning(styles, name);
      if (v === undefined || v === '') continue;
      if (name !== prop && !/var\(|color-mix\(/.test(v)) continue; // a literal shorthand: nothing to bind
      return name === prop ? v : `${name}: ${v}`;
    }
  }
  return undefined;
}

export async function declarations(page) {
  const client = await page.context().newCDPSession(page);
  try {
    await client.send('DOM.enable');
    await client.send('CSS.enable');
    const { root } = await client.send('DOM.getDocument', {
      depth: -1,
      pierce: false,
    });
    const { nodeIds } = await client.send('DOM.querySelectorAll', {
      nodeId: root.nodeId,
      selector: '[data-fc-id]',
    });
    const out = {};
    const cache = new Map();
    const parents = new Map();
    const index = (n) =>
      (n.children ?? []).forEach(
        (c) => (parents.set(c.nodeId, n.nodeId), index(c)),
      );
    index(root);
    const matched = async (nodeId) => {
      if (!cache.has(nodeId))
        cache.set(
          nodeId,
          await client.send('CSS.getMatchedStylesForNode', { nodeId }),
        );
      return cache.get(nodeId);
    };
    for (const nodeId of nodeIds) {
      try {
        await readNode(nodeId);
      } catch {
        // A node the protocol can't match (detached, inside a closed shadow root): it keeps literal colours.
      }
    }
    return out;

    async function readNode(nodeId) {
      const { attributes } = await client.send('DOM.getAttributes', { nodeId });
      const attrs = {};
      for (let i = 0; i < attributes.length; i += 2)
        attrs[attributes[i]] = attributes[i + 1];
      const fcId = attrs['data-fc-id'];
      const { node } = await client.send('DOM.describeNode', {
        nodeId,
        depth: -1,
      });
      let m = await matched(nodeId);
      let own = sourcesOf(m);
      let inherited = (m.inherited ?? []).map(sourcesOf);
      // Materialized pseudo-elements carry literal inline copies; their rules sit on the parent element.
      if (attrs['data-fc-pseudo']) {
        const pseudo = attrs['data-fc-pseudo'].endsWith('::before')
          ? 'before'
          : 'after';
        const parentId = parents.get(nodeId);
        if (!parentId) return;
        const pm = await matched(parentId);
        const pe = (pm.pseudoElements ?? []).find(
          (p) => p.pseudoType === pseudo,
        );
        own = pe ? pe.matches.map((x) => x.rule.style) : [];
        inherited = [sourcesOf(pm), ...(pm.inherited ?? []).map(sourcesOf)];
      }
      const entry = {};
      for (const prop of [...FRAME_PROPS, ...TEXT_PROPS]) {
        let v = resolve(prop, own, inherited);
        // `var(--mat-icon-color, inherit)`: unset, the token falls back to what the parent declares.
        for (
          let i = 0;
          v !== undefined && /inherit\)?\s*$/.test(v) && i < inherited.length;
          i++
        )
          v = resolve(prop, inherited[i], inherited.slice(i + 1));
        if (
          v !== undefined &&
          (/var\(|color-mix\(|currentcolor/i.test(v) ||
            SYSTEM_COLOR.test(v.trim()))
        )
          entry[prop] = v;
      }
      if (node.nodeName.toLowerCase() === 'svg') {
        // fill/stroke per SVG element, in document order (the same order serialize-dom.js inlines them).
        const ids = [
          nodeId,
          ...(
            await client.send('DOM.querySelectorAll', { nodeId, selector: '*' })
          ).nodeIds,
        ];
        entry.svg = [];
        for (const id of ids) {
          const sm = await matched(id);
          const s = sourcesOf(sm),
            inh = (sm.inherited ?? []).map(sourcesOf);
          entry.svg.push(
            resolve('fill', s, inh) ?? null,
            resolve('stroke', s, inh) ?? null,
          );
        }
        if (
          entry.svg.every(
            (x) => !x || !/var\(|color-mix\(|currentcolor/i.test(x),
          )
        )
          delete entry.svg;
        else entry.svgColor = resolve('color', own, inherited);
      }
      // The font the browser really drew the text with (a generic `sans-serif` or a missing `Arial` resolve to an
      // installed face); the builder uses it when the declared family isn't available to FigCraft.
      if (
        (node.children ?? []).some(
          (c) => c.nodeType === 3 && c.nodeValue.trim(),
        )
      ) {
        const { fonts } = await client.send('CSS.getPlatformFontsForNode', {
          nodeId,
        });
        const main = [...(fonts ?? [])].sort(
          (a, b) => b.glyphCount - a.glyphCount,
        )[0];
        if (main) entry.platformFont = main.familyName;
      }
      if (Object.keys(entry).length) out[fcId] = entry;
    }
  } finally {
    await client.detach().catch(() => {});
  }
}
