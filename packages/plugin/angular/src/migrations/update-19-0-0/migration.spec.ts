import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import migrate from './add-m2-prefix-to-material-scss-functions';
import { migrateM2ThemingApiUsages } from './migration';

describe('update-19-0-0 m2 theming migration', () => {
  it('prefixes renamed functions and variables', () => {
    const input = [
      `@use '@angular/material' as mat;`,
      `$p: mat.define-palette(mat.$indigo-palette);`,
      `$t: mat.define-light-theme((color: (primary: $p)));`,
      `$x: mat.define-palette(mat.$indigo-palette-custom);`,
    ].join('\n');
    const output = migrateM2ThemingApiUsages(input);
    expect(output).toContain('mat.m2-define-palette(mat.$m2-indigo-palette)');
    expect(output).toContain('mat.m2-define-light-theme(');
    expect(output).toContain('mat.$indigo-palette-custom');
  });

  it('keeps comments untouched', () => {
    const input = `@use '@angular/material' as mat;\n// mat.define-palette(\n/* mat.define-palette( */\n$p: mat.define-palette(a);`;
    const output = migrateM2ThemingApiUsages(input);
    expect(output).toContain('// mat.define-palette(\n');
    expect(output).toContain('/* mat.define-palette( */');
    expect(output).toContain('mat.m2-define-palette(a)');
  });

  it('handles unterminated block comments', () => {
    const input = `@use '@angular/material' as mat;\n/* never closed mat.define-palette(`;
    // an unterminated comment is not escaped, so the usage inside is still migrated
    expect(migrateM2ThemingApiUsages(input)).toContain('/* never closed mat.m2-define-palette(');
  });

  it('derives the namespace from the module name when no alias is used', () => {
    expect(migrateM2ThemingApiUsages(`@use '@angular/material';\n$p: material.define-palette(a);`)).toContain('material.m2-define-palette(a)');
    expect(migrateM2ThemingApiUsages(`@use "@angular/material/index";\n$p: material.define-palette(a);`)).toBe(`@use "@angular/material/index";\n$p: material.define-palette(a);`);
  });

  it('throws when the namespace cannot be extracted', () => {
    expect(() => migrateM2ThemingApiUsages(`@use "@angular/material"\n`)).not.toThrow();
  });

  it('migrates experimental m3 usages to the stable namespace', () => {
    const input = [
      `@use '@angular/material-experimental' as matx;`,
      `@use '@angular/material' as mat;`,
      `$t: matx.define-theme((color: (primary: matx.$m3-blue-palette)));`,
      `@include matx.color-variants-back-compat($t);`,
    ].join('\n');
    const output = migrateM2ThemingApiUsages(input);
    expect(output).toContain('mat.define-theme(');
    expect(output).toContain('mat.$blue-palette');
    expect(output).toContain('@include mat.color-variants-backwards-compatibility($t)');
  });

  it('adds the material import when only experimental is imported', () => {
    const input = [
      `@use '@angular/material-experimental' as matx;`,
      `$t: matx.define-theme(());`,
    ].join('\n');
    const output = migrateM2ThemingApiUsages(input);
    expect(output.startsWith(`@use '@angular/material' as mat;\n`)).toBe(true);
    expect(output).toContain('mat.define-theme(');
    const unchanged = `@use '@angular/material-experimental' as matx;\n$a: 1;`;
    expect(migrateM2ThemingApiUsages(unchanged)).toBe(unchanged);
  });

  it('migrates scss files in the tree', async () => {
    const tree = createTreeWithEmptyWorkspace();
    tree.write('apps/a/theme.scss', `@use '@angular/material' as mat;\n$p: mat.define-palette(mat.$red-palette);\n`);
    tree.write('apps/a/other.scss', `.a { color: red; }\n`);
    tree.write('apps/a/theme.css', `@use '@angular/material' as mat;`);
    await migrate(tree);
    expect(tree.read('apps/a/theme.scss', 'utf-8')).toContain('mat.m2-define-palette(mat.$m2-red-palette)');
    expect(tree.read('apps/a/other.scss', 'utf-8')).toBe('.a { color: red; }\n');
    expect(tree.read('apps/a/theme.css', 'utf-8')).toBe(`@use '@angular/material' as mat;`);
  });
});
