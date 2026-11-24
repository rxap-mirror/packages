// Run with: pnpm test:scripts   (node --test, no extra dependencies)
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative } from 'node:path';
import { after, before, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { findOffenders } from './check-dist-for-ng-prism.mjs';

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), 'check-dist-for-ng-prism.mjs');
const IMPORT = "import { Showcase } from '@ng-prism/core';";

let root;

function write(file, content) {
  const path = join(root, file);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

/** the offending files below `dir`, relative to the temp workspace */
function offenders(dir) {
  return findOffenders(join(root, dir)).map((file) => relative(root, file)).sort();
}

before(() => {
  root = mkdtempSync(join(tmpdir(), 'check-dist-ng-prism-'));
});

after(() => {
  rmSync(root, { recursive: true, force: true });
});

describe('findOffenders: real leaks are reported', () => {
  it('reports compiled code that imports @ng-prism', () => {
    write('dist/packages/leak/fesm2022/leak.mjs', IMPORT);
    write('dist/packages/leak/types/leak.d.ts', `${IMPORT}\nexport {};`);
    write('dist/packages/leak/package.json', '{"dependencies":{"@ng-prism/core":"1.0.0"}}');
    assert.deepEqual(offenders('dist/packages/leak'), [
      'dist/packages/leak/fesm2022/leak.mjs',
      'dist/packages/leak/package.json',
      'dist/packages/leak/types/leak.d.ts',
    ]);
  });

  it('reports a leak in a directory that is merely named like an allowed one', () => {
    write('dist/packages/leak2/fesm2022/compodoc-helper.mjs', IMPORT);
    write('dist/packages/leak2/src/generators/fix-dependencies/generator.js', IMPORT);
    assert.deepEqual(offenders('dist/packages/leak2'), [
      'dist/packages/leak2/fesm2022/compodoc-helper.mjs',
      'dist/packages/leak2/src/generators/fix-dependencies/generator.js',
    ]);
  });

  it('does not report a clean package', () => {
    write('dist/packages/clean/fesm2022/clean.mjs', "import { Component } from '@angular/core';");
    assert.deepEqual(offenders('dist/packages/clean'), []);
  });
});

describe('findOffenders: known false positives are ignored', () => {
  // regression: the release was aborted because of these (compodoc search index + generator string literals)
  it('ignores compodoc output, which embeds the original source as search text', () => {
    write('dist/packages/angular/forms/compodoc/js/search/search_index.js', `var s = "${IMPORT}";`);
    write('dist/packages/angular/forms/fesm2022/forms.mjs', "export const a = 1;");
    assert.deepEqual(offenders('dist/packages/angular/forms'), []);
  });

  it('ignores typedoc output', () => {
    write('dist/packages/utils/typedoc/assets/search.js', `var s = "${IMPORT}";`);
    assert.deepEqual(offenders('dist/packages/utils'), []);
  });

  it('ignores the ng-prism plugin generators (string literal of the dev dependency to add)', () => {
    write('dist/packages/plugin/ng-prism/src/generators/init/generator.js', "AddPackageJsonDevDependency(tree, '@ng-prism/core');");
    write('dist/packages/plugin/ng-prism/src/generators/init-library/init-project.js', "'@ng-prism/core'");
    assert.deepEqual(offenders('dist/packages/plugin/ng-prism'), []);
  });

  it('ignores the plugin-library fix-dependencies generator', () => {
    write('dist/packages/plugin/library/src/generators/fix-dependencies/generator.js', "const BLOCKED = ['@ng-prism/core'];");
    assert.deepEqual(offenders('dist/packages/plugin/library'), []);
  });

  it('still reports a leak in the plugin code outside the allowed generators', () => {
    write('dist/packages/plugin/ng-prism/src/executors/run.js', IMPORT);
    assert.deepEqual(offenders('dist/packages/plugin/ng-prism'), ['dist/packages/plugin/ng-prism/src/executors/run.js']);
  });
});

describe('CLI', () => {
  const run = (...args) => spawnSync(process.execPath, [SCRIPT, ...args], { encoding: 'utf-8' });

  it('exits 0 for a clean directory', () => {
    write('dist/cli-clean/a.mjs', 'export {};');
    const result = run(join(root, 'dist/cli-clean'));
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /no @ng-prism reference in 1 built package/);
  });

  it('exits 1 and lists the file for a leaking directory', () => {
    write('dist/cli-leak/a.mjs', IMPORT);
    const result = run(join(root, 'dist/cli-leak'));
    assert.equal(result.status, 1);
    assert.match(result.stderr, /cli-leak\/a\.mjs/);
  });

  it('exits 0 when only compodoc output references ng-prism', () => {
    write('dist/cli-docs/compodoc/js/search/search_index.js', IMPORT);
    assert.equal(run(join(root, 'dist/cli-docs')).status, 0);
  });

  it('exits 2 without arguments', () => {
    assert.equal(run().status, 2);
  });
});
