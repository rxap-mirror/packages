import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, writeJson } from '@nx/devkit';
import {
  AddPackageJsonDependency,
  AddPackageJsonDevDependency,
  AddPackageJsonScript,
  CleanupPackageJsonFile,
  GetPackageJson,
  GetRootPackageJson,
  HasPackageJson,
  UpdatePackageJson,
} from './package-json-file';
import { FsTree } from './tree';
import { mkdtempSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const getLatest = jest.fn();
const getPeers = jest.fn();

jest.mock('@rxap/node-utilities', () => ({
  ...jest.requireActual('@rxap/node-utilities'),
  GetLatestPackageVersion: (...args: any[]) => getLatest(...args),
  GetPackagePeerDependencies: (...args: any[]) => getPeers(...args),
}));

describe('package.json helpers', () => {
  let tree: Tree;
  const read = () => JSON.parse(tree.read('package.json', 'utf-8')!);

  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    getPeers.mockResolvedValue({});
    tree = createTreeWithEmptyWorkspace();
    writeJson(tree, 'package.json', { name: 'root' });
  });

  it('reads and detects package.json', () => {
    expect(HasPackageJson(tree)).toBe(true);
    expect(HasPackageJson(tree, 'sub')).toBe(false);
    expect(GetPackageJson(tree).name).toBe('root');
  });

  it('cleans up and sorts a package.json', () => {
    const json: any = {
      private: true, keywords: ['b', 'a'], license: 'MIT', scripts: { a: 'b' },
      description: 'd', name: 'n', version: '1',
      dependencies: { z: '1', a: '1' }, devDependencies: {}, peerDependencies: { p: '1' },
      'nx-migrations': { packageGroup: [{ package: 'b', version: '1' }, { package: 'a', version: '1' }] },
    };
    CleanupPackageJsonFile(json);
    expect(Object.keys(json)).toEqual(['version', 'name', 'description', 'license', 'scripts', 'dependencies', 'peerDependencies', 'keywords', 'nx-migrations', 'private']);
    expect(Object.keys(json.dependencies)).toEqual(['a', 'z']);
    expect(json.keywords).toEqual(['a', 'b']);
    expect(json['nx-migrations'].packageGroup.map((p: any) => p.package)).toEqual(['a', 'b']);
    expect(json.devDependencies).toBeUndefined();
    const empty: any = {};
    CleanupPackageJsonFile(empty);
    expect(empty).toEqual({});
  });

  it('updates sync and async', async () => {
    UpdatePackageJson(tree, (p) => { p.description = 'x'; });
    expect(read().description).toBe('x');
    await UpdatePackageJson(tree, async (p) => { p.license = 'MIT'; });
    expect(read().license).toBe('MIT');
    writeJson(tree, 'sub/package.json', { name: 's' });
    UpdatePackageJson(tree, (p) => { p.version = '1'; }, { basePath: 'sub' });
    expect(JSON.parse(tree.read('sub/package.json', 'utf-8')!).version).toBe('1');
  });

  it('adds scripts', () => {
    AddPackageJsonScript(tree, 'build', 'nx build');
    expect(read().scripts).toEqual({ build: 'nx build' });
  });

  describe('AddPackageJsonDependency', () => {
    it('adds a dependency with an explicit version, stripping the range prefix', async () => {
      await AddPackageJsonDependency(tree, 'lodash', '^4.0.0');
      expect(read().dependencies).toEqual({ lodash: '4.0.0' });
      expect(getLatest).not.toHaveBeenCalled();
    });

    it('resolves the latest version', async () => {
      getLatest.mockResolvedValue('2.3.4');
      await AddPackageJsonDependency(tree, 'pkg');
      expect(read().dependencies).toEqual({ pkg: '2.3.4' });
    });

    it('reports when the latest version cannot be resolved', async () => {
      getLatest.mockResolvedValue(null);
      await AddPackageJsonDependency(tree, 'pkg');
      expect(read().dependencies).toBeUndefined();
      expect(console.error).toHaveBeenCalled();
    });

    it('adds dev dependencies', async () => {
      await AddPackageJsonDevDependency(tree, 'jest', '29.0.0');
      expect(read().devDependencies).toEqual({ jest: '29.0.0' });
    });

    it('keeps the existing section and overrides the version', async () => {
      writeJson(tree, 'package.json', { devDependencies: { a: '1.0.0' } });
      await AddPackageJsonDependency(tree, 'a', '2.0.0', {}, 'devDependencies');
      expect(read().devDependencies).toEqual({ a: '2.0.0' });
    });

    it('promotes a devDependency to dependencies', async () => {
      writeJson(tree, 'package.json', { devDependencies: { a: '1.0.0' } });
      await AddPackageJsonDependency(tree, 'a', '1.0.0');
      expect(read().dependencies).toEqual({ a: '1.0.0' });
      expect(read().devDependencies).toBeUndefined();
    });

    it('does not demote a dependency to devDependencies', async () => {
      writeJson(tree, 'package.json', { dependencies: { a: '1.0.0' } });
      await AddPackageJsonDependency(tree, 'a', '1.0.0', {}, 'devDependencies');
      expect(read().dependencies).toEqual({ a: '1.0.0' });
      expect(read().devDependencies).toBeUndefined();
    });

    it('promotes peer and optional dependencies', async () => {
      writeJson(tree, 'package.json', { peerDependencies: { a: '1.0.0' }, optionalDependencies: { b: '1.0.0' } });
      await AddPackageJsonDependency(tree, 'a', '1.0.0', {}, 'devDependencies');
      await AddPackageJsonDependency(tree, 'b', '1.0.0', {}, 'peerDependencies');
      expect(read().devDependencies).toEqual({ a: '1.0.0' });
      expect(read().peerDependencies).toEqual({ b: '1.0.0' });
      expect(read().optionalDependencies).toBeUndefined();
      writeJson(tree, 'package.json', { optionalDependencies: { c: '1.0.0' } });
      await AddPackageJsonDependency(tree, 'c', '1.0.0', {}, 'dependencies');
      expect(read().dependencies).toEqual({ c: '1.0.0' });
    });

    it('cleans up packages declared in multiple sections', async () => {
      writeJson(tree, 'package.json', { dependencies: { a: '1.0.0' }, devDependencies: { a: '1.0.0' }, peerDependencies: { a: '1.0.0' }, optionalDependencies: { a: '1.0.0' } });
      await AddPackageJsonDependency(tree, 'a', '1.0.0');
      expect(read().dependencies).toEqual({ a: '1.0.0' });
      expect(read().devDependencies).toBeUndefined();
      expect(read().peerDependencies).toBeUndefined();
      writeJson(tree, 'package.json', { devDependencies: { b: '1.0.0' }, peerDependencies: { b: '1.0.0' }, optionalDependencies: { b: '1.0.0' } });
      await AddPackageJsonDependency(tree, 'b', '1.0.0', {}, 'devDependencies');
      expect(read().devDependencies).toEqual({ b: '1.0.0' });
      writeJson(tree, 'package.json', { peerDependencies: { c: '1.0.0' }, optionalDependencies: { c: '1.0.0' } });
      await AddPackageJsonDependency(tree, 'c', '1.0.0', {}, 'peerDependencies');
      expect(read().peerDependencies).toEqual({ c: '1.0.0' });
      expect(read().optionalDependencies).toBeUndefined();
    });

    describe('soft mode', () => {
      it('keeps an existing version for "latest"', async () => {
        writeJson(tree, 'package.json', { dependencies: { a: '1.0.0' } });
        getLatest.mockResolvedValue('5.0.0');
        await AddPackageJsonDependency(tree, 'a', 'latest', { soft: true });
        expect(read().dependencies.a).toBe('1.0.0');
      });

      it('keeps equal or greater versions and upgrades smaller ones', async () => {
        writeJson(tree, 'package.json', { dependencies: { a: '^1.0.0', b: '3.0.0', c: '1.0.0' } });
        await AddPackageJsonDependency(tree, 'a', '1.0.0', { soft: true });
        await AddPackageJsonDependency(tree, 'b', '2.0.0', { soft: true });
        await AddPackageJsonDependency(tree, 'c', '2.0.0', { soft: true });
        expect(read().dependencies).toEqual({ a: '^1.0.0', b: '3.0.0', c: '2.0.0' });
      });
    });

    it('does not add @rxap packages inside the rxap repository', async () => {
      writeJson(tree, 'package.json', { repository: { url: 'https://gitlab.com/rxap/packages.git' } });
      await AddPackageJsonDependency(tree, '@rxap/utilities', '1.0.0');
      expect(read().dependencies).toBeUndefined();
    });

    describe('peer dependencies', () => {
      it('adds supported rxap peers and skips others', async () => {
        getPeers.mockImplementation(async (name: string) => name === 'main'
          ? { tslib: '^2.0.0', rxjs: '^7.0.0', '@rxap/a': '^1.2.3', '@rxap/b': 'workspace:*' }
          : {});
        await AddPackageJsonDependency(tree, 'main', '1.0.0');
        expect(read().dependencies).toEqual({ '@rxap/a': '1.2.3', main: '1.0.0' });
      });

      it('includes non rxap peers when requested', async () => {
        getPeers.mockImplementation(async (name: string) => name === 'main' ? { rxjs: '^7.0.0' } : {});
        await AddPackageJsonDependency(tree, 'main', '1.0.0', { withoutNonRxapPeerDependencies: false });
        expect(read().dependencies).toEqual({ main: '1.0.0', rxjs: '7.0.0' });
      });

      it('skips peers when disabled or when already present', async () => {
        await AddPackageJsonDependency(tree, 'main', '1.0.0', { withPeerDependencies: false });
        expect(getPeers).not.toHaveBeenCalled();
        writeJson(tree, 'package.json', { dependencies: { main: '1.0.0' } });
        await AddPackageJsonDependency(tree, 'main', '1.0.0');
        expect(getPeers).not.toHaveBeenCalled();
      });

      it('logs debug information', async () => {
        const log = jest.spyOn(console, 'log').mockImplementation(() => undefined);
        const group = jest.spyOn(console, 'group').mockImplementation(() => undefined);
        const groupEnd = jest.spyOn(console, 'groupEnd').mockImplementation(() => undefined);
        process.env['RXAP_GENERATOR_DEBUG'] = 'true';
        try {
          getPeers.mockImplementation(async (name: string) => name === 'main'
            ? { tslib: '1.0.0', other: '1.0.0', '@rxap/a': '1.0.0', '@rxap/b': 'x' } : {});
          await AddPackageJsonDependency(tree, 'main', '1.0.0');
          await AddPackageJsonDependency(tree, 'main', '1.0.0', { soft: true });
          await AddPackageJsonDependency(tree, 'main', '0.0.1', { soft: true });
          await AddPackageJsonDependency(tree, 'main', 'latest', { soft: true });
          await AddPackageJsonDependency(tree, 'new', '1.0.0', {}, 'devDependencies');
          await AddPackageJsonDependency(tree, 'new', '1.0.0', {}, 'dependencies');
          await AddPackageJsonDependency(tree, 'empty', '1.0.0');
        } finally {
          delete process.env['RXAP_GENERATOR_DEBUG'];
          expect(group).toHaveBeenCalled();
          log.mockRestore(); group.mockRestore(); groupEnd.mockRestore();
        }
      });
    });
  });
});

