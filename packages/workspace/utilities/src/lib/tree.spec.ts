import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { CoerceFile } from './coerce-file';
import { DeleteRecursive } from './delete-recursive';
import {
  FakeDirEntry,
  FsTree,
  IsFsTreeLike,
  IsGeneratorTreeLike,
  IsJsonArray,
  IsJsonObject,
  IsSchematicTreeLike,
  IsTreeLike,
  TreeAdapter,
} from './tree';
import { VisitTree } from './visit-tree';
import { SearchFile } from './search-file';
import { getWorkspaceRoot } from './get-workspace-root';

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => undefined);
});

function makeFsTree() {
  const root = mkdtempSync(join(tmpdir(), 'ws-utils-'));
  mkdirSync(join(root, 'a', 'b'), { recursive: true });
  mkdirSync(join(root, 'node_modules', 'x'), { recursive: true });
  mkdirSync(join(root, '.hidden'));
  writeFileSync(join(root, 'a', 'one.txt'), '1');
  writeFileSync(join(root, 'a', 'b', 'two.txt'), '2');
  writeFileSync(join(root, 'node_modules', 'x', 'skip.txt'), 'x');
  writeFileSync(join(root, '.hidden', 'skip.txt'), 'x');
  writeFileSync(join(root, 'root.txt'), 'r');
  return { root, tree: new FsTree(root) };
}

/** a minimal fake schematic tree backed by a map */
function makeSchematicTree(files: Record<string, string>) {
  const store = new Map(Object.entries(files));
  const dirEntry = (path: string): any => {
    const prefix = path === '/' ? '/' : path + '/';
    const subfiles = new Set<string>();
    const subdirs = new Set<string>();
    for (const key of store.keys()) {
      if (key.startsWith(prefix)) {
        const rest = key.slice(prefix.length);
        const [head, ...tail] = rest.split('/');
        (tail.length ? subdirs : subfiles).add(head);
      }
    }
    return {
      path,
      subfiles: [...subfiles],
      subdirs: [...subdirs],
      dir: (name: string) => dirEntry(join(path, name)),
      file: (name: string) => store.has(join(path, name)) ? { path: join(path, name), content: Buffer.from(store.get(join(path, name))!) } : null,
      visit: jest.fn(),
    };
  };
  const tree: any = {
    root: dirEntry('/'),
    exists: (p: string) => store.has(p),
    delete: (p: string) => void store.delete(p),
    rename: (a: string, b: string) => { store.set(b, store.get(a)!); store.delete(a); },
    read: (p: string) => store.has(p) ? Buffer.from(store.get(p)!) : null,
    overwrite: (p: string, c: string | Buffer) => void store.set(p, c.toString()),
    create: (p: string, c: string | Buffer) => void store.set(p, c.toString()),
    readText: (p: string) => store.get(p)!,
    readJson: (p: string) => JSON.parse(store.get(p)!),
    get: (p: string) => {
      if (store.has(p)) {
        return { path: p, content: Buffer.from(store.get(p)!) };
      }
      throw new Error(`Path "${p}" is a directory.`);
    },
    getDir: (p: string) => dirEntry(p),
  };
  return { tree, store };
}

describe('tree helpers', () => {
  it('detects json values', () => {
    expect(IsJsonObject({})).toBe(true);
    expect(IsJsonObject([])).toBe(false);
    expect(IsJsonObject(null)).toBe(false);
    expect(IsJsonArray([])).toBe(true);
    expect(IsJsonArray({})).toBe(false);
  });

  it('detects tree kinds', () => {
    const nx = createTreeWithEmptyWorkspace();
    const { tree } = makeFsTree();
    const { tree: schematic } = makeSchematicTree({});
    expect(IsTreeLike(nx)).toBe(true);
    expect(IsTreeLike({})).toBe(false);
    expect(IsGeneratorTreeLike(nx)).toBe(true);
    expect(IsGeneratorTreeLike(tree)).toBe(false);
    expect(IsFsTreeLike(tree)).toBe(true);
    expect(IsSchematicTreeLike(schematic)).toBe(true);
    expect(IsSchematicTreeLike(nx)).toBe(false);
  });
});

