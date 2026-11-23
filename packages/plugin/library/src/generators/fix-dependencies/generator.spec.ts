import {
  addProjectConfiguration,
  readJson,
  Tree,
  writeJson,
} from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { LoadProjectToPackageMapping } from '@rxap/workspace-utilities';
import fixDependenciesGenerator, {
  removePackageFromDependencies,
  widenPeerDependencyRange,
  removeSelfReferenceFromDependencies,
  replaceLatestPackageVersionForProject,
  resolveLatestPackageVersion,
} from './generator';

const projectGraph = {
  nodes: {
    lib: { name: 'lib', type: 'lib', data: { root: 'libs/lib' } },
    other: { name: 'other', type: 'lib', data: { root: 'libs/other' } },
  },
  dependencies: { lib: [], other: [] },
};
jest.mock('prettier', () => ({ format: async (text: string) => text, resolveConfig: async () => null }));
jest.mock('@nx/devkit', () => ({
  ...jest.requireActual('@nx/devkit'),
  createProjectGraphAsync: jest.fn(async () => projectGraph),
}));
const getLatestPackageVersion = jest.fn(async (name: string) => name === 'tslib' ? '2.8.0' : name === 'unknown-pkg' ? 'latest' : '9.9.9');
jest.mock('@rxap/node-utilities', () => ({ GetLatestPackageVersion: (name: string) => getLatestPackageVersion(name) }));

