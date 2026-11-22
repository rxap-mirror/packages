import { readJson, Tree, writeJson } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import * as fs from 'fs';
import { join } from 'path';
import initGenerator from './generator';

jest.mock('@nx/devkit', () => ({
  ...jest.requireActual('@nx/devkit'),
  installPackagesTask: jest.fn(),
}));

jest.mock('fs', () => {
  const actual = jest.requireActual('fs');
  return { ...actual, existsSync: jest.fn(), readFileSync: jest.fn() };
});

const existsSyncMock = fs.existsSync as jest.Mock;
const readFileSyncMock = fs.readFileSync as jest.Mock;
const actualFs = jest.requireActual('fs');

const OWN_PACKAGE_JSON = join(__dirname, '..', '..', '..', 'package.json');

/**
 * Fakes the physical file system. Paths missing from the map are reported as
 * not existing; everything that is not a faked path falls through to the real fs.
 */
function fakeFs(files: Record<string, unknown>) {
  existsSyncMock.mockImplementation((p: string) =>
    p in files ? true : actualFs.existsSync(p),
  );
  readFileSyncMock.mockImplementation((p: string, ...rest: unknown[]) =>
    p in files ? JSON.stringify(files[p]) : actualFs.readFileSync(p, ...rest),
  );
}

describe('initGenerator', () => {
  let tree: Tree;
  let log: jest.SpyInstance;
  let error: jest.SpyInstance;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    log = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    error = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    existsSyncMock.mockReset();
    readFileSyncMock.mockReset();
    existsSyncMock.mockImplementation(actualFs.existsSync);
    readFileSyncMock.mockImplementation(actualFs.readFileSync);
  });

  afterEach(() => {
    log.mockRestore();
    error.mockRestore();
  });

  const logged = () => log.mock.calls.map((c) => c.join(' ')).join('\n');

  it('is a function exported as default', () => {
    expect(typeof initGenerator).toBe('function');
  });

  it('logs an error when the package.json can not be found', async () => {
    existsSyncMock.mockReturnValue(false);
    await initGenerator(tree, {} as any);
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining('package.json not found'),
    );
  });

  it('does nothing when the package has no peer dependencies', async () => {
    fakeFs({ [OWN_PACKAGE_JSON]: { name: '@rxap/test' } });
    writeJson(tree, 'package.json', { name: 'root', dependencies: {} });
    const before = tree.read('package.json', 'utf-8');
    await initGenerator(tree, {} as any);
    expect(tree.read('package.json', 'utf-8')).toBe(before);
    expect(logged()).toContain('No peer dependencies found');
  });

  it('adds missing peer dependencies to dependencies', async () => {
    fakeFs({
      [OWN_PACKAGE_JSON]: {
        name: '@rxap/test',
        peerDependencies: { rxjs: '^7.0.0' },
      },
    });
    writeJson(tree, 'package.json', {
      name: 'root',
      dependencies: { '@rxap/test': '1.0.0' },
      devDependencies: {},
    });
    await initGenerator(tree, {} as any);
    const json = readJson(tree, 'package.json');
    expect(json.dependencies.rxjs).toBe('^7.0.0');
    expect(logged()).toContain('Peer dependency rxjs added to package.json');
    expect(logged()).toContain('rxjs has no package.json');
  });

  it('does not change package.json when all peers exist', async () => {
    fakeFs({
      [OWN_PACKAGE_JSON]: {
        name: '@rxap/test',
        peerDependencies: { rxjs: '^7.0.0' },
      },
    });
    const deps = { '@rxap/test': '1.0.0', rxjs: '^7.8.0' };
    writeJson(tree, 'package.json', {
      name: 'root',
      dependencies: deps,
      devDependencies: {},
    });
    await initGenerator(tree, {} as any);
    expect(readJson(tree, 'package.json').dependencies).toEqual(deps);
    expect(logged()).toContain('No missing peer dependencies');
  });

  it('adds peers to devDependencies when the package is a dev dependency', async () => {
    fakeFs({
      [OWN_PACKAGE_JSON]: {
        name: '@rxap/test',
        peerDependencies: { rxjs: '^7.0.0' },
      },
    });
    writeJson(tree, 'package.json', {
      name: 'root',
      dependencies: {},
      devDependencies: { '@rxap/test': '1.0.0' },
    });
    await initGenerator(tree, {} as any);
    const json = readJson(tree, 'package.json');
    expect(json.devDependencies.rxjs).toBe('^7.0.0');
    expect(json.dependencies.rxjs).toBeUndefined();
  });

  it('moves a dev dependency @rxap/nest* package to dependencies', async () => {
    fakeFs({
      [OWN_PACKAGE_JSON]: {
        name: '@rxap/nest-thing',
        peerDependencies: { rxjs: '^7.0.0' },
      },
    });
    writeJson(tree, 'package.json', {
      name: 'root',
      dependencies: {},
      devDependencies: { '@rxap/nest-thing': '1.0.0' },
    });
    await initGenerator(tree, {} as any);
    const json = readJson(tree, 'package.json');
    expect(json.dependencies['@rxap/nest-thing']).toBe('1.0.0');
    expect(json.devDependencies['@rxap/nest-thing']).toBeUndefined();
    expect(json.dependencies.rxjs).toBe('^7.0.0');
  });

  it('moves a dependency @rxap/plugin* package to devDependencies', async () => {
    fakeFs({
      [OWN_PACKAGE_JSON]: {
        name: '@rxap/plugin-thing',
        peerDependencies: { rxjs: '^7.0.0' },
      },
    });
    writeJson(tree, 'package.json', {
      name: 'root',
      dependencies: { '@rxap/plugin-thing': '1.0.0' },
      devDependencies: {},
    });
    await initGenerator(tree, {} as any);
    const json = readJson(tree, 'package.json');
    expect(json.devDependencies['@rxap/plugin-thing']).toBe('1.0.0');
    expect(json.dependencies['@rxap/plugin-thing']).toBeUndefined();
    expect(json.devDependencies.rxjs).toBe('^7.0.0');
  });

  describe('peer init generators', () => {
    const peerDir = join('/virtual', 'node_modules', '@rxap', 'peer');
    const peerPackageJson = join(peerDir, 'package.json');

    function setup(files: Record<string, unknown>) {
      fakeFs({
        [OWN_PACKAGE_JSON]: {
          name: '@rxap/test',
          peerDependencies: { '@rxap/peer': '^1.0.0' },
        },
        ...files,
      });
      writeJson(tree, 'package.json', {
        name: 'root',
        dependencies: { '@rxap/test': '1.0.0' },
      });
    }

    it('skips peers without a generators or schematics entry', async () => {
      setup({ [peerPackageJson]: { name: '@rxap/peer' } });
      await initGenerator(tree, {} as any);
      expect(logged()).toContain('has no generators or schematics');
    });

    it('skips peers whose generators file is missing', async () => {
      setup({ [peerPackageJson]: { generators: './generators.json' } });
      await initGenerator(tree, {} as any);
      expect(logged()).toContain('has no generators or schematics file');
    });

    it('skips peers without an init generator', async () => {
      setup({
        [peerPackageJson]: { generators: './generators.json' },
        [join(peerDir, 'generators.json')]: { generators: {} },
      });
      await initGenerator(tree, {} as any);
      expect(logged()).toContain('has no init generator');
    });

    it('skips peers whose init generator file is missing', async () => {
      setup({
        [peerPackageJson]: { schematics: './generators.json' },
        [join(peerDir, 'generators.json')]: {
          generators: { init: { factory: './src/init' } },
        },
      });
      await initGenerator(tree, {} as any);
      expect(logged()).toContain('has no init generator file');
    });

    it('runs the init generator of the peer', async () => {
      const peerInit = jest.fn();
      jest.doMock(join(peerDir, './src/init'), () => ({ default: peerInit }), {
        virtual: true,
      });
      setup({
        [peerPackageJson]: { generators: './generators.json' },
        [join(peerDir, 'generators.json')]: {
          generators: { init: { factory: './src/init' } },
        },
        [join(peerDir, './src/init') + '.js']: {},
      });
      const options = { skip: true } as any;
      await initGenerator(tree, options);
      expect(peerInit).toHaveBeenCalledWith(tree, options);
      expect(logged()).toContain('Run init generator for peer dependency');
    });

    it('skips peers whose init factory has no default function', async () => {
      jest.doMock(join(peerDir, './src/init-bad'), () => ({ default: 'nope' }), {
        virtual: true,
      });
      setup({
        [peerPackageJson]: { generators: './generators.json' },
        [join(peerDir, 'generators.json')]: {
          generators: { init: { factory: './src/init-bad' } },
        },
        [join(peerDir, './src/init-bad') + '.js']: {},
      });
      await initGenerator(tree, {} as any);
      expect(logged()).toContain('has no init generator function');
    });
  });
});