describe('FsTree', () => {
  it('reads, writes, renames and deletes', () => {
    const { root, tree } = makeFsTree();
    expect(tree.exists('root.txt')).toBe(true);
    expect(tree.read('root.txt', 'utf-8')).toBe('r');
    expect(tree.read('root.txt')).toEqual(Buffer.from('r'));
    tree.write('new.txt', 'n');
    expect(readFileSync(join(root, 'new.txt'), 'utf-8')).toBe('n');
    tree.rename('new.txt', 'renamed.txt');
    expect(tree.exists('renamed.txt')).toBe(true);
    tree.delete('renamed.txt');
    expect(existsSync(join(root, 'renamed.txt'))).toBe(false);
    expect(tree.isFile('a')).toBe(false);
    expect(tree.children('a').sort()).toEqual(['b', 'one.txt']);
  });
});

describe('FakeDirEntry', () => {
  it('lists children and navigates', () => {
    const { tree } = makeFsTree();
    const dir = new FakeDirEntry('a', tree);
    expect(dir.subfiles).toEqual(['one.txt']);
    expect(dir.subdirs).toEqual(['b']);
    expect(dir.dir('b').path).toBe(join('a', 'b'));
    expect(dir.file('one.txt')!.content.toString()).toBe('1');
    expect(dir.file('b')).toBeNull();
    expect(dir.parent!.path).toBe('.');
    expect(new FakeDirEntry('/', tree).parent).toBeNull();
    expect(() => dir.visit(() => 0)).toThrow('not implemented');
  });
});

