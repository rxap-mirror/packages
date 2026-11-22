import {
  addProjectConfiguration,
  readJson,
  Tree,
  writeJson,
} from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import bundleJsonSchemaGenerator from './bundle-json-schema/generator';
import exposeAsSchematicGenerator from './expose-as-schematic/generator';
import indexExportGenerator from './index-export/generator';
import indexJsonSchemaGenerator, { GenerateDefinitionsMap } from './index-json-schema/generator';

describe('library schema and export generators', () => {

  let tree: Tree;
  const root = 'packages/plugin/p';

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    addProjectConfiguration(tree, 'p', {
      root,
      sourceRoot: `${ root }/src`,
      projectType: 'library',
      tags: [ 'plugin' ],
      targets: { build: { executor: 'x', options: { additionalEntryPoints: [ `${ root }/src/extra/index.ts` ] } } },
    });
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => jest.restoreAllMocks());

  describe('expose-as-schematic', () => {

    beforeEach(() => {
      writeJson(tree, `${ root }/package.json`, { name: '@scope/p', generators: './generators.json' });
      writeJson(tree, `${ root }/generators.json`, {
        generators: { a: { factory: './src/generators/a/generator', schema: './src/generators/a/schema.json', description: 'A' } },
      });
    });

    it('should expose generators as schematics', async () => {
      await exposeAsSchematicGenerator(tree, { project: 'p' });
      const generators = readJson(tree, `${ root }/generators.json`);
      expect(generators.schematics.a).toEqual({ factory: './src/generators/a/index', schema: './src/generators/a/schema.json', description: 'A' });
      expect(tree.read(`${ root }/src/generators/a/index.ts`, 'utf-8')).toContain('convertNxGenerator');
      expect(readJson(tree, `${ root }/package.json`).schematics).toBe('./generators.json');
    });

    it('should skip projects without generators', async () => {
      addProjectConfiguration(tree, 'other', { root: 'libs/other', projectType: 'library', tags: [ 'plugin' ] });
      writeJson(tree, 'libs/other/package.json', { name: 'other' });
      await exposeAsSchematicGenerator(tree, {});
      expect(tree.exists('libs/other/generators.json')).toBe(false);
    });

  });

  describe('index-export', () => {

    beforeEach(() => {
      tree.write(`${ root }/src/lib/a.ts`, 'export const a = 1;');
      tree.write(`${ root }/src/lib/sub/b.ts`, 'export const b = 1;');
      tree.write(`${ root }/src/lib/sub/c.spec.ts`, 'export const c = 1;');
      tree.write(`${ root }/src/lib/skip.ts`, '// rxap-no-index-export\nexport const s = 1;');
      tree.write(`${ root }/src/lib/noexport.ts`, 'const n = 1;');
      tree.write(`${ root }/src/extra/lib/x.ts`, 'export const x = 1;');
    });

    it('should generate the root index with all exports', async () => {
      await indexExportGenerator(tree, { project: 'p', generateRootExport: true });
      const index = tree.read(`${ root }/src/index.ts`, 'utf-8')!;
      expect(index).toContain(`export * from './lib/a';`);
      expect(index).toContain(`export * from './lib/sub/b';`);
      expect(index).toContain('// region sub');
      expect(index).not.toContain('skip');
      expect(index).not.toContain('spec');
      expect(index).not.toContain('noexport');
    });

    it('should generate additional entry points and ng-package entry points', async () => {
      tree.write(`${ root }/ng-package.json`, '{}');
      tree.write(`${ root }/src/lib/ng.ts`, 'export const ng = 1;');
      await indexExportGenerator(tree, { project: 'p', additionalEntryPoints: [ `${ root }/src/other/index.ts` ] });
      expect(tree.read(`${ root }/src/index.ts`, 'utf-8')).toContain('./lib/ng');
      expect(tree.exists(`${ root }/src/extra/index.ts`)).toBe(true);
      expect(tree.read(`${ root }/src/other/index.ts`, 'utf-8')).toBe('export {};');
    });

    it('should not generate a root index by default', async () => {
      await indexExportGenerator(tree, { project: 'p' });
      expect(tree.exists(`${ root }/src/index.ts`)).toBe(false);
    });

    it('should skip non library projects', async () => {
      addProjectConfiguration(tree, 'app', { root: 'apps/app', sourceRoot: 'apps/app/src', projectType: 'application' });
      tree.write('apps/app/src/lib/a.ts', 'export const a = 1;');
      await indexExportGenerator(tree, { generateRootExport: true });
      expect(tree.exists('apps/app/src/index.ts')).toBe(false);
    });

  });

  describe('json schema generators', () => {

    function schema(id: string, properties: Record<string, unknown> = {}) {
      return { $schema: 'http://json-schema.org/schema', $id: id, type: 'object', properties };
    }

    beforeEach(() => {
      writeJson(tree, `${ root }/package.json`, { name: '@scope/p', generators: './generators.json' });
      writeJson(tree, `${ root }/generators.json`, {
        generators: {
          a: { factory: './src/generators/a/generator', schema: './src/generators/a/schema.json' },
          b: { factory: './src/generators/b/generator', schema: './src/generators/b/schema.json' },
          missing: { factory: './src/generators/missing/generator', schema: './src/generators/missing/schema.json' },
        },
        schematics: {
          a: { factory: './src/generators/a/index', schema: './src/generators/a/schema.json' },
        },
      });
      writeJson(tree, `${ root }/src/generators/a/schema.json`, schema('A', { x: { type: 'string' } }));
      writeJson(tree, `${ root }/src/generators/b/schema.json`, schema('B'));
      writeJson(tree, `${ root }/src/generators/b/template.schema.json`, {
        ...schema('B'),
        properties: { shared: { type: 'string' } },
      });
      tree.write(`${ root }/src/schematics/legacy/schema.json`, '');
      writeJson(tree, `${ root }/src/schematics/legacy.schema.json`, schema('Legacy'));
    });

    it('should generate definitions and skip missing schemas', () => {
      const definitions = GenerateDefinitionsMap(tree, { project: 'p' });
      expect(Object.keys(definitions).sort()).toEqual([ 'a', 'b', 'legacy' ]);
      expect(definitions['a'].$ref).toBe('generators/a/schema.json');
      expect(definitions['b'].$ref).toBe('generators/b/template.schema.json');
    });

    it('should index the schemas', async () => {
      await indexJsonSchemaGenerator(tree, { project: 'p' });
      const input = readJson(tree, `${ root }/src/schematic-input.schema.json`);
      expect(input.$id).toBe('schematic-input');
      expect(input.oneOf.map((item: any) => item.properties.name.const)).toEqual([ 'a', 'b' ]);
      expect(input.oneOf[0].properties.package.const).toBe('@scope/p');
      const template = readJson(tree, `${ root }/src/template.schema.json`);
      expect(template.definitions.schematicInput.$ref).toBe('./schematic-input.schema.json');
      expect(template.oneOf).toHaveLength(2);
    });


    it('should bundle the template schemas', async () => {
      tree.delete(`${ root }/src/schematics/legacy/schema.json`);
      await indexJsonSchemaGenerator(tree, { project: 'p' });
      // $ref urls are resolved relative to the cwd which has to match the root of the virtual tree
      jest.spyOn(process, 'cwd').mockReturnValue(tree.root);
      await bundleJsonSchemaGenerator(tree, { project: 'p' });
      const bundled = readJson(tree, `${ root }/src/template.schema.json`.replace('template.schema.json', 'schema.json'));
      expect(Object.keys(bundled.definitions)).toEqual(expect.arrayContaining([ 'a', 'b', 'schematicInput' ]));
      expect(bundled.definitions['a'].$id).toBeUndefined();
      expect(readJson(tree, `${ root }/src/generators/b/schema.json`).properties.shared).toBeDefined();
    });

  });

});
