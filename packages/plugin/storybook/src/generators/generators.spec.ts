import {
  addProjectConfiguration,
  readJson,
  readProjectConfiguration,
  Tree,
  writeJson,
} from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import initApplicationGenerator from './init-application/generator';
import initLibraryGenerator from './init-library/generator';
import initGenerator from './init/generator';

jest.mock('prettier', () => ({ format: async (text: string) => text, resolveConfig: async () => null }));
jest.mock('@nx/angular/generators', () => ({
  storybookConfigurationGenerator: jest.fn(async (tree: Tree, options: any) => {
    const { readProjectConfiguration: read, updateProjectConfiguration: update } = require('@nx/devkit');
    const project = read(tree, options.project);
    project.targets['storybook'] = { executor: '@storybook/angular:start-storybook', options: {} };
    project.targets['build-storybook'] = { executor: '@storybook/angular:build-storybook', options: {} };
    update(tree, options.project, project);
    tree.write(`${ project.root }/.storybook/main.ts`, `import type { StorybookConfig } from '@storybook/angular';\nconst config: StorybookConfig = {};\nexport default config;\n`);
    tree.write(`${ project.root }/.storybook/preview.ts`, `export const decorators = [];\n`);
    tree.write(`${ project.root }/.storybook/tsconfig.json`, JSON.stringify({ include: [], compilerOptions: {} }));
  }),
}));

describe('storybook generators', () => {

  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    addProjectConfiguration(tree, 'my-lib', {
      root: 'libs/my-lib',
      sourceRoot: 'libs/my-lib/src',
      projectType: 'library',
      tags: [ 'angular' ],
      targets: {},
    });
    addProjectConfiguration(tree, 'my-app', {
      root: 'apps/my-app',
      sourceRoot: 'apps/my-app/src',
      projectType: 'application',
      tags: [ 'angular' ],
      targets: { build: { executor: '@angular/build:application' } },
    });
    writeJson(tree, 'libs/my-lib/package.json', { name: '@scope/my-lib' });
  });

  afterEach(() => jest.restoreAllMocks());

  describe('init', () => {
    it('should add the storybook dependencies', async () => {
      await initGenerator(tree, { project: 'my-lib', skipFormat: true });
      const devDependencies = readJson(tree, 'package.json').devDependencies;
      expect(devDependencies['@nx/storybook']).toBeDefined();
      expect(devDependencies['@storybook/angular']).toBeDefined();
      expect(devDependencies['@compodoc/compodoc']).toBeDefined();
    });
  });

  describe('init-library', () => {
    it('should skip projects without options', async () => {
      await initLibraryGenerator(tree, { skipProjects: true, skipFormat: true });
      expect(tree.exists('libs/my-lib/.storybook/main.ts')).toBe(false);
    });

    it('should configure a library project', async () => {
      await initLibraryGenerator(tree, { project: 'my-lib', compodoc: true, skipFormat: true });
      const main = tree.read('libs/my-lib/.storybook/main.ts', 'utf-8')!;
      expect(main).toContain('staticDirs');
      expect(main).toContain('@storybook/addon-themes');
      expect(main).toContain('autodocs');
      const preview = tree.read('libs/my-lib/.storybook/preview.ts', 'utf-8')!;
      expect(preview).toContain('withThemeByClassName');
      expect(preview).toContain('setCompodocJson(docJson)');
      expect(preview).toContain('my-lib-storybook');
      const project = readProjectConfiguration(tree, 'my-lib');
      expect(project.targets!['storybook'].options.compodoc).toBe(true);
      expect(project.targets!['build-storybook'].options.styles).toContain('shared/angular/styles/_index.scss');
      const tsconfig = readJson(tree, 'libs/my-lib/.storybook/tsconfig.json');
      expect(tsconfig.compilerOptions.resolveJsonModule).toBe(true);
      expect(tsconfig.compilerOptions.types).toContain('@angular/localize');
    });

    it('should be idempotent', async () => {
      await initLibraryGenerator(tree, { project: 'my-lib', skipFormat: true });
      const before = tree.read('libs/my-lib/.storybook/preview.ts', 'utf-8');
      await initLibraryGenerator(tree, { project: 'my-lib', skipFormat: true });
      expect(tree.read('libs/my-lib/.storybook/preview.ts', 'utf-8')).toBe(before);
    });

    it('should not touch application projects', async () => {
      await initLibraryGenerator(tree, { skipFormat: true });
      expect(tree.exists('apps/my-app/.storybook/main.ts')).toBe(false);
    });
  });

  describe('init-application', () => {
    it('should configure an application project', async () => {
      await initApplicationGenerator(tree, { project: 'my-app', skipFormat: true } as any);
      const main = tree.read('apps/my-app/.storybook/main.ts', 'utf-8')!;
      expect(main).toContain('stories');
      expect(main).toContain('feature');
      const project = readProjectConfiguration(tree, 'my-app');
      expect(project.targets!['storybook'].options.browserTarget).toBe('my-app:build:development');
    });

    it('should skip projects with skipProjects', async () => {
      await initApplicationGenerator(tree, { skipProjects: true, skipFormat: true } as any);
      expect(tree.exists('apps/my-app/.storybook/main.ts')).toBe(false);
    });

    it('should skip library projects', async () => {
      await initApplicationGenerator(tree, { skipFormat: true } as any);
      expect(tree.exists('libs/my-lib/.storybook/main.ts')).toBe(false);
    });
  });

  it('should keep an existing storybook target', async () => {
    const { storybookConfigurationGenerator } = require('@nx/angular/generators');
    storybookConfigurationGenerator.mockClear();
    const project = readProjectConfiguration(tree, 'my-lib');
    project.targets!['storybook'] = { executor: 'x' };
    const { updateProjectConfiguration } = require('@nx/devkit');
    updateProjectConfiguration(tree, 'my-lib', project);
    tree.write('libs/my-lib/.storybook/main.ts', 'const config = {};\nexport default config;\n');
    tree.write('libs/my-lib/.storybook/preview.ts', 'export const decorators = [];\n');
    tree.write('libs/my-lib/.storybook/tsconfig.json', '{}');
    await initLibraryGenerator(tree, { project: 'my-lib', skipFormat: true });
    expect(storybookConfigurationGenerator).not.toHaveBeenCalled();
  });

});