describe('fix-dependencies generator', () => {

  let tree: Tree;
  const root = 'libs/lib';

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    writeJson(tree, 'package.json', {
      name: 'ws', version: '1.0.0',
      dependencies: { '@angular/core': '^19.0.0', rxjs: '~7.8.0', lodash: '4.0.0', '@scope/other': '1.0.0' },
      devDependencies: {},
    });
    addProjectConfiguration(tree, 'lib', {
      root, sourceRoot: `${ root }/src`, projectType: 'library',
      targets: { build: { executor: '@nx/js:tsc' } },
    });
    writeJson(tree, `${ root }/package.json`, {
      name: '@scope/lib', version: '1.2.3', publishConfig: { access: 'public' },
      dependencies: { lodash: '1.0.0', removed: '1.0.0', '@scope/lib': '1.0.0' },
      peerDependencies: { gone: '1.0.0' },
    });
    addProjectConfiguration(tree, 'other', { root: 'libs/other', sourceRoot: 'libs/other/src', projectType: 'library', targets: { build: { executor: 'x' } } });
    writeJson(tree, 'libs/other/package.json', { name: '@scope/other', version: '3.0.0', publishConfig: { access: 'public' } });
    tree.write(`${ root }/src/index.ts`, 'export {};');
    tree.write(`${ root }/src/lib/a.ts`, [
      `import { Component } from '@angular/core';`,
      `import { of } from 'rxjs/operators';`,
      `import { x } from '@scope/other';`,
      `import { u } from 'unknown-pkg';`,
      `import { join } from 'path';`,
      `import { Showcase } from '@ng-prism/core';`,
      `import { local } from './local';`,
    ].join('\n'));
    tree.write(`${ root }/src/lib/a.spec.ts`, `import 'ignored-test-package';`);
    tree.write(`${ root }/src/generators/g.ts`, `import _ from 'lodash';`);
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => jest.restoreAllMocks());

  it('should fix the dependencies of publishable projects', async () => {
    await fixDependenciesGenerator(tree, { projects: [ 'lib' ] });
    const packageJson = readJson(tree, `${ root }/package.json`);
    expect(packageJson.peerDependencies).toEqual(expect.objectContaining({
      '@angular/core': '^19.0.0', rxjs: '^7.0.0', '@scope/other': '^3.0.0', 'unknown-pkg': 'latest',
    }));
    expect(packageJson.peerDependencies['ignored-test-package']).toBeUndefined();
    expect(packageJson.peerDependencies['path']).toBeUndefined();
    expect(packageJson.peerDependencies['@ng-prism/core']).toBeUndefined();
    expect(packageJson.dependencies['lodash']).toBe('4.0.0');
    expect(packageJson.dependencies['removed']).toBeUndefined();
    expect(packageJson.dependencies['@scope/lib']).toBeUndefined();
    expect(packageJson.dependencies['tslib']).toBe('2.8.0');
    expect(packageJson.peerDependencies['gone']).toBeUndefined();
  });

  it('should resolve latest versions and fail in strict mode', async () => {
    await expect(fixDependenciesGenerator(tree, { projects: [ 'lib' ], strict: true })).rejects.toThrow('unknown version');
    await fixDependenciesGenerator(tree, { projects: [ 'lib' ], resolve: true });
    expect(readJson(tree, `${ root }/package.json`).peerDependencies['unknown-pkg']).toBe('latest');
    await replaceLatestPackageVersionForProject(tree, 'lib');
    expect(getLatestPackageVersion).toHaveBeenCalledWith('unknown-pkg');
  });

  it('should apply the dependency options', async () => {
    await fixDependenciesGenerator(tree, {
      projects: [ 'lib' ], onlyDependencies: true, dependencies: [ 'forced-dep', '@scope/other' ], peerDependencies: [ 'forced-peer' ],
    });
    const packageJson = readJson(tree, `${ root }/package.json`);
    expect(packageJson.dependencies['forced-dep']).toBe('latest');
    expect(packageJson.dependencies['@scope/other']).toBeDefined();
    expect(packageJson.peerDependencies['forced-peer']).toBe('latest');
    expect(packageJson.dependencies['@angular/core']).toBeUndefined();
  });

  it('should reset dependencies', async () => {
    await fixDependenciesGenerator(tree, { projects: [ 'lib' ], reset: true });
    expect(readJson(tree, `${ root }/package.json`).dependencies['removed']).toBeUndefined();
    writeJson(tree, `${ root }/package.json`, { name: '@scope/lib', publishConfig: { access: 'public' }, dependencies: { keep: '1' } });
    await fixDependenciesGenerator(tree, { projects: [ 'lib' ], resetAll: true });
    expect(readJson(tree, `${ root }/package.json`).dependencies['keep']).toBeUndefined();
  });

  it('should skip not selected projects', async () => {
    const before = tree.read('libs/other/package.json', 'utf-8');
    await fixDependenciesGenerator(tree, { projects: [ 'lib' ] });
    expect(tree.read('libs/other/package.json', 'utf-8')).toBe(before);
  });

  describe('helpers', () => {

    it('should cache resolved package versions', async () => {
      getLatestPackageVersion.mockClear();
      await resolveLatestPackageVersion('cached-pkg');
      await resolveLatestPackageVersion('cached-pkg');
      expect(getLatestPackageVersion).toHaveBeenCalledTimes(1);
    });

    it('should remove packages from dependencies', () => {
      const dependencies: Record<string, string> = { a: '1', b: '2' };
      removePackageFromDependencies('a', dependencies);
      removePackageFromDependencies('c', dependencies);
      removePackageFromDependencies('c', undefined);
      expect(dependencies).toEqual({ b: '2' });
    });

    it('should remove self references', () => {
      LoadProjectToPackageMapping(tree, projectGraph as any);
      const packageJson: any = {
        dependencies: { '@scope/lib': '1' }, peerDependencies: { '@scope/lib': '1' },
        devDependencies: { '@scope/lib': '1' }, optionalDependencies: { '@scope/lib': '1' },
      };
      removeSelfReferenceFromDependencies('lib', packageJson);
      expect(packageJson).toEqual({ dependencies: {}, peerDependencies: {}, devDependencies: {}, optionalDependencies: {} });
    });

  });

  describe('widenPeerDependencyRange', () => {

    it('widens caret, tilde and exact versions to the major release', () => {
      expect(widenPeerDependencyRange('@angular/core', '^22.3.0')).toBe('^22.0.0');
      expect(widenPeerDependencyRange('@nestjs/common', '~12.6.0')).toBe('^12.0.0');
      expect(widenPeerDependencyRange('rxjs', '7.8.2')).toBe('^7.0.0');
    });

    it('keeps the minor for 0.x packages because the minor is their breaking version', () => {
      expect(widenPeerDependencyRange('@marker.io/browser', '^0.20.2')).toBe('^0.20.0');
    });

    it('leaves intentionally wide ranges and internal packages untouched', () => {
      expect(widenPeerDependencyRange('jsonwebtoken', '*')).toBe('*');
      expect(widenPeerDependencyRange('@angular/core', '^21.0.0 || ^22.0.0')).toBe('^21.0.0 || ^22.0.0');
      expect(widenPeerDependencyRange('x', '>=2.1.0')).toBe('>=2.1.0');
      expect(widenPeerDependencyRange('@rxap/utilities', '^22.3.1')).toBe('^22.3.1');
    });

  });

});
