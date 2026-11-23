import { FileUploadMethod } from './file-upload.method';

class TestMethod extends FileUploadMethod {
  public exposeRemove() {
    this.removeInputFromDom();
  }
  public exposeHandle(event: any) {
    return this.handleFileInputChange(event);
  }
}

describe('FileUploadMethod', () => {
  let method: TestMethod;

  beforeEach(() => {
    method = new TestMethod();
    document.body.innerHTML = '';
  });

  it('uses window.document by default', () => {
    expect((method as any).document).toBe(window.document);
  });

  it('uses a custom document', () => {
    const doc = document.implementation.createHTMLDocument('x');
    method.setDocument(doc);
    expect((method as any).document).toBe(doc);
  });

  it('resolves with the selected file and removes the input from the dom', async () => {
    const input = document.createElement('input');
    input.type = 'file';
    vi.spyOn(input, 'click').mockImplementation(() => undefined);
    const promise = method.call({ fileInput: input, accept: 'image/*' });
    expect(input.getAttribute('accept')).toBe('image/*');
    const file = new File(['abc'], 'a.txt', { type: 'text/plain', lastModified: 5 });
    Object.defineProperty(input, 'files', { value: { 0: file } });
    input.dispatchEvent(new Event('change'));
    const result = await promise;
    expect(result).toBeInstanceOf(File);
    expect(result!.name).toBe('a.txt');
    expect(result!.type).toBe('text/plain');
    expect(result!.lastModified).toBe(5);
    expect(result!.size).toBe(3);
  });

  it('creates and attaches an input when none is given', async () => {
    const clicked = vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => undefined);
    const promise = method.call();
    const input = document.body.querySelector('input[type=file]') as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.getAttribute('accept')).toBe('**/**');
    expect(clicked).toHaveBeenCalled();
    Object.defineProperty(input, 'files', { value: { 0: new File(['x'], 'x.txt') } });
    input.dispatchEvent(new Event('change'));
    await promise;
    expect(document.body.querySelector('input[type=file]')).toBeNull();
    clicked.mockRestore();
  });

  it('resolves null when the window regains focus (cancel)', async () => {
    const clicked = vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => undefined);
    const promise = method.call();
    document.body.dispatchEvent(new Event('focus'));
    await expect(promise).resolves.toBeNull();
    clicked.mockRestore();
  });

  it('rejects when not exactly one file is selected', () => {
    expect(() => method.exposeHandle({ target: { files: {} } })).toThrow('File upload failed');
    expect(() => method.exposeHandle(undefined)).toThrow('File upload failed');
  });

  it('removeInputFromDom is a noop without input', () => {
    expect(() => method.exposeRemove()).not.toThrow();
  });

  it('emits read progress in percent', () => {
    const progress: number[] = [];
    method.progress$.subscribe((p) => progress.push(p));
    const readers: FileReader[] = [];
    const orig = FileReader.prototype.readAsArrayBuffer;
    vi.spyOn(FileReader.prototype, 'readAsArrayBuffer').mockImplementation(function (this: FileReader) {
      readers.push(this);
    });
    (method as any).readFile(new File(['abcd'], 'p.txt'));
    readers[0].dispatchEvent(new ProgressEvent('progress', { loaded: 1, total: 4 }));
    expect(progress).toEqual([25]);
    FileReader.prototype.readAsArrayBuffer = orig;
  });

  it('errors the progress stream for non progress events', () => {
    const error = vi.fn();
    method.progress$.subscribe({ error });
    const readers: FileReader[] = [];
    vi.spyOn(FileReader.prototype, 'readAsArrayBuffer').mockImplementation(function (this: FileReader) {
      readers.push(this);
    });
    (method as any).readFile(new File(['abcd'], 'p.txt'));
    readers[0].dispatchEvent(new Event('progress'));
    expect(error).toHaveBeenCalled();
  });
});
