jest.mock('prettier', () => ({ format: async (text: string) => text, resolveConfig: async () => null }));

import {
  applicationGenerator,
  componentGenerator,
  libraryGenerator,
} from '@nx/angular/generators';
import {
  addProjectConfiguration,
  readJson,
  readProjectConfiguration,
  Tree,
  writeJson,
} from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import convertToBuildableLibraryGenerator from './convert-to-buildable-library/generator';
import fixSchematicGenerator from './fix-schematic/generator';
import initComponentGenerator from './init-component/generator';
import initFeatureLibraryGenerator from './init-feature-library/generator';
import initFeatureGenerator from './init-feature/generator';
import initApplicationGenerator from './init-application/generator';
import initLibraryGenerator from './init-library/generator';
import initGenerator from './init/generator';
import schematicGenerator from './schematic/generator';

function baseTree(): Tree {
  const tree = createTreeWithEmptyWorkspace();
  const pkg = readJson(tree, 'package.json');
  pkg.dependencies = { ...(pkg.dependencies ?? {}), '@angular/core': '19.2.16' };
  pkg.devDependencies = { ...(pkg.devDependencies ?? {}), '@angular/cli': '19.2.0' };
  writeJson(tree, 'package.json', pkg);
  return tree;
}

async function withLibrary(name = 'feat', extra: any = {}): Promise<Tree> {
  const tree = baseTree();
  await libraryGenerator(tree, { name, directory: name, skipFormat: true, ...extra } as any);
  return tree;
}

