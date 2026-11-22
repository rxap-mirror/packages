import {
  AsyncVirtualFile,
  isBinaryMime,
  isMimeType,
  isTextualMime,
  SyncVirtualFile,
  VirtualFile,
} from './virtual-file';

const bytes = (s: string) => new TextEncoder().encode(s).buffer as ArrayBuffer;

describe('mime helpers', () => {
  it('isTextualMime', () => {
    expect(isTextualMime('text/plain')).toBe(true);
    expect(isTextualMime('application/json')).toBe(true);
    expect(isTextualMime('application/ld+json')).toBe(true);
    expect(isTextualMime('image/svg+xml')).toBe(true);
    expect(isTextualMime('image/png')).toBe(false);
  });

  it('isBinaryMime', () => {
    for (const m of ['application/pdf', 'image/png', 'audio/mp3', 'video/mp4', 'font/woff', 'model/gltf']) {
      expect(isBinaryMime(m)).toBe(true);
    }
    expect(isBinaryMime('text/plain')).toBe(false);
  });

  it('isMimeType', () => {
    expect(isMimeType('text/plain')).toBe(true);
    expect(isMimeType('x-custom/thing')).toBe(true);
    expect(isMimeType('nonsense')).toBe(false);
  });
});

describe('VirtualFile', () => {
  it('validates name and fullName', () => {
    expect(() => new VirtualFile('a/b.txt', 'a/b.txt', bytes(''))).toThrow('must not contain a path');
    expect(() => new VirtualFile('a.txt', 'dir/b.txt', bytes(''))).toThrow('must end with the file name');
  });

  it('EMPTY creates an empty file', () => {
    const f = VirtualFile.EMPTY('a.txt', 'x/a.txt', 'text/plain');
    expect(f.byteLength).toBe(0);
    expect(f.mimetype).toBe('text/plain');
  });

  it('toJSON and toBuffer', () => {
    const f = new VirtualFile('a.txt', 'a.txt', bytes('abc'), 'text/plain');
    expect(f.toJSON()).toEqual({ mimetype: 'text/plain', byteLength: 3 });
    expect(f.toBuffer().toString()).toBe('abc');
  });

  it('getText reads utf8 in node without decoder', () => {
    const f = new VirtualFile('a.txt', 'a.txt', bytes('héllo'), 'text/plain');
    expect(f.getText()).toBe('héllo');
  });

  it('getText throws for non textual mimetype', () => {
    const f = new VirtualFile('a.png', 'a.png', bytes('x'), 'image/png');
    expect(() => f.getText()).toThrow('not a textual mimetype');
    expect(() => new VirtualFile('a', 'a', bytes('x')).getText()).toThrow();
  });

  it('getContent returns text for textual and blob for binary', () => {
    const t = new VirtualFile('a.txt', 'a.txt', bytes('hi'), 'text/plain', TextDecoder);
    expect(t.getContent()).toBe('hi');
    // cached
    expect(t.getContent()).toBe('hi');
    const b = new VirtualFile('a.png', 'a.png', bytes('hi'), 'image/png');
    const blob = b.getContent() as Blob;
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBe(2);
  });

  it('getContent without decoder falls back to getText', () => {
    const t = new VirtualFile('a.txt', 'a.txt', bytes('hi'), 'text/plain');
    expect(t.getContent()).toBe('hi');
  });

  it('getBlob caches and re-types', () => {
    const f = new VirtualFile('a.txt', 'a.txt', bytes('hi'), 'text/plain');
    const b1 = f.getBlob();
    expect(f.getBlob()).toBe(b1);
    const b2 = f.getBlob('application/octet-stream');
    expect(b2.type).toBe('application/octet-stream');
    expect(f.mimetype).toBe('application/octet-stream');
  });

  it('setMimeType and toFile', () => {
    const f = new VirtualFile('a.txt', 'dir/a.txt', bytes('hi'));
    f.setMimeType('text/plain');
    expect(f.mimetype).toBe('text/plain');
    expect(f.toFile().name).toBe('a.txt');
    expect(f.toFile(true).name).toBe('dir/a.txt');
    expect(f.toFile().type).toBe('text/plain');
  });

  it('clone deep copies data, shallow shares', () => {
    const f = new VirtualFile('a.txt', 'a.txt', bytes('hi'));
    expect(f.clone().data).toBe(f.data);
    const deep = f.clone('b.txt', undefined, true);
    expect(deep.data).not.toBe(f.data);
    expect(deep.byteLength).toBe(2);
    expect(deep.fullName).toBe('b.txt');
  });

  it('write text requires encoder and textual mimetype', () => {
    const f = new VirtualFile('a.txt', 'a.txt', bytes(''), 'text/plain');
    expect(() => f.write('x')).toThrow('text encoder must be provided');
    f.write('xyz', TextEncoder);
    expect(f.byteLength).toBe(3);
    const bin = new VirtualFile('a.png', 'a.png', bytes(''), 'image/png', undefined, TextEncoder);
    expect(() => bin.write('x')).toThrow('does not support text content');
  });

  it('write data and clear reset caches', () => {
    const f = new VirtualFile('a.txt', 'a.txt', bytes('one'), 'text/plain', TextDecoder, TextEncoder);
    expect(f.getContent()).toBe('one');
    f.write(bytes('three'));
    expect(f.getContent()).toBe('three');
    f.write('four');
    expect(f.getContent()).toBe('four');
    f.clear();
    expect(f.getContent()).toBe('four');
  });
});

