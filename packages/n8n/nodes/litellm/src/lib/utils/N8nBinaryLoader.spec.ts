import { N8nBinaryLoader } from './N8nBinaryLoader';

function mockLoader(name: string): jest.Mock {
  const g = globalThis as any;
  g.__mockLoaders ??= {};
  g.__mockLoaders[name] = jest.fn().mockImplementation((source: unknown, opts: unknown) => ({
    load: async () => [{ pageContent: name, metadata: { source, opts } }],
  }));
  return g.__mockLoaders[name];
}
jest.mock('@langchain/community/document_loaders/fs/pdf', () => ({ PDFLoader: mockLoader('pdf') }));
jest.mock('@langchain/community/document_loaders/fs/csv', () => ({ CSVLoader: mockLoader('csv') }));
jest.mock('@langchain/community/document_loaders/fs/docx', () => ({ DocxLoader: mockLoader('docx') }));
jest.mock('@langchain/community/document_loaders/fs/epub', () => ({ EPubLoader: mockLoader('epub') }));
jest.mock('langchain/document_loaders/fs/json', () => ({ JSONLoader: mockLoader('json') }));
jest.mock('langchain/document_loaders/fs/text', () => ({ TextLoader: mockLoader('text') }));

const mockLoaders: Record<string, jest.Mock> = (globalThis as any).__mockLoaders;

const mockTmpCleanup = jest.fn();
jest.mock('tmp-promise', () => ({ file: jest.fn(async () => ({ path: '/tmp/x-epub', cleanup: mockTmpCleanup })) }));
jest.mock('fs', () => ({ ...jest.requireActual('fs'), createWriteStream: jest.fn(() => new (require('stream').Writable)({ write: (_c: any, _e: any, cb: any) => cb() })) }));

function ctx(params: Record<string, any>, binary: Record<string, any>, inputData: any[] = [], options: any = {}) {
  return {
    getNode: () => ({ name: 'n' }),
    getInputData: () => inputData,
    getNodeParameter: jest.fn((name: string, _i: number, fb?: unknown) => {
      if (name === 'options') return options;
      return name in params ? params[name] : fb;
    }),
    helpers: {
      assertBinaryData: jest.fn((_i: number, key: string) => binary[key]),
      getBinaryStream: jest.fn(async () => 'stream'),
      binaryToBuffer: jest.fn(async () => Buffer.from('from-stream')),
    },
  } as any;
}

const bin = (mimeType: string, text = 'content') => ({ mimeType, data: Buffer.from(text).toString('base64') });

describe('N8nBinaryLoader', () => {
  beforeEach(() => Object.values(mockLoaders).forEach((m) => m.mockClear()));

  it('processAll returns [] without items', async () => {
    expect(await new N8nBinaryLoader(ctx({}, {})).processAll()).toEqual([]);
  });

  it.each([
    ['application/pdf', 'pdf'],
    ['text/csv', 'csv'],
    ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'docx'],
    ['text/plain', 'text'],
    ['application/json', 'json'],
  ])('picks the loader for %s', async (mime, loader) => {
    const c = ctx({ binaryMode: 'specificField', loader: 'auto' }, { data: bin(mime) });
    const docs = await new N8nBinaryLoader(c, '', 'data').processItem({ json: {} }, 0);
    expect(docs.map((d) => d.pageContent)).toEqual([loader]);
    expect(mockLoaders[loader]).toHaveBeenCalledTimes(1);
  });

  it('passes loader options (pdf split pages, csv column/separator, json pointers)', async () => {
    const run = async (mime: string, params: Record<string, any>) =>
      new N8nBinaryLoader(ctx({ binaryMode: 'specificField', ...params }, { data: bin(mime) }), 'o.', 'data').processItem(
        { json: {} },
        0,
      );
    await run('application/pdf', { 'o.splitPages': true });
    expect(mockLoaders['pdf'].mock.calls[0][1]).toEqual({ splitPages: true });
    await run('text/csv', { 'o.column': 'c', 'o.separator': ';' });
    expect(mockLoaders['csv'].mock.calls[0][1]).toEqual({ column: 'c', separator: ';' });
    await run('application/json', { 'o.pointers': '/a, /b' });
    expect(mockLoaders['json'].mock.calls[0][1]).toEqual(['/a', '/b']);
  });

  it('writes epub blobs to a temp file', async () => {
    const c = ctx({ binaryMode: 'specificField' }, { data: bin('application/epub+zip') });
    const docs = await new N8nBinaryLoader(c, '', 'data').processItem({ json: {} }, 0);
    expect(docs[0].pageContent).toBe('epub');
    expect(mockLoaders['epub']).toHaveBeenCalledWith('/tmp/x-epub');
  });

  it('reads stored binary data via stream and applies metadata and splitter', async () => {
    const splitter: any = { splitDocuments: jest.fn(async (d: any[]) => d) };
    const c = ctx(
      { binaryMode: 'specificField' },
      { data: { mimeType: 'text/plain', id: 'bin-1', data: '' } },
      [],
      { metadata: { metadataValues: [{ name: 'k', value: 'v' }] } },
    );
    const docs = await new N8nBinaryLoader(c, '', 'data', splitter).processItem({ json: {} }, 0);
    expect(c.helpers.getBinaryStream).toHaveBeenCalledWith('bin-1');
    expect(splitter.splitDocuments).toHaveBeenCalled();
    expect(docs[0].metadata['k']).toBe('v');
  });

  it('processes every binary key of every input item in allInputData mode', async () => {
    const input = [{ json: {}, binary: { a: bin('text/plain'), b: bin('application/json') } }, { json: {} }];
    const c = ctx({ binaryMode: 'allInputData' }, { a: bin('text/plain'), b: bin('application/json') }, input);
    const docs = await new N8nBinaryLoader(c).processItem({ json: {} }, 0);
    expect(docs.map((d) => d.pageContent)).toEqual(['text', 'json']);
  });

  it('returns [] for an undefined item', async () => {
    const c = ctx({ binaryMode: 'specificField' }, {});
    expect(await new N8nBinaryLoader(c, '', 'data').processItemByKey(undefined as any, 0, 'data')).toEqual([]);
  });

  describe('mime type validation', () => {
    const run = (mime: string, loader: string) =>
      new N8nBinaryLoader(ctx({ binaryMode: 'specificField', loader }, { data: bin(mime) }), '', 'data').processItem(
        { json: {} },
        0,
      );

    it('rejects a mime type that does not match the selected loader', async () => {
      await expect(run('application/pdf', 'csvLoader')).rejects.toThrow(/Please select under "Loader Type": pdfLoader/);
    });

    it('rejects unsupported mime types', async () => {
      await expect(run('image/png', 'auto')).rejects.toThrow('Unsupported mime type: image/png');
    });

    it('accepts text variants for the text loader', async () => {
      await expect(run('text/md', 'textLoader')).resolves.toHaveLength(1);
    });
  });
});