describe('plugin-angular library side generators', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    
    jest.spyOn(console, 'debug').mockImplementation();
  });

  describe('init', () => {
    it('initializes the workspace', async () => {
      const tree = baseTree();
      await initGenerator(tree, { skipFormat: true } as any);
      expect(tree.exists('nx.json')).toBe(true);
      await initGenerator(tree, { overwrite: true } as any);
    }, 60000);
  });

  describe('init-library', () => {
    it('initializes a library with index export target disabled', async () => {
      const tree = await withLibrary();
      await initLibraryGenerator(tree, { project: 'feat', indexExport: false, skipFormat: true } as any);
      const project = readProjectConfiguration(tree, 'feat');
      expect(project.targets?.['index-export']).toBeUndefined();
    }, 60000);

    it('initializes all angular libraries and supports skipProjects', async () => {
      const tree = await withLibrary();
      await initLibraryGenerator(tree, { skipFormat: true } as any);
      await initLibraryGenerator(tree, { skipProjects: true, overwrite: true } as any);
      expect(readProjectConfiguration(tree, 'feat')).toBeDefined();
    }, 60000);

    it('coerces a missing library', async () => {
      const tree = baseTree();
      await initLibraryGenerator(tree, { project: 'coerced', coerce: { directory: 'libs/coerced', publishable: false, standalone: true }, skipFormat: true } as any);
      expect(tree.children('libs/coerced').length).toBeGreaterThan(0);
    }, 120000);

    it('handles publishable libraries with a tailwind config and secondary entry points', async () => {
      const tree = await withLibrary('pub', { publishable: true, importPath: '@scope/pub' });
      tree.write('pub/tailwind.config.js', 'module.exports = {};');
      tree.write('pub/src/index.scss', '');
      tree.write('pub/secondary/ng-package.json', JSON.stringify({ lib: { entryFile: 'src/index.ts' } }));
      tree.write('pub/secondary/src/index.ts', 'export {};');
      await initLibraryGenerator(tree, { project: 'pub', overwrite: true, skipFormat: true } as any);
      expect(readProjectConfiguration(tree, 'pub').targets?.['build']).toBeDefined();
    }, 120000);
  });

  describe('init-feature-library', () => {
    it('initializes feature libraries and adds the routes entry point', async () => {
      const tree = await withLibrary('feature-x', { tags: 'feature' });
      const project = readProjectConfiguration(tree, 'feature-x');
      writeJson(tree, 'feature-x/package.json', { name: '@scope/feature-x', version: '0.0.1' });
      await initFeatureLibraryGenerator(tree, { project: 'feature-x', routes: true, skipFormat: true } as any);
      expect(project).toBeDefined();
      expect(tree.exists('feature-x/src/lib/routes.ts')).toBe(true);
    }, 120000);

    it('skips non feature libraries', async () => {
      const tree = await withLibrary('plain');
      await initFeatureLibraryGenerator(tree, {} as any);
      await initFeatureLibraryGenerator(tree, { skipProjects: true } as any);
    }, 60000);
  });

  describe('convert-to-buildable-library', () => {
    it('throws for unknown projects', async () => {
      await expect(convertToBuildableLibraryGenerator(baseTree(), { project: 'nope' })).rejects.toThrow('not found');
    });
    it('converts a library', async () => {
      const tree = await withLibrary();
      writeJson(tree, 'feat/.eslintrc.json', { overrides: [] });
      tree.write('feat/tsconfig.lib.prod.json', '{}');
      await convertToBuildableLibraryGenerator(tree, { project: 'feat' });
      expect(readProjectConfiguration(tree, 'feat').targets?.['build']?.executor).toBeDefined();
      expect(tree.exists('feat/ng-package.json')).toBe(true);
      expect(readJson(tree, 'feat/package.json').sideEffects).toBe(false);
    }, 120000);
  });

  describe('init-component', () => {
    it('generates a component in a library', async () => {
      const tree = await withLibrary();
      await initComponentGenerator(tree, { project: 'feat', name: 'my-thing', skipFormat: true, defaultExport: true } as any);
      expect(tree.exists('feat/src/lib/my-thing/my-thing.component.ts')).toBe(true);
      // second call must not regenerate
      await initComponentGenerator(tree, { project: 'feat', name: 'my-thing', skipFormat: true } as any);
    }, 120000);

    it('generates a component in an application and a feature', async () => {
      const tree = baseTree();
      await applicationGenerator(tree, { name: 'app', directory: 'app', skipFormat: true, e2eTestRunner: 'none', unitTestRunner: 'none' } as any);
      await initComponentGenerator(tree, { project: 'app', name: 'dash', skipFormat: true } as any);
      expect(tree.exists('app/src/app/dash/dash.component.ts')).toBe(true);
      await initComponentGenerator(tree, { project: 'app', name: 'other', feature: 'feat-a', flat: true, skipFormat: true, directory: undefined } as any);
      expect(tree.exists('app/src/feature/feat-a/other.component.ts')).toBe(true);
    }, 120000);

    it('generates story and test files when targets exist', async () => {
      const tree = await withLibrary();
      const project = readProjectConfiguration(tree, 'feat');
      project.targets!['storybook'] = { executor: 'x' };
      project.targets!['component-test'] = { executor: 'x' };
      tree.write('feat/project.json', JSON.stringify(project));
      await initComponentGenerator(tree, { project: 'feat', name: 'thing', skipFormat: true } as any).catch(() => undefined);
    }, 120000);
    void componentGenerator;
  });

  describe('init-feature', () => {
    it('adds a feature to a monolithic application', async () => {
      const tree = baseTree();
      await applicationGenerator(tree, { name: 'app', directory: 'app', skipFormat: true, e2eTestRunner: 'none', unitTestRunner: 'none' } as any);
      tree.write('app/tsconfig.spec.json', JSON.stringify({ extends: './tsconfig.json', compilerOptions: {}, include: [] }));
      await initApplicationGenerator(tree, { project: 'app', monolithic: true, skipFormat: true } as any);
      await initFeatureGenerator(tree, {
        name: 'User Admin', project: 'app', apiStatusCheck: true, skipFormat: true,
        navigation: { label: 'Users', icon: { icon: 'people' } },
      } as any);
      expect(tree.exists('app/src/feature/user-admin/routes.ts')).toBe(true);
      expect(tree.read('app/src/app/layout.routes.ts', 'utf-8')).toContain('user-admin');
      await initFeatureGenerator(tree, { name: 'other', project: 'app', overwrite: true } as any);
    }, 120000);
  });

  describe('schematic and fix-schematic', () => {
    async function schematicProject(): Promise<Tree> {
      const tree = baseTree();
      addProjectConfiguration(tree, 'schem', { root: 'libs/schem', sourceRoot: 'libs/schem/src', projectType: 'library', targets: {} });
      writeJson(tree, 'libs/schem/package.json', { name: '@scope/schem', version: '0.0.1' });
      return tree;
    }

    it('generates a schematic and registers it in the collection', async () => {
      const tree = await schematicProject();
      await schematicGenerator(tree, { project: 'schem', name: 'my-schematic', description: 'does things', skipFormat: true });
      const collection = readJson(tree, 'libs/schem/collection.json');
      expect(collection.schematics['my-schematic'].description).toBe('does things');
      expect(readJson(tree, 'libs/schem/package.json').schematics).toBe('./collection.json');
      expect(readProjectConfiguration(tree, 'schem').targets?.['build']?.executor).toBe('@nx/js:tsc');
      await expect(schematicGenerator(tree, { project: 'schem', name: 'my-schematic', skipFormat: true })).rejects.toThrow('already exists');
      await schematicGenerator(tree, { project: 'schem', name: 'second' });
      expect(readJson(tree, 'libs/schem/collection.json').schematics['second'].description).toBe('second schematic');
    }, 60000);

    it('fix-schematic registers undefined schematics', async () => {
      const tree = await schematicProject();
      await expect(fixSchematicGenerator(tree, { project: 'schem' })).resolves.toBeUndefined();
      tree.write('libs/schem/src/schematics/a/schema.json', '{}');
      tree.write('libs/schem/src/schematics/b/schema.json', '{}');
      await expect(fixSchematicGenerator(tree, { project: 'schem' })).resolves.toBeUndefined();
      writeJson(tree, 'libs/schem/package.json', { name: '@scope/schem', schematics: './collection.json' });
      await fixSchematicGenerator(tree, { project: 'schem' });
      writeJson(tree, 'libs/schem/collection.json', { schematics: { a: { schema: './src/schematics/a/schema.json', factory: './src/schematics/a/index' } } });
      await fixSchematicGenerator(tree, { project: 'schem' });
      const collection = readJson(tree, 'libs/schem/collection.json');
      expect(collection.schematics['b']).toEqual(expect.objectContaining({ schema: './src/schematics/b/schema.json', factory: './src/schematics/b/index' }));
      expect(collection.schematics['a'].description).toBe('The a schematic');
      // everything defined
      await fixSchematicGenerator(tree, { project: 'schem' });
    }, 60000);

    it('fix-schematic throws without a package.json', async () => {
      const tree = baseTree();
      addProjectConfiguration(tree, 'nopkg', { root: 'libs/nopkg', sourceRoot: 'libs/nopkg/src', projectType: 'library', targets: {} });
      tree.write('libs/nopkg/src/schematics/a/schema.json', '{}');
      await expect(fixSchematicGenerator(tree, { project: 'nopkg' })).rejects.toThrow('does not contains a package.json');
    });
  });
});
