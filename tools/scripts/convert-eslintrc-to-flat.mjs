#!/usr/bin/env node
// One-off helper: converts the (regular) per-project .eslintrc.json files of this workspace to flat
// config (eslint.config.mjs) for ESLint v9. Root eslint.config.mjs must already exist.
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';

const root = execSync('git rev-parse --show-toplevel').toString().trim();
const files = execSync('git ls-files', { cwd: root, maxBuffer: 1 << 28 })
  .toString()
  .split('\n')
  .filter((f) => /(^|\/)\.eslintrc\.json$/.test(f) && f !== '.eslintrc.json');

const q = (s) => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
const lit = (v, ind = 2) => JSON.stringify(v, null, 2).replace(/"([^"\n]+)":/g, (m, k) => (/^[A-Za-z_$][\w$]*$/.test(k) ? `${k}:` : `${q(k)}:`)).replace(/"((?:[^"\\]|\\.)*)"/g, (m, s) => q(JSON.parse(`"${s}"`))).split('\n').join('\n' + ' '.repeat(ind));
const normFile = (p) => {
  if (p.startsWith('./')) return p.slice(2);
  return p.startsWith('**') || p.includes('/') ? p : `**/${p}`;
};

for (const f of files) {
  const dir = dirname(f);
  const rc = JSON.parse(readFileSync(join(root, f), 'utf8'));
  const ext = rc.extends?.[0];
  if (!ext) throw new Error(`no extends: ${f}`);
  const baseRel = join(dirname(ext), 'eslint.config.mjs').replace(/^(?!\.)/, './');
  const target = join(root, dir, baseRel);
  if (!existsSync(target) && !files.includes(relative(root, join(root, dir, ext)))) throw new Error(`missing base for ${f}`);
  const ignores = [];
  const ign = join(root, dir, '.eslintignore');
  if (existsSync(ign)) ignores.push(...readFileSync(ign, 'utf8').split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#')));
  for (const p of rc.ignorePatterns ?? []) if (p !== '!**/*' && !ignores.includes(p)) ignores.push(p);
  let usesNx = false, usesJsonc = false;
  const entries = [];
  for (const o of rc.overrides ?? []) {
    const exts = [].concat(o.extends ?? []);
    const hasRules = o.rules && Object.keys(o.rules).length;
    for (const e of exts) {
      if (e === 'plugin:@nx/angular') { usesNx = true; entries.push("...nx.configs['flat/angular']"); }
      else if (e === 'plugin:@nx/angular-template') { usesNx = true; entries.push("...nx.configs['flat/angular-template']"); }
      else if (e === 'plugin:@angular-eslint/template/process-inline-templates') { /* part of flat/angular */ }
      else throw new Error(`unhandled extends ${e} in ${f}`);
    }
    if (!hasRules && !o.parser) continue;
    const obj = { files: [].concat(o.files).map(normFile) };
    if (hasRules) obj.rules = o.rules;
    let parserLine = '';
    if (o.parser === 'jsonc-eslint-parser') { usesJsonc = true; parserLine = true; }
    else if (o.parser) throw new Error(`unhandled parser ${o.parser} in ${f}`);
    let s = lit(obj, 2);
    if (parserLine) s = s.replace(/\n\s*}$/, `,\n    languageOptions: {\n      parser: jsoncEslintParser,\n    },\n  }`.replace(/^/, ''));
    entries.push(s);
  }
  if (ignores.length) entries.push(lit({ ignores: ignores.map((i) => (/[*!]/.test(i) ? i : `${i.replace(/\/$/, '')}/**`)) }, 2));
  const out = [
    ...(usesNx ? ["import nx from '@nx/eslint-plugin';"] : []),
    ...(usesJsonc ? ["import jsoncEslintParser from 'jsonc-eslint-parser';"] : []),
    `import baseConfig from '${baseRel}';`,
    '',
    'export default [',
    '  ...baseConfig,',
    ...entries.map((e) => `  ${e},`),
    '];',
    '',
  ].join('\n');
  writeFileSync(join(root, dir, 'eslint.config.mjs'), out);
  rmSync(join(root, f));
  if (existsSync(ign)) rmSync(ign);
}
console.log(`converted ${files.length} configs`);
