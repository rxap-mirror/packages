import { addProjectConfiguration, Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Project } from 'ts-morph';
import { AddDir } from './add-dir';
import { ApplyTsMorphProject } from './apply-ts-morph-project';
import {
  TsMorphProjectTransform,
  TsMorphTransform,
} from './ts-morph-transform';

// prettier 3 loads its core via dynamic import(), which jest's CJS vm cannot do
jest.mock('prettier', () => ({
  resolveConfig: async () => ({}),
  format: async (content: string) => `// formatted\n${ content }`,
}));

describe('workspace-ts-morph', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
  });
  afterEach(() => jest.restoreAllMocks());

  describe('AddDir', () => {
    beforeEach(() => {
      tree.write('src/a.ts', 'export const a = 1;');
      tree.write('src/readme.md', '# x');
      tree.write('src/nested/b.ts', 'export const b = 2;');
    });

    it('adds ts files recursively relative to the directory', () => {
      const project = new Project({ useInMemoryFileSystem: true });
      AddDir(tree, 'src', project);
      const paths = project.getSourceFiles().map(f => f.getFilePath()).sort();
      expect(paths).toEqual([ '/a.ts', '/nested/b.ts' ]);
      expect(project.getSourceFileOrThrow('/nested/b.ts').getFullText()).toBe('export const b = 2;');
    });

    it('respects a custom filter', () => {
      const project = new Project({ useInMemoryFileSystem: true });
      AddDir(tree, 'src', project, name => name.endsWith('.md'));
      expect(project.getSourceFiles().map(f => f.getBaseName())).toEqual([ 'readme.md' ]);
    });

    it('does not overwrite already present files', () => {
      const project = new Project({ useInMemoryFileSystem: true });
      project.createSourceFile('a.ts', 'existing');
      AddDir(tree, 'src', project);
      expect(project.getSourceFileOrThrow('a.ts').getFullText()).toBe('existing');
    });

    it('throws when the path is a file', () => {
      expect(() => AddDir(tree, 'src/a.ts', new Project({ useInMemoryFileSystem: true }))).toThrow('does not point to a dir entry');
    });

    it('throws for unsupported tree', () => {
      expect(() => AddDir({} as any, 'src', new Project({ useInMemoryFileSystem: true }))).toThrow('not a valid nx or angular schematic tree');
    });

    it('supports schematic trees', () => {
      const files: Record<string, string> = { 'a.ts': 'export const a = 1;', 'x.md': '' };
      const sub = { subfiles: [ 'b.ts' ], subdirs: [], file: () => ({ content: Buffer.from('export const b = 2;') }), dir: () => null, path: '/src/n' };
      const dir: any = {
        path: '/src',
        subfiles: Object.keys(files),
        subdirs: [ 'n' ],
        file: (n: string) => ({ content: Buffer.from(files[n]) }),
        dir: () => sub,
      };
      const noop = () => undefined;
      const schematicTree: any = {
        getDir: () => dir, overwrite: noop, create: noop, readText: noop, readJson: noop, root: {}, get: noop, read: noop,
        exists: noop, delete: noop, rename: noop, beginUpdate: noop, commitUpdate: noop, copy: noop, apply: noop,
        branch: noop, merge: noop, getFile: noop, readFileSync: noop, visit: noop, actions: [], isFile: noop, children: noop,
        write: noop, rename_: noop,
      };
      const project = new Project({ useInMemoryFileSystem: true });
      AddDir(schematicTree, 'src', project);
      expect(project.getSourceFiles().map(f => f.getFilePath()).sort()).toEqual([ '/a.ts', '/n/b.ts' ]);
    });
  });

  describe('ApplyTsMorphProject', () => {
    it('creates new files and formats them with prettier', async () => {
      const project = new Project({ useInMemoryFileSystem: true });
      project.createSourceFile('/x.ts', `export const   x  =  1`);
      await ApplyTsMorphProject(tree, project, 'out');
      expect(tree.exists('out/x.ts')).toBe(true);
      expect(tree.read('out/x.ts', 'utf-8')).toBe('// formatted\nexport const   x  =  1');
    });

    it('skips prettier when disabled', async () => {
      const project = new Project({ useInMemoryFileSystem: true });
      project.createSourceFile('/x.ts', `export const   x  =  1`);
      await ApplyTsMorphProject(tree, project, 'out', true, false, false);
      expect(tree.read('out/x.ts', 'utf-8')).toBe('export const   x  =  1');
    });

    it('overwrites a changed file but ignores formatting-only differences', async () => {
      tree.write('out/x.ts', 'export const x = 1;\n');
      const spy = jest.spyOn(tree, 'write');
      const same = new Project({ useInMemoryFileSystem: true });
      same.createSourceFile('/x.ts', 'export   const x   = 1;');
      await ApplyTsMorphProject(tree, same, 'out', false);
      expect(spy).not.toHaveBeenCalled();

      const changed = new Project({ useInMemoryFileSystem: true });
      changed.createSourceFile('/x.ts', 'export const x = 2;');
      await ApplyTsMorphProject(tree, changed, 'out', false);
      expect(tree.read('out/x.ts', 'utf-8')).toContain('x = 2');
    });

    it('detects files differing in token count', async () => {
      tree.write('out/x.ts', 'export const x = 1;');
      const p = new Project({ useInMemoryFileSystem: true });
      p.createSourceFile('/x.ts', 'export const x = 1; export const y = 2;');
      await ApplyTsMorphProject(tree, p, 'out', false);
      expect(tree.read('out/x.ts', 'utf-8')).toContain('y = 2');
    });

    it('organizes imports and fixes missing imports', async () => {
      const project = new Project({ useInMemoryFileSystem: true });
      project.createSourceFile('/dep.ts', 'export class Dep {}');
      project.createSourceFile('/x.ts', `import { z } from './dep';\nimport { a } from './dep';\nexport const v = new Dep();`);
      await ApplyTsMorphProject(tree, project, 'out', true, true, false);
      const out = tree.read('out/x.ts', 'utf-8')!;
      expect(out).toContain('Dep');
      expect(out).toMatch(/import \{ Dep \} from '\.\/dep'/);
      expect(out).not.toMatch(/\bz\b|\ba\b/);
    });
  });

  describe('TsMorphTransform', () => {
    beforeEach(() => {
      tree.write('src/a.ts', 'export const a = 1;');
      tree.write('src/b.ts', 'export const b = 1;');
      tree.write('src/c.json', '{}');
    });

    it('calls back with the whole project and writes changes', async () => {
      const cb = jest.fn((project: Project, _sf?: unknown) => {
        project.getSourceFileOrThrow('a.ts').addVariableStatement({ declarations: [ { name: 'z', initializer: '3' } ] });
      });
      await TsMorphTransform(tree, 'src', cb as any);
      expect(cb.mock.calls[0][1]).toBeUndefined();
      expect(tree.read('src/a.ts', 'utf-8')).toContain('z = 3');
      expect(tree.read('src/b.ts', 'utf-8')).toBe('export const b = 1;');
    });

    it('filters to a single file', async () => {
      const cb = jest.fn();
      await TsMorphTransform(tree, 'src', cb, {}, {}, 'a.ts' as any);
      expect(cb.mock.calls[0][0].getSourceFiles().map((f: any) => f.getBaseName())).toEqual([ 'a.ts' ]);
      expect(cb.mock.calls[0][1].getBaseName()).toBe('a.ts');
    });

    it('passes an array of files for array filters', async () => {
      const cb = jest.fn();
      await TsMorphTransform(tree, 'src', cb, {}, {}, [ 'a.ts', 'b.ts' ]);
      expect(cb.mock.calls[0][1].map((f: any) => f.getBaseName())).toEqual([ 'a.ts', 'b.ts' ]);
    });

    it('includes all files when filter is disabled', async () => {
      const cb = jest.fn();
      await TsMorphTransform(tree, 'src', cb, { filter: false }, {}, 'a.ts' as any);
      expect(cb.mock.calls[0][0].getSourceFiles()).toHaveLength(2);
    });

    it('includes non ts files when requested', async () => {
      const cb = jest.fn();
      await TsMorphTransform(tree, 'src', cb, { includeNonTsFiles: true });
      expect(cb.mock.calls[0][0].getSourceFiles().map((f: any) => f.getBaseName()).sort()).toEqual([ 'a.ts', 'b.ts', 'c.json' ]);
    });

    it('throws when a required file does not exist', async () => {
      await expect(TsMorphTransform(tree, 'src', jest.fn(), {}, {}, 'missing.ts' as any)).rejects.toThrow('does not exists');
      await expect(TsMorphTransform(tree, 'src', jest.fn(), {}, {}, [ 'missing.ts' ])).rejects.toThrow('does not exists');
    });

    it('creates optional or replaced files', async () => {
      const cb = jest.fn((project: Project, _sf?: unknown) => {
        project.getSourceFileOrThrow('new.ts').addVariableStatement({ declarations: [ { name: 'n', initializer: '1' } ] });
      });
      await TsMorphTransform(tree, 'src', cb as any, {}, {}, 'new.ts?' as any);
      expect(tree.read('src/new.ts', 'utf-8')).toContain('n = 1');
      await TsMorphTransform(tree, 'src', jest.fn(), { replace: true }, {}, [ 'r.ts' ]);
      await TsMorphTransform(tree, 'src', jest.fn(), { replace: true }, {}, 'r2.ts' as any);
    });

    it('awaits async callbacks', async () => {
      let done = false;
      await TsMorphTransform(tree, 'src', async () => {
        await new Promise(r => setTimeout(r, 5));
        done = true;
      });
      expect(done).toBe(true);
    });

    it('TsMorphProjectTransform resolves the project root', async () => {
      addProjectConfiguration(tree, 'lib', { root: 'libs/lib', sourceRoot: 'libs/lib/src' });
      tree.write('libs/lib/x.ts', 'export const x = 1;');
      const cb = jest.fn();
      await TsMorphProjectTransform(tree, { project: 'lib' }, cb, 'x.ts');
      expect(cb.mock.calls[0][1].getBaseName()).toBe('x.ts');
    });
  });
});
