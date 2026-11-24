import { HostTree } from '@angular-devkit/schematics';
import { createTree, createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { CoerceFilesStructure } from './coerce-files-structure';
import {
  ApplySubstitutions,
  GetPackageManagerProfile,
  PACKAGE_MANAGER_NAMES,
  PackageManagerSubstitutions,
  ParsePackageManagerField,
  ResolvePackageManager,
  ResolvePackageManagerProfile,
} from './package-manager';
import { FsTree } from './tree';

describe('package-manager', () => {

  describe('ParsePackageManagerField', () => {
    it('parses name, version and ignores the hash', () => {
      expect(ParsePackageManagerField('pnpm@10.4.1+sha512.abc')).toEqual({ name: 'pnpm', version: '10.4.1' });
      expect(ParsePackageManagerField('yarn@1.22.22')).toEqual({ name: 'yarn', version: '1.22.22' });
      expect(ParsePackageManagerField('npm')).toEqual({ name: 'npm', version: undefined });
    });

    it('rejects unknown values', () => {
      expect(ParsePackageManagerField('deno@2')).toBeNull();
      expect(ParsePackageManagerField(undefined)).toBeNull();
      expect(ParsePackageManagerField(42)).toBeNull();
    });
  });

  describe('ResolvePackageManager', () => {
    it('falls back to npm', () => {
      expect(ResolvePackageManager(createTree())).toEqual({ name: 'npm' });
      expect(ResolvePackageManager(createTreeWithEmptyWorkspace())).toEqual({ name: 'npm' });
    });

    it.each([
      [ 'pnpm-lock.yaml', 'pnpm' ],
      [ 'yarn.lock', 'yarn' ],
      [ 'package-lock.json', 'npm' ],
      [ 'bun.lock', 'bun' ],
    ])('detects %s', (lockfile, name) => {
      const tree = createTreeWithEmptyWorkspace();
      tree.write(lockfile, '');
      expect(ResolvePackageManager(tree).name).toBe(name);
    });

    it('prefers the packageManager field over the lockfile', () => {
      const tree = createTreeWithEmptyWorkspace();
      tree.write('yarn.lock', '');
      tree.write('package.json', JSON.stringify({ packageManager: 'pnpm@10.1.0' }));
      expect(ResolvePackageManager(tree)).toEqual({ name: 'pnpm', version: '10.1.0' });
    });

    it('prefers the override and keeps the version only if it matches', () => {
      const tree = createTreeWithEmptyWorkspace();
      tree.write('package.json', JSON.stringify({ packageManager: 'pnpm@10.1.0' }));
      expect(ResolvePackageManager(tree, 'yarn')).toEqual({ name: 'yarn', version: undefined });
      expect(ResolvePackageManager(tree, 'pnpm')).toEqual({ name: 'pnpm', version: '10.1.0' });
    });

    it('works with an angular schematic tree', () => {
      const tree = new HostTree();
      tree.create('/package.json', JSON.stringify({ name: 'x' }));
      tree.create('/pnpm-lock.yaml', '');
      expect(ResolvePackageManager(tree).name).toBe('pnpm');
    });

    it('works with the FsTree', () => {
      const root = mkdtempSync(join(tmpdir(), 'pm-'));
      writeFileSync(join(root, 'package.json'), JSON.stringify({ packageManager: 'yarn@4.5.0' }));
      expect(ResolvePackageManager(new FsTree(root))).toEqual({ name: 'yarn', version: '4.5.0' });
    });
  });

  describe('GetPackageManagerProfile', () => {
    it.each(PACKAGE_MANAGER_NAMES)('%s', (name) => {
      const profile = GetPackageManagerProfile(name);
      expect({
        ...profile,
        run: profile.run('build', '--prod'),
        exec: profile.exec('nx', 'run-many'),
        dlx: profile.dlx('npm-check-updates'),
      }).toMatchSnapshot();
    });

    it('distinguishes yarn classic and berry', () => {
      expect(GetPackageManagerProfile({ name: 'yarn', version: '1.22.22' }).ciInstall).toBe('yarn install --frozen-lockfile');
      expect(GetPackageManagerProfile({ name: 'yarn', version: '4.5.0' }).ciInstall).toBe('yarn install --immutable');
      const classic = createTreeWithEmptyWorkspace();
      classic.write('yarn.lock', '');
      classic.write('.yarnrc', '');
      expect(ResolvePackageManagerProfile(classic).classic).toBe(true);
      const berry = createTreeWithEmptyWorkspace();
      berry.write('yarn.lock', '');
      expect(ResolvePackageManagerProfile(berry).classic).toBe(false);
    });
  });

  describe('ApplySubstitutions', () => {
    it('replaces known keys and keeps everything else', () => {
      const substitutions = PackageManagerSubstitutions(GetPackageManagerProfile('pnpm'));
      expect(ApplySubstitutions(
        '{{pm.exec}} nx run-many # {{ pm.lockfile }} {{unknown}} $[[ inputs.x ]] ${VAR} {{#if a}}',
        substitutions,
      )).toBe('pnpm exec nx run-many # pnpm-lock.yaml {{unknown}} $[[ inputs.x ]] ${VAR} {{#if a}}');
    });
  });

  describe('CoerceFilesStructure substitutions', () => {
    it('renders .template files only', () => {
      const src = mkdtempSync(join(tmpdir(), 'pm-src-'));
      mkdirSync(join(src, 'scripts'));
      writeFileSync(join(src, 'scripts', 'run.sh.template'), '{{pm.exec}} nx build');
      writeFileSync(join(src, 'scripts', 'raw.sh'), '{{pm.exec}} nx build');
      const tree = createTreeWithEmptyWorkspace();
      CoerceFilesStructure(tree, {
        srcFolder: src,
        target: '',
        substitutions: PackageManagerSubstitutions(GetPackageManagerProfile('npm')),
      });
      expect(tree.read('scripts/run.sh', 'utf-8')).toBe('npx nx build');
      expect(tree.read('scripts/raw.sh', 'utf-8')).toBe('{{pm.exec}} nx build');
      expect(readFileSync(join(src, 'scripts', 'run.sh.template'), 'utf-8')).toBe('{{pm.exec}} nx build');
    });
  });

});
