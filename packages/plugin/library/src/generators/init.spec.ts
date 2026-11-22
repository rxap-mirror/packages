import {
  addProjectConfiguration,
  readJson,
  readProjectConfiguration,
  Tree,
  writeJson,
} from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import addMigrationGenerator from './add-migration/generator';
import initBuildableGenerator from './init-buildable/generator';
import initPluginGenerator from './init-plugin/generator';
import initPresetGenerator from './init-preset/generator';
import initPublishableGenerator from './init-publishable/generator';
import initSchematicGenerator from './init-schematic/generator';
import initWithMigrationsGenerator from './init-with-migrations/generator';
import initGenerator from './init/generator';

jest.mock('@nx/plugin/generators', () => ({
  generatorGenerator: jest.fn(async () => undefined),
  migrationGenerator: jest.fn(async () => undefined),
}));

describe('library init generators', () => {

  let tree: Tree;

  function library(name: string, tags: string[], options: { publishable?: boolean, migrations?: boolean } = {}) {
    const root = `packages/${ tags[0] ?? 'misc' }/${ name }`;
    addProjectConfiguration(tree, name, {
      root,
      sourceRoot: `${ root }/src`,
      projectType: 'library',
      tags,
      targets: { build: { executor: '@nx/js:tsc', options: { outputPath: `dist/${ root }`, assets: [] } } },
    });
    writeJson(tree, `${ root }/package.json`, {
      name: `@scope/${ name }`,
      version: '1.0.0',
      ...(options.publishable === false ? { private: true } : { publishConfig: { access: 'public' } }),
    });
    writeJson(tree, `${ root }/tsconfig.lib.json`, {});
    tree.write(`${ root }/src/index.ts`, 'export {};');
    if (options.migrations) {
      writeJson(tree, `${ root }/migrations.json`, { generators: {} });
    }
    return root;
  }

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    writeJson(tree, 'package.json', {
      name: 'ws', version: '1.0.0', license: 'MIT', repository: { url: 'https://example.test/repo.git' }, devDependencies: { nx: '21.0.0', '@angular-devkit/schematics': '19.0.0' },
    });
    tree.write('LICENSE', 'MIT');
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => jest.restoreAllMocks());

  describe('init', () => {

    it('should initialize a plain publishable library', async () => {
      const root = library('plain', [ 'node' ]);
      await initGenerator(tree, { skipFormat: true });
      const project = readProjectConfiguration(tree, 'plain');
      expect(project.tags).toEqual(expect.arrayContaining([ 'packages' ]));
      expect(tree.read(`${ root }/.eslintignore`, 'utf-8')).toContain('dist');
      expect(tree.exists(`${ root }/LICENSE`)).toBe(true);
      expect(tree.exists(`${ root }/CHANGELOG.md`)).toBe(true);
      expect(JSON.stringify(readJson(tree, 'nx.json').plugins)).toContain('plugin-library');
    });

    it('should initialize plugin, schematic, preset and migration projects', async () => {
      const root = library('special', [ 'plugin', 'schematic', 'preset' ], { migrations: true });
      await initGenerator(tree, { skipFormat: true, project: 'special', indexExport: true, withInitGenerator: true } as any);
      const project = readProjectConfiguration(tree, 'special');
      expect(project.tags).toEqual(expect.arrayContaining([ 'plugin', 'schematic', 'preset' ]));
      expect(tree.exists(`${ root }/GUIDES.md`)).toBe(true);
    });

    it('should delete the initial library files', async () => {
      const root = library('initial', [ 'node' ]);
      tree.write(`${ root }/src/lib/initial.ts`, `export function initial(): string {\n  return 'initial';\n}`);
      tree.write(`${ root }/src/lib/initial.spec.ts`, '');
      await initGenerator(tree, { skipFormat: true });
      expect(tree.exists(`${ root }/src/lib/initial.ts`)).toBe(false);
      expect(tree.read(`${ root }/src/index.ts`, 'utf-8')).toBe('export {};\n');
    });

    it('should skip projects with skipProjects and non libraries', async () => {
      library('lib', [ 'node' ]);
      addProjectConfiguration(tree, 'app', { root: 'apps/app', projectType: 'application' });
      await initGenerator(tree, { skipFormat: true, skipProjects: true });
      expect(readProjectConfiguration(tree, 'lib').tags).toEqual([ 'node' ]);
    });

  });

  describe('sub generators', () => {

    it.each([
      [ 'init-buildable', initBuildableGenerator, [ 'node' ] ],
      [ 'init-plugin', initPluginGenerator, [ 'plugin' ] ],
      [ 'init-preset', initPresetGenerator, [ 'preset' ] ],
      [ 'init-schematic', initSchematicGenerator, [ 'schematic' ] ],
      [ 'init-publishable', initPublishableGenerator, [ 'node' ] ],
      [ 'init-with-migrations', initWithMigrationsGenerator, [ 'node' ] ],
    ] as const)('%s should run for a project', async (_name, generator, tags) => {
      const root = library('sub', [ ...tags ], { migrations: true });
      await (generator as any)(tree, { project: 'sub', skipFormat: true });
      expect(tree.exists(`${ root }/project.json`)).toBe(true);
    });

    it.each([
      initBuildableGenerator, initPluginGenerator, initPresetGenerator, initSchematicGenerator, initPublishableGenerator, initWithMigrationsGenerator,
    ])('should honor skipProjects', async (generator) => {
      library('sub', [ 'node' ]);
      await (generator as any)(tree, { skipProjects: true, skipFormat: true });
    });

    it('should add the init generator to publishable projects', async () => {
      const root = library('with-init', [ 'node' ]);
      await initPublishableGenerator(tree, { project: 'with-init', withInitGenerator: true, skipFormat: true });
      expect(tree.exists(`${ root }/GETSTARTED.md`)).toBe(true);
      expect(JSON.stringify(readProjectConfiguration(tree, 'with-init').targets!['build'].options.assets)).toContain('generators.json');
    });

  });

  describe('add-migration', () => {

    it('should require a version or increment', async () => {
      library('mig', [ 'node' ]);
      await expect(addMigrationGenerator(tree, { project: 'mig', name: 'x' })).rejects.toThrow('package version or an increment');
    });

    it('should create a migration with the incremented version', async () => {
      library('mig', [ 'node' ]);
      const { migrationGenerator } = require('@nx/plugin/generators');
      await addMigrationGenerator(tree, { project: 'mig', name: 'Fix Things', increment: 'major' });
      expect(migrationGenerator).toHaveBeenCalledWith(tree, expect.objectContaining({
        name: 'Fix Things', packageVersion: '2.0.0', path: expect.stringContaining('src/migrations/2.0.0/fix-things'),
      }));
    });

    it('should use an explicit package version', async () => {
      library('mig', [ 'node' ]);
      const { migrationGenerator } = require('@nx/plugin/generators');
      await addMigrationGenerator(tree, { project: 'mig', name: 'x', packageVersion: '5.1.0' });
      expect(migrationGenerator).toHaveBeenCalledWith(tree, expect.objectContaining({ packageVersion: '5.1.0' }));
    });

  });

});
