import {
  addProjectConfiguration,
  readJson,
  Tree,
  writeJson,
} from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { CoerceCompodocTsConfig } from '../lib/coerce-compodoc-ts-config';
import { CoerceGitIgnore } from '../lib/coerce-git-ignore';
import initApplicationGenerator from './init-application/generator';
import initLibraryGenerator from './init-library/generator';
import initGenerator from './init/generator';

describe('compodoc generators', () => {

  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    addProjectConfiguration(tree, 'ng-lib', {
      root: 'libs/ng-lib',
      sourceRoot: 'libs/ng-lib/src',
      projectType: 'library',
      tags: [ 'angular' ],
      targets: {},
    });
    writeJson(tree, 'libs/ng-lib/tsconfig.json', { compilerOptions: {} });
    writeJson(tree, 'libs/ng-lib/package.json', { name: '@scope/ng-lib' });
    addProjectConfiguration(tree, 'ng-app', {
      root: 'apps/ng-app',
      sourceRoot: 'apps/ng-app/src',
      projectType: 'application',
      tags: [ 'angular' ],
      targets: { build: { executor: 'x', options: { outputPath: 'dist/apps/ng-app' } } },
    });
    writeJson(tree, 'apps/ng-app/tsconfig.json', { compilerOptions: {} });
    addProjectConfiguration(tree, 'plain', { root: 'libs/plain', projectType: 'library', targets: {} });
  });

  afterEach(() => jest.restoreAllMocks());

  describe('lib', () => {
    it('should coerce the git ignore files', () => {
      CoerceGitIgnore(tree, 'ng-lib');
      expect(tree.read('libs/ng-lib/.gitignore', 'utf-8')).toContain('compodoc');
      expect(tree.read('libs/ng-lib/.eslintignore', 'utf-8')).toContain('compodoc');
    });

    it('should create the compodoc tsconfig with angular defaults', () => {
      CoerceCompodocTsConfig(tree, 'ng-lib');
      const config = readJson(tree, 'libs/ng-lib/tsconfig.compodoc.json');
      expect(config.extends).toBe('./tsconfig.json');
      expect(config.include).toEqual([ 'src/**/*.ts' ]);
      expect(config.exclude).toContain('**/*.stories.ts');
      expect(config.compilerOptions.types).toContain('@angular/localize');
      expect(readJson(tree, 'libs/ng-lib/tsconfig.json').references).toEqual([ { path: './tsconfig.compodoc.json' } ]);
    });

    it('should use nest excludes', () => {
      addProjectConfiguration(tree, 'nest-lib', { root: 'libs/nest-lib', projectType: 'library', tags: [ 'nest' ], targets: {} });
      writeJson(tree, 'libs/nest-lib/tsconfig.json', {});
      CoerceCompodocTsConfig(tree, 'nest-lib');
      expect(readJson(tree, 'libs/nest-lib/tsconfig.compodoc.json').exclude).toEqual([ '**/*.spec.ts' ]);
    });
  });

  describe('init', () => {
    it('should initialize angular libraries and applications', async () => {
      await initGenerator(tree, { skipFormat: true });
      expect(readJson(tree, 'package.json').devDependencies['@compodoc/compodoc']).toBeDefined();
      expect(JSON.stringify(readJson(tree, 'nx.json').plugins)).toContain('plugin-compodoc');
      expect(tree.exists('libs/ng-lib/tsconfig.compodoc.json')).toBe(true);
      expect(tree.exists('apps/ng-app/tsconfig.compodoc.json')).toBe(true);
      expect(tree.exists('libs/plain/tsconfig.compodoc.json')).toBe(false);
    });
  });

  describe('init-library', () => {
    it('should configure angular libraries', async () => {
      await initLibraryGenerator(tree, { skipFormat: true });
      expect(tree.exists('libs/ng-lib/tsconfig.compodoc.json')).toBe(true);
      expect(tree.exists('apps/ng-app/tsconfig.compodoc.json')).toBe(false);
    });

    it('should add compodoc assets for publishable libraries', async () => {
      addProjectConfiguration(tree, 'pub', {
        root: 'libs/pub',
        sourceRoot: 'libs/pub/src',
        projectType: 'library',
        tags: [ 'angular' ],
        targets: { build: { executor: '@nx/js:tsc', options: { assets: [] } } },
      });
      writeJson(tree, 'libs/pub/package.json', { name: '@scope/pub', publishConfig: { access: 'public' } });
      writeJson(tree, 'libs/pub/tsconfig.json', {});
      writeJson(tree, 'libs/pub/ng-package.json', {});
      await initLibraryGenerator(tree, { project: 'pub', skipFormat: true });
      expect(readJson(tree, 'libs/pub/ng-package.json').assets).toContain('compodoc');
    });

    it('should honor skipProjects', async () => {
      await initLibraryGenerator(tree, { skipProjects: true, skipFormat: true });
      expect(tree.exists('libs/ng-lib/tsconfig.compodoc.json')).toBe(false);
    });
  });

  describe('init-application', () => {
    it('should configure angular applications', async () => {
      await initApplicationGenerator(tree, { skipFormat: true });
      expect(tree.exists('apps/ng-app/tsconfig.compodoc.json')).toBe(true);
      expect(tree.exists('libs/ng-lib/tsconfig.compodoc.json')).toBe(false);
    });

    it('should honor skipProjects', async () => {
      await initApplicationGenerator(tree, { skipProjects: true, skipFormat: true });
      expect(tree.exists('apps/ng-app/tsconfig.compodoc.json')).toBe(false);
    });
  });

});