describe('SyncVirtualFile', () => {
  it('uses TextDecoder/TextEncoder by default', () => {
    const f = new SyncVirtualFile('a.txt', 'a.txt', bytes('hi'), 'text/plain');
    expect(f.getText()).toBe('hi');
    expect(f.getText('text/plain')).toBe('hi');
    expect(f.getContent()).toBe('hi');
    f.write('new');
    expect(f.getContent()).toBe('new');
  });
});

describe('AsyncVirtualFile', () => {
  const make = (mimetype?: string, factory: any = () => Promise.resolve(bytes('hello'))) =>
    new AsyncVirtualFile('a.txt', 'dir/a.txt', factory, mimetype);

  it('validates names', () => {
    expect(() => new AsyncVirtualFile('a/b', 'a/b', Promise.resolve(bytes('')))).toThrow();
    expect(() => new AsyncVirtualFile('a', 'b', Promise.resolve(bytes('')))).toThrow();
  });

  it('accepts a promise directly and caches data', async () => {
    const f = new AsyncVirtualFile('a.txt', 'a.txt', Promise.resolve(bytes('hi')));
    expect(await f.byteLength).toBe(2);
    expect(await f.byteLength).toBe(2);
    expect(f.toJSON()).toEqual({ mimetype: undefined, byteLength: 2 });
  });

  it('getText works without decoder', async () => {
    expect(await make('text/plain').getText()).toBe('hello');
  });

  it('getText with decoder', async () => {
    const f = new AsyncVirtualFile('a.txt', 'a.txt', () => Promise.resolve(bytes('hey')), 'text/plain', TextDecoder);
    expect(await f.getText()).toBe('hey');
    expect(await f.getText()).toBe('hey');
    expect(await f.getContent()).toBe('hey');
  });

  it('getText rejects for non textual', async () => {
    await expect(make('image/png').getText()).rejects.toThrow('not a textual mimetype');
  });

  it('getContent for textual and binary', async () => {
    expect(await make('text/plain').getContent()).toBe('hello');
    const blob = (await make('image/png').getContent()) as Blob;
    expect(blob.size).toBe(5);
  });

  it('getBlob caches and retypes', async () => {
    const f = make('text/plain');
    const b = await f.getBlob();
    expect(await f.getBlob()).toBe(b);
    const b2 = await f.getBlob('application/x-foo');
    expect(b2.type).toBe('application/x-foo');
  });

  it('toFile and toBuffer', async () => {
    const f = make('text/plain');
    expect((await f.toFile()).name).toBe('a.txt');
    expect((await f.toFile(true)).name).toBe('dir/a.txt');
    expect((await f.toBuffer()).toString()).toBe('hello');
  });

  it('clone', async () => {
    const f = make();
    const c = await f.clone('b.txt');
    expect(c.fullName).toBe('dir/b.txt');
    expect(c.byteLength).toBe(5);
    const d = await f.clone(undefined, undefined, true);
    expect(d.data).not.toBe(await f.data);
  });

  it('write text/data and clear', async () => {
    const f = new AsyncVirtualFile('a.txt', 'a.txt', () => Promise.resolve(bytes('x')), 'text/plain', TextDecoder, TextEncoder);
    await f.write('longer');
    expect(await f.byteLength).toBe(6);
    expect(await f.getText()).toBe('longer');
    await f.write(bytes('ab'));
    expect((await f.data).byteLength).toBe(2);
    f.clear();
    expect(f.toJSON().byteLength).toBeNull();
    await expect(make('text/plain').write('x')).rejects.toThrow('text encoder must be provided');
    const bin = new AsyncVirtualFile('a.png', 'a.png', Promise.resolve(bytes('')), 'image/png', undefined, TextEncoder);
    await expect(bin.write('x')).rejects.toThrow('does not support text content');
  });

  it('setMimeType', () => {
    const f = make();
    f.setMimeType('text/plain');
    expect(f.mimetype).toBe('text/plain');
  });
});
