import { Download } from './Download.node';

describe('Download node', () => {
  const node = new Download();
  const operation = (value: string): any =>
    (node.description.properties[0] as any).options.find((o: any) => o.value === value);
  const postReceive = (value: string): any[] => operation(value).routing.output.postReceive;

  const ctx = (params: Record<string, any>, input: any = [{ json: { in: 1 } }]) =>
    ({
      getNodeParameter: (name: string) => params[name] ?? null,
      getInputData: () => input,
    }) as any;

  it('describes the node', () => {
    expect(node.description.name).toBe('ipfsDownload');
    expect(node.description.properties.map((p) => p.name)).toEqual([
      'operation', 'gateway', 'cid', 'path', 'mimeType', 'overwriteFileName',
    ]);
    expect((node.description.properties[0] as any).options.map((o: any) => o.value)).toEqual([
      'download-as-file', 'download-as-json', 'download-as-text',
    ]);
  });

  describe('download-as-file', () => {
    const handler = postReceive('download-as-file')[1];

    it('applies overrides and fills the json from binary metadata', async () => {
      const items: any[] = [{ json: {}, binary: { data: { mimeType: 'x', fileName: 'orig.bin', fileSize: '1 B' } } }];
      const res = await handler.call(ctx({ path: '/dir/file.json', mimeType: 'application/json' }), items, {});
      const data = res[0].binary.data;
      expect(data.fileName).toBe('file.json');
      expect(data.fileExtension).toBe('json');
      expect(data.fileType).toBe('json');
      expect(res[0].json.file).toEqual({
        mimeType: 'application/json', fileName: 'file.json', fileExtension: 'json', fileType: 'json', fileSize: '1 B',
      });
      expect(res[0].json.input).toEqual([{ json: { in: 1 } }]);
    });

    it('prefers overwriteFileName and keeps existing json', async () => {
      const items: any[] = [{ json: { keep: 1 }, binary: { data: { mimeType: 'text/plain', fileName: 'a.bin' } } }];
      const res = await handler.call(ctx({ path: '/x/y.txt', overwriteFileName: 'new.md' }), items, {});
      expect(res[0].binary.data.fileName).toBe('new.md');
      expect(res[0].binary.data.fileType).toBe('text');
      expect(res[0].json).toEqual({ keep: 1 });
    });

    it.each([
      ['application/pdf', 'pdf'],
      ['image/png', 'image'],
      ['image/jpeg', 'image'],
      ['text/html', 'html'],
      ['application/xhtml+xml', 'html'],
    ])('maps %s to %s', async (mimeType, fileType) => {
      const items: any[] = [{ json: {}, binary: { data: { mimeType, fileName: 'f.x' } } }];
      const res = await handler.call(ctx({}), items, {});
      expect(res[0].binary.data.fileType).toBe(fileType);
    });

    it('leaves items without binary data untouched', async () => {
      const items: any[] = [{ json: { a: 1 } }];
      expect(await handler.call(ctx({}), items, {})).toEqual([{ json: { a: 1 } }]);
    });
  });

  describe('download-as-json / text', () => {
    it('parses a json body', async () => {
      const [h] = postReceive('download-as-json');
      expect(await h.call(ctx({}), [], { body: Buffer.from('{"a":1}') })).toEqual([{ json: { a: 1 } }]);
      expect(await h.call(ctx({}), [], {})).toEqual([]);
    });

    it('returns text content', async () => {
      const [h] = postReceive('download-as-text');
      expect(await h.call(ctx({}), [], { body: Buffer.from('hello') })).toEqual([{ json: { content: 'hello' } }]);
      expect(await h.call(ctx({}), [], {})).toEqual([]);
    });
  });
});
