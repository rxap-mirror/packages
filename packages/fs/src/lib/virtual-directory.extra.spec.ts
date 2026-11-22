import { FileDoesNotExistError } from './file-does-not-exist.error';
import { FolderDoesNotExistError } from './folder-does-not-exist.error';
import { VirtualDirectory, isNotVirtualDirectory, isVirtualDirectory } from './virtual-directory';
import { virtualDirectoryClear } from './virtual-directory-clear';
import { virtualDirectoryRegisterFiles } from './virtual-directory-register-files';
import { VirtualFile } from './virtual-file';
import { virtualFileClear } from './virtual-file-clear';
import { virtualFileClone } from './virtual-file-clone';
import { virtualFileToFile } from './virtual-file-to-file';

const file = (full: string) => new VirtualFile(full.split('/').pop()!, full, new ArrayBuffer(1));

function tree() {
  const root = VirtualDirectory.CreateRoot();
  root.addFile(file('a.txt'));
  root.addFile(file('sub/b.txt'));
  root.addFile(file('/sub/deep/c.txt'));
  return root;
}

describe('errors', () => {
  it('have names and messages', () => {
    expect(new FileDoesNotExistError('x').message).toBe("File 'x' does not exist");
    expect(new FileDoesNotExistError('x').name).toBe('FileDoesNotExistError');
    expect(new FolderDoesNotExistError('x').message).toContain("'x'");
    expect(new FolderDoesNotExistError('x').name).toBe('FolderDoesNotExistError');
  });
});

describe('VirtualDirectory', () => {
  it('addFile validates', () => {
    const root = VirtualDirectory.CreateRoot();
    expect(() => root.addFile({ name: 'a', fullName: 'dir/', data: new ArrayBuffer(0) } as any)).toThrow('invalid');
    expect(() => root.addFile({ name: 'a', fullName: 'b', data: new ArrayBuffer(0) } as any)).toThrow('does not match');
    expect(() => root.addFile({ name: 'a', fullName: '/a//a', data: new ArrayBuffer(0) } as any)).toThrow('invalid');
  });

  it('addFile rejects duplicates unless forced', () => {
    const root = tree();
    expect(() => root.addFile(file('a.txt'))).toThrow('already exists');
    const replacement = file('a.txt');
    root.addFile(replacement, true);
    expect(root.file('a.txt')).toBe(replacement);
  });

  it('file and directory errors', () => {
    const root = tree();
    expect(() => root.file('nope')).toThrow(FileDoesNotExistError);
    expect(() => root.file('sub')).toThrow('is a directory');
    expect(() => root.directory('nope')).toThrow(FolderDoesNotExistError);
    expect(() => root.directory('a.txt')).toThrow('is not a directory');
  });

  it('computes fullName of created directories', () => {
    expect(tree().directory('sub').directory('deep').fullName).toBe('/sub/deep');
  });

  it('iterates, flattens and forEach', () => {
    const root = tree();
    const names = ['a.txt', 'b.txt', 'c.txt'];
    expect(Array.from(root.iterateEachFile()).map((f) => f.name)).toEqual(names);
    expect(root.flatten().map((f) => f.name)).toEqual(names);
    const seen: string[] = [];
    root.forEachFile((f) => seen.push(f.name));
    expect(seen).toEqual(names);
  });

  it('findFile by path, leading slash and mimetype', () => {
    const root = tree();
    expect(root.findFile('sub/deep/c.txt').name).toBe('c.txt');
    expect(root.findFile('/sub/b.txt').name).toBe('b.txt');
    expect(root.findFile('a.txt', 'text/plain').mimetype).toBe('text/plain');
    expect(() => root.findFile('sub/x.txt')).toThrow(FileDoesNotExistError);
    expect(() => root.findFile('x/y.txt')).toThrow(FolderDoesNotExistError);
  });

  it('findFile by match', () => {
    const root = tree();
    expect(root.findFile((f) => f.name === 'c.txt').fullName).toBe('/sub/deep/c.txt');
    expect(() => root.findFile(() => false)).toThrow('does not match any file');
  });

  it('hasFile / hasDirectory', () => {
    const root = tree();
    expect(root.hasFile('a.txt')).toBe(true);
    expect(root.hasFile('/sub/b.txt')).toBe(true);
    expect(root.hasFile('sub')).toBe(false);
    expect(root.hasFile('sub/missing.txt')).toBe(false);
    expect(root.hasFile('missing/b.txt')).toBe(false);
    expect(root.hasFile((f) => f.name === 'c.txt')).toBe(true);
    expect(root.hasFile((f) => f.name === 'zzz')).toBe(false);
    expect(root.hasDirectory('sub')).toBe(true);
    expect(root.hasDirectory('a.txt')).toBe(false);
  });

  it('removeFile / removeDirectory', () => {
    const root = tree();
    expect(root.removeFile('a.txt')).toBe(true);
    expect(root.removeFile('a.txt')).toBe(false);
    expect(root.removeFile('sub/deep/c.txt')).toBe(true);
    expect(root.removeFile('nodir/x.txt')).toBe(false);
    expect(root.removeFile((f) => f.name === 'b.txt')).toBe(true);
    expect(root.removeFile((f) => f.name === 'b.txt')).toBe(false);
    expect(root.removeDirectory('sub')).toBe(true);
    expect(root.removeDirectory('sub')).toBe(false);
    expect(root.childrenNames).toEqual([]);
  });

  it('toJSON', () => {
    expect(tree().toJSON()).toEqual({ 'a.txt': null, sub: { 'b.txt': null, deep: { 'c.txt': null } } });
  });

  it('setDirectory / addDirectory', () => {
    const root = VirtualDirectory.CreateRoot();
    root.setDirectory('x', new VirtualDirectory('x', 'x'));
    root.addDirectory(new VirtualDirectory('y', 'y'));
    expect(root.childrenNames).toEqual(['x', 'y']);
  });

  it('clone copies the child map and adjusts fullName', () => {
    const d = new VirtualDirectory('old', 'a/old');
    d.addFile(file('f.txt'));
    const c = d.clone('new');
    expect(c.name).toBe('new');
    expect(c.fullName).toBe('a/new');
    expect(c.childrenNames).toEqual(['f.txt']);
    c.removeFile('f.txt');
    expect(d.childrenNames).toEqual(['f.txt']);
    expect(d.clone().fullName).toBe('a/old');
  });

  it('type guards', () => {
    const root = VirtualDirectory.CreateRoot();
    expect(isVirtualDirectory(root)).toBe(true);
    expect(isVirtualDirectory(undefined)).toBe(false);
    expect(isNotVirtualDirectory(file('a'))).toBe(true);
    expect(isNotVirtualDirectory(root)).toBe(false);
  });
});

