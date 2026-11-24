import { readJson, Tree, writeJson } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { readFileSync } from 'fs';
import { join } from 'path';
import initGenerator from './generator';

const mockFiles: Record<string, string> = ((globalThis as any).__mockFiles = {});

jest.mock('fs', () => {
  const actual = jest.requireActual('fs');
  const mockFiles = (): Record<string, string> => (globalThis as any).__mockFiles ?? {};
  return {
    ...actual,
    existsSync: (p: string) => p in mockFiles() || actual.existsSync(p),
    readFileSync: (p: string, ...rest: any[]) =>
      p in mockFiles() ? mockFiles()[p] : actual.readFileSync(p, ...rest),
  };
});

jest.mock('@nx/devkit', () => ({
  ...jest.requireActual('@nx/devkit'),
  installPackagesTask: jest.fn(),
}));

const pkg = JSON.parse(
  readFileSync(join(__dirname, '..', '..', '..', 'package.json'), 'utf-8'),
);
const peers: Record<string, string> = pkg.peerDependencies ?? {};
const peerNames = Object.keys(peers);

describe('initGenerator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  it('is a function exported as default', () => {
    expect(typeof initGenerator).toBe('function');
  });

  if (peerNames.length) {
    it('adds missing peer dependencies to the root package.json', async () => {
      writeJson(tree, 'package.json', {
        name: 'root',
        dependencies: { [pkg.name]: '1.0.0' },
        devDependencies: {},
      });
      await initGenerator(tree, {} as any);
      const json = readJson(tree, 'package.json');
      for (const [dep, version] of Object.entries(peers)) {
        expect(json.dependencies[dep] ?? json.devDependencies[dep]).toBe(
          version,
        );
      }
    });

    it('does not change package.json when all peers exist', async () => {
      // tooling packages (plugin, workspace, schematic) are kept in the devDependencies
      const section = /^@rxap\/(plugin|workspace|schematic)/.test(pkg.name)
        ? 'devDependencies'
        : 'dependencies';
      const deps = { [pkg.name]: '1.0.0', ...peers };
      writeJson(tree, 'package.json', {
        name: 'root',
        dependencies: {},
        devDependencies: {},
        [section]: deps,
      });
      await initGenerator(tree, {} as any);
      expect(readJson(tree, 'package.json')[section]).toEqual(deps);
    });

    it('adds peers to devDependencies when the package is a dev dependency', async () => {
      writeJson(tree, 'package.json', {
        name: 'root',
        dependencies: {},
        devDependencies: { [pkg.name]: '1.0.0' },
      });
      await initGenerator(tree, {} as any);
      const json = readJson(tree, 'package.json');
      if (/^@rxap\/(ngx|nest)/.test(pkg.name)) {
        // runtime packages are moved to dependencies
        expect(json.dependencies[pkg.name]).toBe('1.0.0');
        expect(json.devDependencies[pkg.name]).toBeUndefined();
        expect(json.dependencies[peerNames[0]]).toBe(peers[peerNames[0]]);
      } else {
        expect(json.devDependencies[peerNames[0]]).toBe(peers[peerNames[0]]);
      }
    });
  } else {
    it('does nothing when the package declares no peer dependencies', async () => {
      writeJson(tree, 'package.json', { name: 'root', dependencies: {} });
      const before = tree.read('package.json', 'utf-8');
      await initGenerator(tree, {} as any);
      expect(tree.read('package.json', 'utf-8')).toBe(before);
    });
  }
});