describe.each([
  ['nx generator tree', () => createTreeWithEmptyWorkspace()],
  ['fs tree', () => makeFsTree().tree],
  ['schematic tree', () => makeSchematicTree({ '/a.txt': 'A' }).tree],
])('TreeAdapter (%s)', (_name, factory) => {
  it('adapts read/write/exists/delete/rename', () => {
    const adapter = new TreeAdapter(factory() as any);
    const path = _name === 'schematic tree' ? '/file.txt' : 'file.txt';
    const target = _name === 'schematic tree' ? '/moved.txt' : 'moved.txt';
    adapter.write(path, 'hello');
    expect(adapter.exists(path)).toBe(true);
    expect(adapter.read(path, 'utf-8')).toBe('hello');
    expect(adapter.read(path)!.toString()).toBe('hello');
    adapter.rename(path, target);
    expect(adapter.exists(path)).toBe(false);
    adapter.delete(target);
    expect(adapter.exists(target)).toBe(false);
  });

  it('exposes root with a warning', () => {
    const adapter = new TreeAdapter(factory() as any);
    const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(adapter.root).toBeDefined();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe('TreeAdapter', () => {
  it('rejects missing or invalid trees', () => {
    expect(() => new TreeAdapter(undefined as any)).toThrow('wrapped tree is not defined');
    expect(() => new TreeAdapter({ exists: () => true, delete: () => 0, rename: () => 0 } as any)).toThrow('Invalid tree');
  });

  it('supports the typed read/write/json helpers on a generator tree', () => {
    const adapter = new TreeAdapter(createTreeWithEmptyWorkspace());
    adapter.create('x/y.json', '{"a":1}');
    expect(adapter.readJson('x/y.json')).toEqual({ a: 1 });
    expect(adapter.readText('x/y.json')).toBe('{"a":1}');
    adapter.overwrite('x/y.json', '{"a":2}');
    expect(adapter.readJson('x/y.json')).toEqual({ a: 2 });
    expect(adapter.isFile('x/y.json')).toBe(true);
    expect(adapter.isFile('x')).toBe(false);
    expect(adapter.children('x')).toEqual(['y.json']);
  });

  it('handles directories on a schematic tree', () => {
    const { tree } = makeSchematicTree({ '/dir/a.txt': 'A', '/dir/sub/b.txt': 'B' });
    const adapter = new TreeAdapter(tree);
    expect(adapter.isFile('/dir/a.txt')).toBe(true);
    expect(adapter.isFile('/dir')).toBe(false);
    expect(adapter.children('/dir').sort()).toEqual(['a.txt', 'sub']);
    expect(adapter.read('/dir/a.txt', 'utf-8')).toBe('A');
  });
});

describe('CoerceFile', () => {
  it('creates, keeps and overwrites files', () => {
    const tree = createTreeWithEmptyWorkspace();
    expect(CoerceFile(tree, 'f.txt', 'one')).toBe('one');
    expect(CoerceFile(tree, 'f.txt', 'two')).toBe('one');
    expect(CoerceFile(tree, 'f.txt', 'two', true)).toBe('two');
    expect(CoerceFile(tree, 'f.txt', 'two', true)).toBe('two');
    expect(CoerceFile(tree, 'empty.txt')).toBe('');
  });
});

describe('VisitTree', () => {
  it('visits files and skips ignored folders', () => {
    const { tree } = makeFsTree();
    const paths = [...VisitTree(tree)].map((i) => i.path).sort();
    expect(paths).toEqual([join('a', 'b', 'two.txt'), join('a', 'one.txt'), 'root.txt']);
    expect([...VisitTree(tree, '/a')].map((i) => i.path).sort()).toEqual([join('a', 'b', 'two.txt'), join('a', 'one.txt')]);
  });
});

describe('DeleteRecursive', () => {
  it('deletes all files below a path (generator tree)', () => {
    const tree = createTreeWithEmptyWorkspace();
    tree.write('d/a.txt', 'a');
    tree.write('d/s/b.txt', 'b');
    DeleteRecursive(tree, 'd');
    expect(tree.exists('d/a.txt')).toBe(false);
    expect(tree.exists('d/s/b.txt')).toBe(false);
  });

  it('deletes all files below a path (fs tree)', () => {
    const { tree } = makeFsTree();
    DeleteRecursive(tree, 'a');
    expect(tree.exists('a/one.txt')).toBe(false);
    expect(tree.exists('a/b/two.txt')).toBe(false);
  });

  it('deletes all files below a path (schematic tree)', () => {
    const { tree, store } = makeSchematicTree({ '/d/a.txt': 'a', '/d/s/b.txt': 'b', '/keep.txt': 'k' });
    DeleteRecursive(tree, '/d');
    expect([...store.keys()]).toEqual(['/keep.txt']);
  });

  it('rejects unsupported input', () => {
    const tree = createTreeWithEmptyWorkspace();
    expect(() => DeleteRecursive(tree, { path: 'x' } as any)).toThrow('requires path to be a string');
    expect(() => DeleteRecursive({ exists: () => 0, delete: () => 0, rename: () => 0 } as any, 'x')).toThrow('Unknown tree type');
  });
});

describe('SearchFile', () => {
  it('finds files in a generator tree and applies filters', () => {
    const tree = createTreeWithEmptyWorkspace();
    tree.write('src/a.ts', 'a');
    tree.write('src/docs/skip.ts', 'x');
    tree.write('src/b.json', 'b');
    const all = [...SearchFile(tree, 'src')].map((f) => f.path).sort();
    expect(all).toEqual([join('src', 'a.ts'), join('src', 'b.json')]);
    expect([...SearchFile(tree, 'src', (p) => p.endsWith('.ts'))].map((f) => f.path)).toEqual([join('src', 'a.ts')]);
    expect([...SearchFile(tree, 'src', undefined, (p) => p.endsWith('.ts'))].map((f) => f.path)).toEqual([join('src', 'b.json')]);
  });

  it('finds files in an fs tree', () => {
    const { tree } = makeFsTree();
    expect([...SearchFile(tree)].map((f) => f.path).sort()).toEqual([join('a', 'b', 'two.txt'), join('a', 'one.txt'), 'root.txt']);
  });

  it('finds files in a schematic tree and dir entries', () => {
    const { tree } = makeSchematicTree({ '/a.txt': 'A', '/d/b.txt': 'B', '/node_modules/c.txt': 'C' });
    expect([...SearchFile(tree, '/')].map((f) => f.path).sort()).toEqual(['/a.txt', '/d/b.txt']);
    expect([...SearchFile(tree)].length).toBe(2);
    expect([...SearchFile(tree.getDir('/d'))].map((f) => f.path)).toEqual(['/d/b.txt']);
    expect([...SearchFile(tree.getDir('/node_modules'))]).toEqual([]);
  });

  it('rejects unknown tree types', () => {
    expect(() => [...SearchFile({ exists: () => 0, delete: () => 0, rename: () => 0 } as any)]).toThrow('Unknown tree type');
  });
});

describe('getWorkspaceRoot', () => {
  it('uses the tree root or cwd', () => {
    const tree = createTreeWithEmptyWorkspace();
    expect(getWorkspaceRoot(tree)).toBe(tree.root);
    expect(getWorkspaceRoot()).toBe(process.cwd());
    expect(getWorkspaceRoot(makeFsTree().tree)).toBe(process.cwd());
  });
});
