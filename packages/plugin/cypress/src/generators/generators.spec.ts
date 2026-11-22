import {
  addProjectConfiguration,
  readJson,
  Tree,
  writeJson,
} from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

jest.mock('@nx/angular/generators', () => ({
  cypressComponentConfiguration: jest.fn(async () => undefined),
}));
jest.mock('@rxap/plugin-angular', () => ({
  AngularInitApplicationGenerator: jest.fn(async (tree: Tree) => {
    const { addProjectConfiguration: add } = require('@nx/devkit');
    add(tree, 'cypress', {
      root: 'angular/cypress',
      projectType: 'application',
      targets: { serve: {}, build: { executor: 'x' } },
    });
  }),
}));
// prettier 3 uses dynamic imports, which are unavailable in the jest vm
jest.mock('prettier', () => ({
  format: jest.fn(async (text: string) => text),
  resolveConfig: jest.fn(async () => ({})),
}));

import { cypressComponentConfiguration } from '@nx/angular/generators';
import initApplicationGenerator from './init-application/generator';
import initGenerator from './init/generator';
import initLibraryGenerator from './init-library/generator';

function setupTree(): Tree {
  const tree = createTreeWithEmptyWorkspace();
  addProjectConfiguration(tree, 'workspace-tools', {
    root: 'tools',
    sourceRoot: 'tools/src',
    targets: {},
  });
  writeJson(tree, 'tools/tsconfig.lib.json', {});
  writeJson(tree, 'tools/tsconfig.spec.json', {});
  return tree;
}

describe('plugin-cypress generators', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = setupTree();
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  describe('init', () => {
    it('sets up the workspace', async () => {
      await initGenerator(tree, { skipFormat: true } as any);
      const pkg = readJson(tree, 'package.json');
      expect(pkg.devDependencies['@cypress/code-coverage']).toBeDefined();
      expect(pkg.devDependencies['@nx/cypress']).toBeDefined();
      const paths = readJson(tree, 'tsconfig.base.json').compilerOptions.paths;
      expect(paths['workspace/cypress/commands']).toEqual(['tools/src/cypress/commands.ts']);
      expect(readJson(tree, 'tools/tsconfig.lib.json').exclude).toContain('src/cypress/**/*');
      expect(readJson(tree, 'tools/tsconfig.spec.json').exclude).toContain('src/cypress/**/*');
      expect(readJson(tree, 'nx.json').targetDefaults['component-test'].configurations.open.watch).toBe(true);
      expect(tree.exists('angular/cypress/project.json')).toBe(true);
    });

    it('accepts a project option and formats', async () => {
      await initGenerator(tree, { project: 'x' } as any);
      expect(tree.exists('tools/src/cypress')).toBe(true);
    });
  });

  describe('init-application', () => {
    it('runs on angular application projects', async () => {
      addProjectConfiguration(tree, 'app', {
        root: 'apps/app',
        projectType: 'application',
        tags: ['angular'],
        targets: { build: { executor: '@angular-devkit/build-angular:application' } },
      });
      await initApplicationGenerator(tree, { skipFormat: true } as any);
      expect(tree.exists('tools/src/cypress')).toBe(true);
    });

    it('skips projects', async () => {
      await initApplicationGenerator(tree, { skipProjects: true, project: 'app', skipFormat: true } as any);
      expect(tree.exists('tools/src/cypress')).toBe(true);
    });

    it('handles the explicit project', async () => {
      addProjectConfiguration(tree, 'app', { root: 'apps/app', targets: {} });
      await initApplicationGenerator(tree, { project: 'app' } as any);
    });
  });

  describe('init-library', () => {
    it('does not add component target by default', async () => {
      addProjectConfiguration(tree, 'lib', { root: 'libs/lib', projectType: 'library', tags: ['angular'], targets: {} });
      tree.write('libs/lib/cypress/support/commands.ts', 'export {};\n');
      await initLibraryGenerator(tree, { project: 'lib', skipFormat: true } as any);
      expect(cypressComponentConfiguration).not.toHaveBeenCalled();
      expect(tree.read('libs/lib/cypress.config.ts', 'utf-8')).toContain('componentTestingPreset');
      expect(readJson(tree, 'angular/cypress/project.json').implicitDependencies).toContain('lib');
      expect(tree.read('libs/lib/cypress/support/commands.ts', 'utf-8')).toContain('workspace/cypress/commands');
    });

    it('sets up component tests when requested', async () => {
      addProjectConfiguration(tree, 'lib', { root: 'libs/lib', projectType: 'library', tags: ['angular'], targets: {} });
      tree.write('libs/lib/cypress/support/commands.ts', 'export {};\n');
      (cypressComponentConfiguration as jest.Mock).mockImplementation(async (t: Tree) => {
        const p = readJson(t, 'libs/lib/project.json');
        p.targets['component-test'] = { executor: '@nx/cypress:cypress', options: { cypressConfig: 'x' } };
        writeJson(t, 'libs/lib/project.json', p);
      });
      await initLibraryGenerator(tree, { project: 'lib', component: true, skipFormat: true } as any);
      expect(cypressComponentConfiguration).toHaveBeenCalled();
      const p = readJson(tree, 'libs/lib/project.json');
      expect(p.targets['open-component-test'].options.watch).toBe(true);
    });

    it('skips projects when skipProjects is set', async () => {
      await initLibraryGenerator(tree, { skipProjects: true } as any);
      expect(tree.exists('tools/src/cypress')).toBe(true);
    });

    it('skips non-angular libraries', async () => {
      addProjectConfiguration(tree, 'plain', { root: 'libs/plain', projectType: 'library', targets: {} });
      await initLibraryGenerator(tree, { skipFormat: true } as any);
      expect(tree.exists('libs/plain/cypress.config.ts')).toBe(false);
    });
  });
});
