import { Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import * as fs from 'fs';
import initGenerator from './generator';

jest.mock('@nx/devkit', () => ({
  ...jest.requireActual('@nx/devkit'),
  installPackagesTask: jest.fn(),
}));

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
}));

jest.mock('/virtual/node_modules/@peer/with-init/src/generators/init/generator', () => ({
  default: jest.fn().mockResolvedValue(undefined),
}), { virtual: true });

jest.mock('/virtual/node_modules/@peer/bad-init/src/generators/init/generator', () => ({
  default: 'not-a-function',
}), { virtual: true });

describe('init generator (peer dependency coercion)', () => {

  let tree: Tree;
  const files: Record<string, string> = {};
  const existsSync = fs.existsSync as jest.Mock;
  const readFileSync = fs.readFileSync as jest.Mock;

  function ownPackageJson(content: object | null) {
    for (const key of Object.keys(files)) {
      delete files[key];
    }
    if (content) {
      files['/own/package.json'] = JSON.stringify(content);
    }
  }

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    tree.write('package.json', JSON.stringify({ name: 'root', dependencies: {}, devDependencies: {} }));
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    existsSync.mockImplementation((path: string) => path.endsWith('/package.json') && !path.startsWith('/virtual')
      ? !!files['/own/package.json'] : path in files);
    readFileSync.mockImplementation((path: string) => {
      if (path.endsWith('/package.json') && !path.startsWith('/virtual')) {
        return files['/own/package.json'];
      }
      return files[path];
    });
  });

  afterEach(() => jest.restoreAllMocks());

  it('should log an error if the package.json does not exist', async () => {
    ownPackageJson(null);
    await initGenerator(tree, {} as any);
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('package.json not found'));
  });

  it('should do nothing without peer dependencies', async () => {
    ownPackageJson({ name: '@rxap/test' });
    await initGenerator(tree, {} as any);
    expect(console.log).toHaveBeenCalledWith('No peer dependencies found');
    expect(JSON.parse(tree.read('package.json', 'utf-8')!).dependencies).toEqual({});
  });

  it('should not add peers that are already present', async () => {
    ownPackageJson({ name: '@rxap/test', peerDependencies: { a: '^1.0.0' } });
    tree.write('package.json', JSON.stringify({ dependencies: { a: '1.0.0' } }));
    await initGenerator(tree, {} as any);
    expect(console.log).toHaveBeenCalledWith('No missing peer dependencies');
  });

  it('should add missing peers as dependencies', async () => {
    ownPackageJson({ name: 'some-package', peerDependencies: { a: '^1.0.0' } });
    await initGenerator(tree, {} as any);
    expect(JSON.parse(tree.read('package.json', 'utf-8')!).dependencies.a).toBe('^1.0.0');
    expect(console.log).toHaveBeenCalledWith('Peer dependency a has no package.json');
  });

  it('should add missing peers as devDependencies for dev dependency packages', async () => {
    ownPackageJson({ name: '@rxap/plugin-test', peerDependencies: { a: '^1.0.0' } });
    tree.write('package.json', JSON.stringify({ dependencies: { '@rxap/plugin-test': '1.0.0' } }));
    await initGenerator(tree, {} as any);
    const json = JSON.parse(tree.read('package.json', 'utf-8')!);
    expect(json.devDependencies['@rxap/plugin-test']).toBe('1.0.0');
    expect(json.dependencies['@rxap/plugin-test']).toBeUndefined();
    expect(json.devDependencies.a).toBe('^1.0.0');
  });

  it('should move nest/ngx packages from devDependencies to dependencies', async () => {
    ownPackageJson({ name: '@rxap/nest-test', peerDependencies: { a: '^1.0.0' } });
    tree.write('package.json', JSON.stringify({ devDependencies: { '@rxap/nest-test': '1.0.0' } }));
    await initGenerator(tree, {} as any);
    const json = JSON.parse(tree.read('package.json', 'utf-8')!);
    expect(json.dependencies['@rxap/nest-test']).toBe('1.0.0');
    expect(json.dependencies.a).toBe('^1.0.0');
  });

  describe('peer init generators', () => {

    const peerDir = '/virtual/node_modules/@peer/with-init';

    beforeEach(() => {
      ownPackageJson({ name: 'some-package', peerDependencies: { '@peer/with-init': '^1.0.0' } });
    });

    it('should skip peers without generators or schematics', async () => {
      files[`${ peerDir }/package.json`] = JSON.stringify({});
      await initGenerator(tree, {} as any);
      expect(console.log).toHaveBeenCalledWith('Peer dependency @peer/with-init has no generators or schematics');
    });

    it('should skip peers whose generators file is missing', async () => {
      files[`${ peerDir }/package.json`] = JSON.stringify({ generators: 'generators.json' });
      await initGenerator(tree, {} as any);
      expect(console.log).toHaveBeenCalledWith('Peer dependency @peer/with-init has no generators or schematics file');
    });

    it('should skip peers without init generator', async () => {
      files[`${ peerDir }/package.json`] = JSON.stringify({ schematics: 'generators.json' });
      files[`${ peerDir }/generators.json`] = JSON.stringify({ generators: {} });
      await initGenerator(tree, {} as any);
      expect(console.log).toHaveBeenCalledWith('Peer dependency @peer/with-init has no init generator');
    });

    it('should skip peers whose init generator file is missing', async () => {
      files[`${ peerDir }/package.json`] = JSON.stringify({ generators: 'generators.json' });
      files[`${ peerDir }/generators.json`] = JSON.stringify({ generators: { init: { factory: './src/generators/init/generator' } } });
      await initGenerator(tree, {} as any);
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('has no init generator file'));
    });

    it('should run the init generator of the peer', async () => {
      files[`${ peerDir }/package.json`] = JSON.stringify({ generators: 'generators.json' });
      files[`${ peerDir }/generators.json`] = JSON.stringify({ generators: { init: { factory: './src/generators/init/generator' } } });
      files[`${ peerDir }/src/generators/init/generator.js`] = '';
      const options = { skipFormat: true } as any;
      await initGenerator(tree, options);
      // eslint-disable-next-line @nx/enforce-module-boundaries
      const peerGenerator = require('/virtual/node_modules/@peer/with-init/src/generators/init/generator').default;
      expect(peerGenerator).toHaveBeenCalledWith(tree, options);
    });

    it('should skip peers whose init generator is not a function', async () => {
      const badDir = '/virtual/node_modules/@peer/bad-init';
      ownPackageJson({ name: 'some-package', peerDependencies: { '@peer/bad-init': '^1.0.0' } });
      files[`${ badDir }/package.json`] = JSON.stringify({ generators: 'generators.json' });
      files[`${ badDir }/generators.json`] = JSON.stringify({ generators: { init: { factory: './src/generators/init/generator' } } });
      files[`${ badDir }/src/generators/init/generator.js`] = '';
      await initGenerator(tree, {} as any);
      expect(console.log).toHaveBeenCalledWith('Peer dependency @peer/bad-init has no init generator function');
    });

  });

});
