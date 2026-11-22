import { download, downloadArrayBuffer, downloadBlob, downloadFile, downloadVirtualFile } from './download-virtual-file';
import { AsyncVirtualFile, VirtualFile } from './virtual-file';

describe('download', () => {
  let link: any;
  let append: jest.Mock;
  let remove: jest.Mock;
  const g = global as any;
  const originalDocument = g.document;
  const originalCreate = URL.createObjectURL;
  const originalRevoke = URL.revokeObjectURL;

  beforeEach(() => {
    link = { style: {}, click: jest.fn() };
    append = jest.fn();
    remove = jest.fn();
    g.document = {
      createElement: jest.fn().mockReturnValue(link),
      body: { appendChild: append, removeChild: remove },
    };
    URL.createObjectURL = jest.fn().mockReturnValue('blob:x');
    URL.revokeObjectURL = jest.fn();
  });

  afterEach(() => {
    g.document = originalDocument;
    URL.createObjectURL = originalCreate;
    URL.revokeObjectURL = originalRevoke;
  });

  it('downloadBlob clicks a temporary link', () => {
    downloadBlob(new Blob(['a'], { type: 'text/plain' }), 'a.txt');
    expect(link.download).toBe('a.txt');
    expect(link.href).toBe('blob:x');
    expect(link.type).toBe('text/plain');
    expect(link.click).toHaveBeenCalled();
    expect(append).toHaveBeenCalledWith(link);
    expect(remove).toHaveBeenCalledWith(link);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:x');
  });

  it('downloadBlob omits type when empty', () => {
    downloadBlob(new Blob(['a']), 'a.bin');
    expect(link.type).toBeUndefined();
  });

  it('downloadArrayBuffer', () => {
    downloadArrayBuffer(new ArrayBuffer(1), 'a.bin', 'application/x-a');
    expect(link.type).toBe('application/x-a');
    expect(link.click).toHaveBeenCalled();
  });

  it('downloadFile', async () => {
    await downloadFile(new File(['x'], 'f.txt', { type: 'text/plain' }));
    expect(link.download).toBe('f.txt');
  });

  it('downloadVirtualFile handles sync and async files', async () => {
    downloadVirtualFile(new VirtualFile('a.txt', 'a.txt', new ArrayBuffer(1), 'text/plain') as any);
    expect(link.download).toBe('a.txt');
    await downloadVirtualFile(new AsyncVirtualFile('b.txt', 'b.txt', Promise.resolve(new ArrayBuffer(1))));
    expect(link.download).toBe('b.txt');
  });

  it('download dispatches on the input type', async () => {
    await download(new File(['x'], 'f.txt'));
    expect(link.download).toBe('f.txt');
    download(new Blob(['x']), 'b.txt');
    expect(link.download).toBe('b.txt');
    download(new ArrayBuffer(1), 'ab.txt');
    expect(link.download).toBe('ab.txt');
    download(new VirtualFile('v.txt', 'v.txt', new ArrayBuffer(1)) as any);
    expect(link.download).toBe('v.txt');
  });
});