describe('initGenerator with mocked package metadata', () => {
  const ownPkg = join(__dirname, '..', '..', '..', 'package.json');
  const peerPkg = (name: string) =>
    join('/virtual', 'node_modules', ...name.split('/'), 'package.json');
  let tree: Tree;
  let logs: string[];

  const setOwn = (json: object) => {
    mockFiles[ownPkg] = JSON.stringify(json);
  };

  beforeEach(() => {
    for (const k of Object.keys(mockFiles)) delete mockFiles[k];
    tree = createTreeWithEmptyWorkspace();
    logs = [];
    jest.spyOn(console, 'log').mockImplementation((m) => void logs.push(String(m)));
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  it('logs and returns when package.json is missing', async () => {
    const spy = jest.spyOn(require('fs'), 'existsSync');
    spy.mockImplementation(() => false);
    await initGenerator(tree, {} as any);
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('package.json not found'),
    );
  });

  it('returns early without peer dependencies', async () => {
    setOwn({ name: '@rxap/x' });
    await initGenerator(tree, {} as any);
    expect(logs).toContain('No peer dependencies found');
  });

  it('returns early when no peers are missing', async () => {
    setOwn({ name: '@rxap/x', peerDependencies: { a: '1' } });
    writeJson(tree, 'package.json', { dependencies: { a: '1' } });
    await initGenerator(tree, {} as any);
    expect(logs).toContain('No missing peer dependencies');
  });

  it('moves a plugin package from dependencies to devDependencies', async () => {
    setOwn({ name: '@rxap/plugin-x', peerDependencies: { a: '1' } });
    writeJson(tree, 'package.json', {
      dependencies: { '@rxap/plugin-x': '2.0.0' },
    });
    await initGenerator(tree, {} as any);
    const json = readJson(tree, 'package.json');
    expect(json.dependencies['@rxap/plugin-x']).toBeUndefined();
    expect(json.devDependencies['@rxap/plugin-x']).toBe('2.0.0');
    expect(json.devDependencies['a']).toBe('1');
  });

  it('moves a nest package from devDependencies to dependencies', async () => {
    setOwn({ name: '@rxap/nest-x', peerDependencies: { a: '1' } });
    writeJson(tree, 'package.json', {
      devDependencies: { '@rxap/nest-x': '2.0.0' },
    });
    await initGenerator(tree, {} as any);
    const json = readJson(tree, 'package.json');
    expect(json.dependencies['@rxap/nest-x']).toBe('2.0.0');
    expect(json.dependencies['a']).toBe('1');
  });

  describe('peer init generators', () => {
    const run = async (peerJson?: object, extra: Record<string, string> = {}) => {
      setOwn({ name: '@rxap/nest-x', peerDependencies: { 'peer-a': '1' } });
      writeJson(tree, 'package.json', { dependencies: { '@rxap/nest-x': '1' } });
      if (peerJson) mockFiles[peerPkg('peer-a')] = JSON.stringify(peerJson);
      Object.assign(mockFiles, extra);
      await initGenerator(tree, { project: 'p' } as any);
    };
    const dir = join('/virtual', 'node_modules', 'peer-a');

    it('skips peers without package.json', async () => {
      await run();
      expect(logs).toContain('Peer dependency peer-a has no package.json');
    });

    it('skips peers without generators', async () => {
      await run({ name: 'peer-a' });
      expect(logs).toContain('Peer dependency peer-a has no generators or schematics');
    });

    it('skips peers with missing generators file', async () => {
      await run({ generators: './generators.json' });
      expect(logs).toContain('Peer dependency peer-a has no generators or schematics file');
    });

    it('skips peers without init generator', async () => {
      await run({ generators: './generators.json' }, {
        [join(dir, 'generators.json')]: JSON.stringify({ generators: {} }),
      });
      expect(logs).toContain('Peer dependency peer-a has no init generator');
    });

    it('skips peers whose init generator file is missing', async () => {
      await run({ generators: './generators.json' }, {
        [join(dir, 'generators.json')]: JSON.stringify({ generators: { init: { factory: './gen' } } }),
      });
      expect(logs.some((l) => l.includes('has no init generator file'))).toBe(true);
    });

    it('skips peers whose init export is not a function', async () => {
      jest.resetModules();
      jest.doMock(join(dir, 'gen'), () => ({ default: 1 }), { virtual: true });
      await run({ generators: './generators.json' }, {
        [join(dir, 'generators.json')]: JSON.stringify({ generators: { init: { factory: './gen' } } }),
        [join(dir, 'gen.js')]: '',
      });
      expect(logs).toContain('Peer dependency peer-a has no init generator function');
    });

    it('runs the init generator of a peer', async () => {
      const peerInit = jest.fn();
      jest.resetModules();
      jest.doMock(join(dir, 'gen'), () => ({ default: peerInit }), { virtual: true });
      await run({ schematics: './generators.json' }, {
        [join(dir, 'generators.json')]: JSON.stringify({ generators: { init: { factory: './gen' } } }),
        [join(dir, 'gen.js')]: '',
      });
      expect(peerInit).toHaveBeenCalledWith(tree, { project: 'p' });
    });
  });
});
