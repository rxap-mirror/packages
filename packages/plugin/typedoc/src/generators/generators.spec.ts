import {
  addProjectConfiguration,
  readJson,
  Tree,
  writeJson,
} from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import initApplicationGenerator from './init-application/generator';
import initLibraryGenerator from './init-library/generator';
import initGenerator from './init/generator';
import { CoerceGitIgnore } from '../lib/coerce-git-ignore';
import { CoerceTypedocTsConfig } from '../lib/coerce-typedoc-ts-config';

describe('typedoc generators', () => {

  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    addProjectConfiguration(tree, 'my-lib', {
      root: 'libs/my-lib',
      sourceRoot: 'libs/my-lib/src',
      projectType: 'library',
      targets: {},
    });
    writeJson(tree, 'libs/my-lib/tsconfig.json', { compilerOptions: {} });
    writeJson(tree, 'libs/my-lib/package.json', { name: '@scope/my-lib' });
    tree.write('libs/my-lib/src/index.ts', 'export {};');
    addProjectConfiguration(tree, 'my-app', {
      root: 'apps/my-app',
      sourceRoot: 'apps/my-app/src',
      projectType: 'application',
      targets: { build: { executor: 'x', options: { outputPath: 'dist/apps/my-app' } } },
    });
    writeJson(tree, 'apps/my-app/tsconfig.json', { compilerOptions: {} });
  });

  afterEach(() => jest.restoreAllMocks());

  describe('lib', () => {
    it('should coerce the git ignore files', () => {
      CoerceGitIgnore(tree, 'my-lib');
      expect(tree.read('libs/my-lib/.gitignore', 'utf-8')).toContain('docs');
      expect(tree.read('libs/my-lib/.eslintignore', 'utf-8')).toContain('docs');
    });

    it('should create a typedoc tsconfig and reference it', () => {
      CoerceTypedocTsConfig(tree, 'my-lib');
      const config = readJson(tree, 'libs/my-lib/tsconfig.typedoc.json');
      expect(config.extends).toBe('./tsconfig.json');
      expect(config.include).toEqual([ 'src/**/*.ts' ]);
      expect(readJson(tree, 'libs/my-lib/tsconfig.json').references).toEqual([ { path: './tsconfig.typedoc.json' } ]);
      CoerceTypedocTsConfig(tree, 'my-lib');
      expect(readJson(tree, 'libs/my-lib/tsconfig.json').references).toHaveLength(1);
    });

    it('should add angular exclusions', () => {
      tree.write('libs/my-lib/project.json', JSON.stringify({ name: 'my-lib', root: 'libs/my-lib', projectType: 'library', tags: [ 'angular' ], targets: {} }));
      CoerceTypedocTsConfig(tree, 'my-lib');
      const config = readJson(tree, 'libs/my-lib/tsconfig.typedoc.json');
      expect(config.exclude).toEqual(expect.arrayContaining([ '**/*.spec.ts' ]));
    });
  });

  describe('init', () => {
    it('should initialize libraries with an index.ts', async () => {
      await initGenerator(tree, { skipFormat: true });
      expect(readJson(tree, 'package.json').devDependencies['typedoc']).toBeDefined();
      expect(JSON.stringify(readJson(tree, 'nx.json').plugins)).toContain('plugin-typedoc');
      expect(tree.read('.gitignore', 'utf-8')).toContain('docs');
      expect(tree.exists('libs/my-lib/tsconfig.typedoc.json')).toBe(true);
    });

    it('should skip projects without index.ts', async () => {
      tree.delete('libs/my-lib/src/index.ts');
      await initGenerator(tree, { skipFormat: true });
      expect(tree.exists('libs/my-lib/tsconfig.typedoc.json')).toBe(false);
    });
  });

  describe('init-library', () => {
    it('should configure the library project', async () => {
      await initLibraryGenerator(tree, { skipFormat: true });
      expect(tree.exists('libs/my-lib/tsconfig.typedoc.json')).toBe(true);
      expect(tree.read('libs/my-lib/.gitignore', 'utf-8')).toContain('docs');
      expect(tree.exists('apps/my-app/tsconfig.typedoc.json')).toBe(false);
    });

    it('should add docs to the build assets of publishable libraries', async () => {
      addProjectConfiguration(tree, 'pub', {
        root: 'libs/pub',
        sourceRoot: 'libs/pub/src',
        projectType: 'library',
        targets: { build: { executor: '@nx/js:tsc', options: { assets: [] } } },
      });
      writeJson(tree, 'libs/pub/package.json', { name: '@scope/pub', publishConfig: { access: 'public' } });
      writeJson(tree, 'libs/pub/tsconfig.json', {});
      await initLibraryGenerator(tree, { project: 'pub', skipFormat: true });
      const project = readJson(tree, 'libs/pub/project.json');
      expect(JSON.stringify(project.targets.build.options.assets)).toContain('libs/pub/docs');
    });

    it('should skip projects with skipProjects', async () => {
      await initLibraryGenerator(tree, { skipProjects: true, skipFormat: true });
      expect(tree.exists('libs/my-lib/tsconfig.typedoc.json')).toBe(false);
    });
  });

  describe('init-application', () => {
    it('should configure only application projects', async () => {
      await initApplicationGenerator(tree, { skipFormat: true });
      expect(tree.exists('apps/my-app/tsconfig.typedoc.json')).toBe(true);
      expect(tree.exists('libs/my-lib/tsconfig.typedoc.json')).toBe(false);
    });

    it('should skip projects with skipProjects', async () => {
      await initApplicationGenerator(tree, { skipProjects: true, skipFormat: true });
      expect(tree.exists('apps/my-app/tsconfig.typedoc.json')).toBe(false);
    });
  });

});
