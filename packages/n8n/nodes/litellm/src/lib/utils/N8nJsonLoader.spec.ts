import { N8nJsonLoader } from './N8nJsonLoader';

function ctx(params: Record<string, any>, options: any = {}) {
  return {
    getNodeParameter: jest.fn((name: string, _i: number, fb?: unknown) => {
      if (name === 'options') return options;
      return name in params ? params[name] : fb;
    }),
    getNode: () => ({ name: 'n' }),
  } as any;
}

describe('N8nJsonLoader', () => {
  it('processAll returns [] without items', async () => {
    expect(await new N8nJsonLoader(ctx({})).processAll()).toEqual([]);
  });

  it('loads all input data as json documents', async () => {
    const loader = new N8nJsonLoader(ctx({ jsonMode: 'allInputData', pointers: '' }));
    const docs = await loader.processAll([{ json: { a: 'x', b: 'y' } }, { json: { a: 'z' } }]);
    expect(docs.map((d) => d.pageContent)).toEqual(['x', 'y', 'z']);
  });

  it('respects json pointers and adds metadata filters', async () => {
    const loader = new N8nJsonLoader(
      ctx(
        { jsonMode: 'allInputData', pointers: '/a' },
        { metadata: { metadataValues: [{ name: 'src', value: 'n8n' }] } },
      ),
    );
    const [doc] = await loader.processItem({ json: { a: 'keep', b: 'drop' } }, 0);
    expect(doc.pageContent).toBe('keep');
    expect(doc.metadata['src']).toBe('n8n');
  });

  it('expressionData with an object uses the JSON loader', async () => {
    const loader = new N8nJsonLoader(ctx({ jsonMode: 'expressionData', jsonData: { k: 'v' }, pointers: '' }));
    const docs = await loader.processItem({ json: {} }, 0);
    expect(docs.map((d) => d.pageContent)).toEqual(['v']);
  });

  it('expressionData with a string uses the text loader and honours the options prefix', async () => {
    const loader = new N8nJsonLoader(
      ctx({ jsonMode: 'expressionData', jsonData: 'plain text', 'pre.pointers': '' }),
      'pre.',
    );
    const docs = await loader.processItem({ json: {} }, 0);
    expect(docs.map((d) => d.pageContent)).toEqual(['plain text']);
  });

  it('uses the text splitter when supplied', async () => {
    const splitter: any = { splitDocuments: jest.fn(async (d: any[]) => [...d, ...d]) };
    const loader = new N8nJsonLoader(ctx({ jsonMode: 'expressionData', jsonData: 'text' }), '', splitter);
    const docs = await loader.processItem({ json: {} }, 0);
    expect(splitter.splitDocuments).toHaveBeenCalled();
    expect(docs).toHaveLength(2);
  });

  it('throws when no loader could be created', async () => {
    const loader = new N8nJsonLoader(ctx({ jsonMode: 'expressionData', jsonData: 42 }));
    await expect(loader.processItem({ json: {} }, 0)).rejects.toThrow('Document loader is not initialized');
  });

  it('returns [] for an undefined item', async () => {
    const loader = new N8nJsonLoader(ctx({ jsonMode: 'allInputData' }));
    expect(await loader.processItem(undefined as any, 0)).toEqual([]);
  });
});