describe('GetRootPackageJson', () => {
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  it('reads from the cwd without a tree', () => {
    expect(GetRootPackageJson().name).toBeDefined();
  });

  it('reads from generator and fs trees', () => {
    const tree = createTreeWithEmptyWorkspace();
    writeJson(tree, 'package.json', { name: 'gen' });
    expect(GetRootPackageJson(tree).name).toBe('gen');
    const root = mkdtempSync(join(tmpdir(), 'pkg-'));
    writeFileSync(join(root, 'package.json'), '{"name":"fs"}');
    expect(GetRootPackageJson(new FsTree(root)).name).toBe('fs');
  });

  it('fails for missing or invalid files and unknown trees', () => {
    const tree = createTreeWithEmptyWorkspace();
    tree.delete('package.json');
    expect(() => GetRootPackageJson(tree)).toThrow('Could not find the root package.json');
    writeJson(tree, 'package.json', []);
    expect(() => GetRootPackageJson(tree)).toThrow('not a valid JSON object');
    expect(() => GetRootPackageJson({ exists: () => true, delete: () => 0, rename: () => 0 } as any)).toThrow('not a valid schematic or generator tree');
    const empty = mkdtempSync(join(tmpdir(), 'pkg-'));
    expect(() => GetRootPackageJson(new FsTree(empty))).toThrow('Could not find the root package.json');
  });
});