describe('helper functions', () => {
  afterEach(() => jest.restoreAllMocks());

  it('virtualFileClear uses clear or warns', () => {
    const clear = jest.fn();
    virtualFileClear({ name: 'a', clear } as any);
    expect(clear).toHaveBeenCalled();
    const warn = jest.spyOn(console, 'warn').mockImplementation();
    virtualFileClear({ name: 'a' } as any);
    expect(warn).toHaveBeenCalled();
  });

  it('virtualDirectoryClear uses clear or clears every file', () => {
    const clear = jest.fn();
    virtualDirectoryClear({ clear } as any);
    expect(clear).toHaveBeenCalled();
    const f = jest.fn();
    virtualDirectoryClear({ forEachFile: (cb: any) => cb({ clear: f }) } as any);
    expect(f).toHaveBeenCalled();
  });

  it('virtualDirectoryRegisterFiles delegates or warns', () => {
    const registerFiles = jest.fn().mockReturnValue('ok');
    expect(virtualDirectoryRegisterFiles({ registerFiles } as any)).toBe('ok');
    const warn = jest.spyOn(console, 'warn').mockImplementation();
    virtualDirectoryRegisterFiles({ name: 'd' } as any);
    expect(warn).toHaveBeenCalled();
  });

  it('VirtualDirectory.registerFiles logs', () => {
    const debug = jest.spyOn(console, 'debug').mockImplementation();
    VirtualDirectory.CreateRoot().registerFiles();
    expect(debug).toHaveBeenCalled();
  });

  it('virtualFileClone delegates or falls back', async () => {
    const clone = jest.fn().mockResolvedValue('c');
    expect(await virtualFileClone({ name: 'a', clone } as any, 'b')).toBe('c');
    const plain = { name: 'a.txt', fullName: 'd/a.txt', data: Promise.resolve(new ArrayBuffer(3)) } as any;
    const c = await virtualFileClone(plain, 'b.txt');
    expect(c.fullName).toBe('d/b.txt');
    expect((c as any).byteLength).toBe(3);
    const deep = await virtualFileClone(plain, undefined, undefined, true);
    expect(deep.name).toBe('a.txt');
  });

  it('virtualFileToFile delegates or builds a File', async () => {
    const f = new File(['x'], 'x');
    expect(await virtualFileToFile({ toFile: () => f } as any)).toBe(f);
    const built = await virtualFileToFile({ name: 'n', mimetype: 'text/plain', data: Promise.resolve(new ArrayBuffer(2)) } as any);
    expect(built.name).toBe('n');
    expect(built.size).toBe(2);
  });
});
