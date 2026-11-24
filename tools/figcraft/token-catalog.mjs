// The component tokens Angular Material defines, read from the installed package's Sass sources:
// `@angular/material/**/_<x>-theme.scss` declares `namespace: <ns>` for `m3-<file>.get-tokens()`, and
// `_m3-<file>.scss` lists the tokens (`<ns>-<key>: <value>`). A token is customised in code with
// `@include mat.<ns>-overrides((<key>: value))` and read as the CSS variable `--mat-<ns>-<key>`.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, walk } from './lib.mjs';

/** token name without `--mat-` -> {namespace, key, mixin} */
export function tokenCatalog() {
  const root = path.join(ROOT, 'node_modules/@angular/material');
  const files = [...walk(root)].filter((f) => f.endsWith('.scss'));
  const m3Files = new Map(
    files
      .filter((f) => /\/_m3-[\w-]+\.scss$/.test(f))
      .map((f) => [path.basename(f).slice(4, -5), f]),
  );
  const catalog = {};
  for (const f of files.filter((f) => /-theme\.scss$/.test(f))) {
    const text = fs.readFileSync(f, 'utf8');
    for (const m of text.matchAll(
      /namespace:\s*([\w-]+),\s*tokens:\s*token-utils\.get-overrides\(\s*m3-([\w-]+)\.get-tokens\(/g,
    )) {
      const [, ns, m3] = m;
      const m3File = m3Files.get(m3);
      if (!m3File) continue;
      const src = fs.readFileSync(m3File, 'utf8');
      for (const t of src.matchAll(/^\s+([a-z][a-z0-9-]*):/gm)) {
        const token = t[1];
        if (!token.startsWith(`${ns}-`)) continue;
        catalog[token] ??= {
          namespace: ns,
          key: token.slice(ns.length + 1),
          mixin: `mat.${ns}-overrides`,
        };
      }
    }
  }
  return catalog;
}
