/** @jest-environment node */
jest.mock('prettier', () => ({ format: async (text: string) => text, resolveConfig: async () => null }));
jest.mock('@nx/devkit', () => ({
  ...jest.requireActual('@nx/devkit'),
  installPackagesTask: jest.fn(),
}));

const files = new Map<string, string>();
const realFs = jest.requireActual('fs');
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  existsSync: (p: string) => files.has(p) || (!p.includes('virtual-peer') && !p.endsWith('/package.json') && realFs.existsSync(p)),
  readFileSync: (p: string, ...rest: any[]) => files.has(p) ? files.get(p) : realFs.readFileSync(p, ...rest),
}));

import { readJson, writeJson } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { join } from 'path';
import initGenerator from './generator';

const ownPackageJson = join(__dirname, '..', '..', '..', 'package.json');

function setOwn(pkg: any) {
  files.set(ownPackageJson, JSON.stringify(pkg));
}

describe('schematic-open-api init generator', () => {
  beforeEach(() => {
    files.clear();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  it('logs when no peer dependencies are defined', async () => {
    setOwn({ name: '@rxap/schematics-x' });
    await initGenerator(createTreeWithEmptyWorkspace(), {} as any);
    expect(console.log).toHaveBeenCalledWith('No peer dependencies found');
  });

  it('logs when the peer list is empty', async () => {
    setOwn({ name: '@rxap/schematics-x', peerDependencies: {} });
    await initGenerator(createTreeWithEmptyWorkspace(), {} as any);
    expect(console.log).toHaveBeenCalledWith('No peer dependencies found');
  });

  it('moves schematic packages to devDependencies and adds missing peers', async () => {
    setOwn({ name: '@rxap/schematics-x', peerDependencies: { 'virtual-peer-a': '^1.0.0' } });
    const tree = createTreeWithEmptyWorkspace();
    writeJson(tree, 'package.json', { name: 'root', dependencies: { '@rxap/schematics-x': '1.0.0' }, devDependencies: {} });
    await initGenerator(tree, {} as any);
    const json = readJson(tree, 'package.json');
    expect(json.devDependencies['@rxap/schematics-x']).toBe('1.0.0');
    expect(json.dependencies['@rxap/schematics-x']).toBeUndefined();
    expect(json.devDependencies['virtual-peer-a']).toBe('^1.0.0');
    expect(console.log).toHaveBeenCalledWith('Peer dependency virtual-peer-a has no package.json');
  });

  it('moves ngx/nest packages to dependencies', async () => {
    setOwn({ name: '@rxap/ngx-x', peerDependencies: { 'virtual-peer-a': '^1.0.0' } });
    const tree = createTreeWithEmptyWorkspace();
    writeJson(tree, 'package.json', { name: 'root', dependencies: {}, devDependencies: { '@rxap/ngx-x': '1.0.0' } });
    await initGenerator(tree, {} as any);
    const json = readJson(tree, 'package.json');
    expect(json.dependencies['@rxap/ngx-x']).toBe('1.0.0');
    expect(json.dependencies['virtual-peer-a']).toBe('^1.0.0');
  });

  it('does nothing when all peers exist', async () => {
    setOwn({ name: '@rxap/other', peerDependencies: { 'virtual-peer-a': '^1.0.0' } });
    const tree = createTreeWithEmptyWorkspace();
    writeJson(tree, 'package.json', { name: 'root', dependencies: { 'virtual-peer-a': '1' }, devDependencies: {} });
    await initGenerator(tree, {} as any);
    expect(console.log).toHaveBeenCalledWith('No missing peer dependencies');
  });

  it('runs peer init generators when available', async () => {
    setOwn({ name: '@rxap/other', peerDependencies: { 'virtual-peer-a': '^1.0.0', 'virtual-peer-b': '1', 'virtual-peer-c': '1', 'virtual-peer-d': '1', 'virtual-peer-e': '1', 'virtual-peer-f': '1' } });
    const tree = createTreeWithEmptyWorkspace();
    const dir = (n: string) => join(tree.root, 'node_modules', n);
    // a: no generators/schematics
    files.set(join(dir('virtual-peer-a'), 'package.json'), JSON.stringify({}));
    // b: config file missing
    files.set(join(dir('virtual-peer-b'), 'package.json'), JSON.stringify({ generators: './generators.json' }));
    // c: config without init
    files.set(join(dir('virtual-peer-c'), 'package.json'), JSON.stringify({ schematics: './c.json' }));
    files.set(join(dir('virtual-peer-c'), 'c.json'), JSON.stringify({ generators: {} }));
    // d: init factory file missing
    files.set(join(dir('virtual-peer-d'), 'package.json'), JSON.stringify({ generators: './g.json' }));
    files.set(join(dir('virtual-peer-d'), 'g.json'), JSON.stringify({ generators: { init: { factory: './init' } } }));
    // e: init without default function
    files.set(join(dir('virtual-peer-e'), 'package.json'), JSON.stringify({ generators: './g.json' }));
    files.set(join(dir('virtual-peer-e'), 'g.json'), JSON.stringify({ generators: { init: { factory: './init' } } }));
    files.set(join(dir('virtual-peer-e'), 'init.js'), '');
    jest.doMock(join(dir('virtual-peer-e'), './init'), () => ({ default: 'nope' }), { virtual: true });
    // f: working init
    files.set(join(dir('virtual-peer-f'), 'package.json'), JSON.stringify({ generators: './g.json' }));
    files.set(join(dir('virtual-peer-f'), 'g.json'), JSON.stringify({ generators: { init: { factory: './init' } } }));
    files.set(join(dir('virtual-peer-f'), 'init.js'), '');
    const peerInit = jest.fn();
    jest.doMock(join(dir('virtual-peer-f'), './init'), () => ({ default: peerInit }), { virtual: true });

    await initGenerator(tree, { skipFormat: true } as any);

    expect(console.log).toHaveBeenCalledWith('Peer dependency virtual-peer-a has no generators or schematics');
    expect(console.log).toHaveBeenCalledWith('Peer dependency virtual-peer-b has no generators or schematics file');
    expect(console.log).toHaveBeenCalledWith('Peer dependency virtual-peer-c has no init generator');
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('virtual-peer-d has no init generator file'));
    expect(console.log).toHaveBeenCalledWith('Peer dependency virtual-peer-e has no init generator function');
    expect(peerInit).toHaveBeenCalledWith(tree, { skipFormat: true });
  });

  it('returns when own package.json is missing', async () => {
    const ownDir = ownPackageJson;
    const spy = jest.spyOn(require('fs'), 'existsSync').mockImplementation(((p: string) => p !== ownDir) as any);
    await initGenerator(createTreeWithEmptyWorkspace(), {} as any);
    expect(console.error).toHaveBeenCalled();
    spy.mockRestore();
  });
});
