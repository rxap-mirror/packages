import {
  readJson,
  Tree,
  writeJson,
} from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { join } from 'path';

const mockFiles: Map<string, string> = ((global as any).__mockFiles ??= new Map<string, string>());

jest.mock('fs', () => {
  const actual = jest.requireActual('fs');
  const mockFiles: Map<string, string> = ((global as any).__mockFiles ??= new Map<string, string>());
  return {
    ...actual,
    existsSync: jest.fn((p: string) => mockFiles.has(p) || actual.existsSync(p)),
    readFileSync: jest.fn((p: string, ...rest: any[]) =>
      mockFiles.has(p) ? mockFiles.get(p) : actual.readFileSync(p, ...rest),
    ),
  };
});

jest.mock('@nx/devkit', () => ({
  ...jest.requireActual('@nx/devkit'),
  installPackagesTask: jest.fn(),
  formatFiles: jest.fn(async () => undefined),
}));

import { installPackagesTask } from '@nx/devkit';
import initGenerator from './generator';

const ownPackageJson = join(__dirname, '..', '..', '..', 'package.json');

function setOwnPackage(pkg: unknown) {
  mockFiles.set(ownPackageJson, JSON.stringify(pkg));
}

describe('preset-angular init generator', () => {
  let tree: Tree;

  beforeEach(() => {
    mockFiles.clear();
    tree = createTreeWithEmptyWorkspace();
    tree.root = '/ws';
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  it('returns when the own package.json is missing', async () => {
    const fs = require('fs');
    fs.existsSync.mockImplementationOnce(() => false);
    await initGenerator(tree, {});
    expect(console.error).toHaveBeenCalled();
    expect(installPackagesTask).not.toHaveBeenCalled();
  });

  it('returns when there are no peer dependencies', async () => {
    setOwnPackage({ name: '@rxap/x' });
    await initGenerator(tree, {});
    expect(installPackagesTask).not.toHaveBeenCalled();
  });

  it('returns when all peers are present', async () => {
    setOwnPackage({ name: '@rxap/x', peerDependencies: { a: '1.0.0' } });
    const pkg = readJson(tree, 'package.json');
    pkg.dependencies = { ...pkg.dependencies, a: '1.0.0' };
    writeJson(tree, 'package.json', pkg);
    await initGenerator(tree, {});
    expect(installPackagesTask).not.toHaveBeenCalled();
  });

  it('adds missing peers as dependencies', async () => {
    setOwnPackage({ name: '@rxap/x', peerDependencies: { a: '1.0.0' } });
    await initGenerator(tree, {});
    expect(readJson(tree, 'package.json').dependencies.a).toBe('1.0.0');
    expect(installPackagesTask).toHaveBeenCalled();
  });

  it('adds missing peers as devDependencies when the package is a devDependency', async () => {
    setOwnPackage({ name: '@rxap/x', peerDependencies: { a: '1.0.0' } });
    const pkg = readJson(tree, 'package.json');
    pkg.devDependencies = { ...pkg.devDependencies, '@rxap/x': '1.0.0' };
    writeJson(tree, 'package.json', pkg);
    await initGenerator(tree, {});
    expect(readJson(tree, 'package.json').devDependencies.a).toBe('1.0.0');
  });

  it('moves @rxap/ngx packages from devDependencies to dependencies', async () => {
    setOwnPackage({ name: '@rxap/ngx-x', peerDependencies: { a: '1.0.0' } });
    const pkg = readJson(tree, 'package.json');
    pkg.devDependencies = { ...pkg.devDependencies, '@rxap/ngx-x': '2.0.0' };
    writeJson(tree, 'package.json', pkg);
    await initGenerator(tree, {});
    const after = readJson(tree, 'package.json');
    expect(after.dependencies['@rxap/ngx-x']).toBe('2.0.0');
    expect(after.devDependencies['@rxap/ngx-x']).toBeUndefined();
  });

  it('moves @rxap/plugin packages from dependencies to devDependencies', async () => {
    setOwnPackage({ name: '@rxap/plugin-x', peerDependencies: { a: '1.0.0' } });
    const pkg = readJson(tree, 'package.json');
    pkg.dependencies = { ...pkg.dependencies, '@rxap/plugin-x': '2.0.0' };
    writeJson(tree, 'package.json', pkg);
    await initGenerator(tree, {});
    const after = readJson(tree, 'package.json');
    expect(after.devDependencies['@rxap/plugin-x']).toBe('2.0.0');
    expect(after.dependencies['@rxap/plugin-x']).toBeUndefined();
  });

  describe('peer init generators', () => {
    const peerDir = join('/ws', 'node_modules', 'peer');
    const peerPkg = join(peerDir, 'package.json');

    beforeEach(() => {
      setOwnPackage({ name: '@rxap/x', peerDependencies: { peer: '1.0.0' } });
    });

    it('skips peers without package.json', async () => {
      await initGenerator(tree, {});
    });

    it('skips peers without generators', async () => {
      mockFiles.set(peerPkg, '{}');
      await initGenerator(tree, {});
    });

    it('skips when the generators file is missing', async () => {
      mockFiles.set(peerPkg, JSON.stringify({ generators: './generators.json' }));
      await initGenerator(tree, {});
    });

    it('skips when there is no init generator', async () => {
      mockFiles.set(peerPkg, JSON.stringify({ schematics: './generators.json' }));
      mockFiles.set(join(peerDir, 'generators.json'), JSON.stringify({ generators: {} }));
      await initGenerator(tree, {});
    });

    it('skips when the init generator file is missing', async () => {
      mockFiles.set(peerPkg, JSON.stringify({ generators: './generators.json' }));
      mockFiles.set(join(peerDir, 'generators.json'), JSON.stringify({ generators: { init: { factory: './init' } } }));
      await initGenerator(tree, {});
    });

    it('skips when the init generator is not a function', async () => {
      mockFiles.set(peerPkg, JSON.stringify({ generators: './generators.json' }));
      mockFiles.set(join(peerDir, 'generators.json'), JSON.stringify({ generators: { init: { factory: './init' } } }));
      mockFiles.set(join(peerDir, 'init.js'), '');
      jest.doMock(join(peerDir, './init'), () => ({ default: 'nope' }), { virtual: true });
      await initGenerator(tree, {});
    });

    it('runs the peer init generator', async () => {
      const fn = jest.fn();
      mockFiles.set(peerPkg, JSON.stringify({ generators: './generators.json' }));
      mockFiles.set(join(peerDir, 'generators.json'), JSON.stringify({ generators: { init: { factory: './init-fn' } } }));
      mockFiles.set(join(peerDir, 'init-fn.js'), '');
      jest.doMock(join(peerDir, 'init-fn'), () => ({ default: fn }), { virtual: true });
      await initGenerator(tree, { a: 1 } as any);
      expect(fn).toHaveBeenCalledWith(tree, { a: 1 });
    });
  });
});
