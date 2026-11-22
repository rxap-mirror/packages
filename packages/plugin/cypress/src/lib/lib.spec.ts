import {
  addProjectConfiguration,
  readProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { cleanup } from './cleanup';
import { coerceComponentTestTarget } from './coerce-component-test-target';
import { coerceCypressConfig } from './coerce-cypress-config';
import { coerceImplicitDependency } from './coerce-implicit-dependency';
import { guessBuildTarget } from './guess-build-target';

jest.mock('@nx/angular/generators', () => ({
  cypressComponentConfiguration: jest.fn(async () => undefined),
}));
jest.mock('@rxap/plugin-angular', () => ({
  AngularInitApplicationGenerator: jest.fn(async (tree: Tree) => {
    const { addProjectConfiguration: add } = require('@nx/devkit');
    add(tree, 'cypress', {
      root: 'angular/cypress',
      projectType: 'application',
      targets: { serve: {}, build: { executor: 'x' }, lint: {}, test: {}, 'extract-i18n': {} },
    });
  }),
}));

import { cypressComponentConfiguration } from '@nx/angular/generators';
import { AngularInitApplicationGenerator } from '@rxap/plugin-angular';
import { coerceCypressApplicationProject } from './coerce-cypress-application-project';
import { setupComponentTestTarget } from './setup-component-test-target';

describe('plugin-cypress lib', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    jest.clearAllMocks();
  });

  describe('cleanup', () => {
    it('does nothing without a commands file', () => {
      addProjectConfiguration(tree, 'app', { root: 'apps/app', targets: {} });
      cleanup(tree, 'app');
      expect(tree.exists('apps/app/cypress/support/commands.ts')).toBe(false);
    });

    it('comments out the login example', () => {
      addProjectConfiguration(tree, 'app', { root: 'apps/app', targets: {} });
      tree.write(
        'apps/app/cypress/support/commands.ts',
        `Cypress.Commands.add('login', (email, password) => {\n});`,
      );
      cleanup(tree, 'app');
      const content = tree.read('apps/app/cypress/support/commands.ts', 'utf-8');
      expect(content).toContain(`// Cypress.Commands.add('login'`);
    });
  });

  describe('coerceComponentTestTarget', () => {
    it('adds the open-component-test target', () => {
      const project: any = {
        root: 'a',
        targets: { 'component-test': { executor: 'e', options: { a: 1 } } },
      };
      coerceComponentTestTarget(tree, 'a', project);
      expect(project.targets['open-component-test']).toMatchObject({
        executor: 'e',
        options: { a: 1, watch: true },
      });
    });
  });

  describe('coerceCypressConfig', () => {
    beforeEach(() => addProjectConfiguration(tree, 'app', { root: 'apps/app', targets: {} }));

    it('creates the config when missing', () => {
      coerceCypressConfig(tree, 'app');
      expect(tree.read('apps/app/cypress.config.ts', 'utf-8')).toContain('componentTestingPreset(__filename)');
    });

    it('replaces nx preset configs', () => {
      tree.write('apps/app/cypress.config.ts', 'nxComponentTestingPreset');
      coerceCypressConfig(tree, 'app');
      expect(tree.read('apps/app/cypress.config.ts', 'utf-8')).toContain('workspace/cypress/config');
    });

    it('keeps custom configs', () => {
      tree.write('apps/app/cypress.config.ts', 'custom');
      coerceCypressConfig(tree, 'app');
      expect(tree.read('apps/app/cypress.config.ts', 'utf-8')).toBe('custom');
    });
  });

  describe('coerceImplicitDependency', () => {
    it('throws without cypress project', () => {
      expect(() => coerceImplicitDependency(tree, 'app')).toThrow('cypress does not exist');
    });

    it('adds the implicit dependency once', () => {
      addProjectConfiguration(tree, 'cypress', { root: 'c', targets: {} });
      coerceImplicitDependency(tree, 'app');
      coerceImplicitDependency(tree, 'app');
      expect(readProjectConfiguration(tree, 'cypress').implicitDependencies).toEqual(['app']);
    });
  });

  describe('guessBuildTarget', () => {
    it('prefers the cypress project', () => {
      addProjectConfiguration(tree, 'cypress', { root: 'c', targets: {} });
      expect(guessBuildTarget(tree)).toBe('cypress:build:development');
    });

    it('throws if nothing matches', () => {
      expect(() => guessBuildTarget(tree)).toThrow('Unable to guess build target');
    });
  });

  describe('setupComponentTestTarget', () => {
    it('forwards options to the nx generator', async () => {
      addProjectConfiguration(tree, 'cypress', { root: 'c', targets: {} });
      await setupComponentTestTarget(tree, 'lib', { generateTests: false, buildTarget: 'x:build' });
      expect(cypressComponentConfiguration).toHaveBeenCalledWith(
        tree,
        expect.objectContaining({ project: 'lib', generateTests: false, buildTarget: 'x:build', skipFormat: false }),
      );
    });

    it('uses defaults', async () => {
      addProjectConfiguration(tree, 'cypress', { root: 'c', targets: {} });
      await setupComponentTestTarget(tree, 'lib', {});
      expect(cypressComponentConfiguration).toHaveBeenCalledWith(
        tree,
        expect.objectContaining({ generateTests: true, buildTarget: 'cypress:build:development' }),
      );
    });
  });

  describe('coerceCypressApplicationProject', () => {
    it('creates the project and strips targets', async () => {
      await coerceCypressApplicationProject(tree);
      expect(AngularInitApplicationGenerator).toHaveBeenCalled();
      const p = readProjectConfiguration(tree, 'cypress');
      expect(Object.keys(p.targets)).toEqual(['build']);
      expect(p.tags).toEqual(['angular', 'ngx']);
    });

    it('is a no-op when it exists', async () => {
      addProjectConfiguration(tree, 'cypress', { root: 'c', targets: {} });
      await coerceCypressApplicationProject(tree);
      expect(AngularInitApplicationGenerator).not.toHaveBeenCalled();
    });
  });
});
