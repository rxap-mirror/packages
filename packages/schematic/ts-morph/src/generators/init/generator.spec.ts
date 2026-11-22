import { readJson, Tree, writeJson } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { join } from 'path';
import initGenerator from './generator';

const mockFiles: Record<string, string> = ((globalThis as any).__mockFiles = {});
const pkgPath = join(__dirname, '..', '..', '..', 'package.json');

jest.mock('fs', () => {
  const actual = jest.requireActual('fs');
  const files = (): Record<string, string> => (globalThis as any).__mockFiles ?? {};
  return {
    ...actual,
    existsSync: (p: string) => p in files() || (!p.includes('/package.json') && actual.existsSync(p)),
    readFileSync: (p: string, ...rest: any[]) => (p in files() ? files()[p] : actual.readFileSync(p, ...rest)),
  };
});

const installPackagesTask = jest.fn();
jest.mock('@nx/devkit', () => ({
  ...jest.requireActual('@nx/devkit'),
  installPackagesTask: (...a: any[]) => installPackagesTask(...a),
}));

describe('schematic-ts-morph initGenerator', () => {
  let tree: Tree;
  const root = (name = 'root') => writeJson(tree, 'package.json', { name, dependencies: {}, devDependencies: {} });

  beforeEach(() => {
    for (const k of Object.keys(mockFiles)) delete mockFiles[k];
    installPackagesTask.mockClear();
    tree = createTreeWithEmptyWorkspace();
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });
  afterEach(() => jest.restoreAllMocks());

  const setPkg = (pkg: object) => (mockFiles[pkgPath] = JSON.stringify(pkg));
  const run = () => initGenerator(tree, {} as any);

  it('stops when the package.json is missing', async () => {
    await run();
    expect(console.error).toHaveBeenCalled();
  });

  it('stops without peer dependencies', async () => {
    setPkg({ name: '@rxap/x' });
    await run();
    expect(console.log).toHaveBeenCalledWith('No peer dependencies found');
  });

  it('stops when all peers exist', async () => {
    setPkg({ name: '@rxap/x', peerDependencies: { a: '1' } });
    writeJson(tree, 'package.json', { dependencies: { a: '1' } });
    await run();
    expect(console.log).toHaveBeenCalledWith('No missing peer dependencies');
  });

  it('adds missing peers as dependencies', async () => {
    setPkg({ name: '@rxap/x', peerDependencies: { a: '1' } });
    root();
    await run();
    expect(readJson(tree, 'package.json').dependencies.a).toBe('1');
    expect(installPackagesTask).toHaveBeenCalled();
  });

  it('adds missing peers as devDependencies for dev packages', async () => {
    setPkg({ name: '@rxap/plugin-x', peerDependencies: { a: '1' } });
    writeJson(tree, 'package.json', { dependencies: { '@rxap/plugin-x': '1' }, devDependencies: {} });
    await run();
    const json = readJson(tree, 'package.json');
    expect(json.devDependencies['@rxap/plugin-x']).toBe('1');
    expect(json.devDependencies.a).toBe('1');
  });

  it('moves ngx packages from devDependencies to dependencies', async () => {
    setPkg({ name: '@rxap/ngx-x', peerDependencies: { a: '1' } });
    writeJson(tree, 'package.json', { devDependencies: { '@rxap/ngx-x': '2' } });
    await run();
    const json = readJson(tree, 'package.json');
    expect(json.dependencies['@rxap/ngx-x']).toBe('2');
    expect(json.devDependencies['@rxap/ngx-x']).toBeUndefined();
  });

  describe('peer init generators', () => {
    const peerDir = () => join(tree.root, 'node_modules', 'peer');
    beforeEach(() => {
      setPkg({ name: '@rxap/x', peerDependencies: { peer: '1' } });
      root();
    });

    it.each([
      ['no package.json', undefined, 'has no package.json'],
      ['no generators', { name: 'peer' }, 'has no generators or schematics'],
      ['missing generators file', { generators: './g.json' }, 'has no generators or schematics file'],
    ])('skips peer with %s', async (_n, pj, msg) => {
      if (pj) mockFiles[join(peerDir(), 'package.json')] = JSON.stringify(pj);
      await run();
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining(msg));
    });

    it('skips peer without init generator', async () => {
      mockFiles[join(peerDir(), 'package.json')] = JSON.stringify({ generators: './g.json' });
      mockFiles[join(peerDir(), 'g.json')] = JSON.stringify({ generators: {} });
      await run();
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('has no init generator'));
    });

    it('skips peer when init generator file is missing', async () => {
      mockFiles[join(peerDir(), 'package.json')] = JSON.stringify({ generators: './g.json' });
      mockFiles[join(peerDir(), 'g.json')] = JSON.stringify({ generators: { init: { factory: './init' } } });
      await run();
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('init generator file'));
    });

    it('skips peer when the init export is not a function', async () => {
      mockFiles[join(peerDir(), 'package.json')] = JSON.stringify({ schematics: './g.json' });
      mockFiles[join(peerDir(), 'g.json')] = JSON.stringify({ generators: { init: { factory: './init' } } });
      mockFiles[join(peerDir(), 'init.js')] = '';
      jest.doMock(join(peerDir(), './init'), () => ({ default: 1 }), { virtual: true });
      await run();
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('no init generator function'));
    });

    it('runs the init generator of the peer', async () => {
      const init = jest.fn();
      mockFiles[join(peerDir(), 'package.json')] = JSON.stringify({ generators: './g.json' });
      mockFiles[join(peerDir(), 'g.json')] = JSON.stringify({ generators: { init: { factory: './init2' } } });
      mockFiles[join(peerDir(), 'init2.js')] = '';
      jest.doMock(join(peerDir(), './init2'), () => ({ default: init }), { virtual: true });
      await run();
      expect(init).toHaveBeenCalled();
    });
  });
});
