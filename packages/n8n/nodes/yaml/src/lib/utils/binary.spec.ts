import { parse } from 'yaml';
import { createBinaryFromJson, createBinaryFromJsonAsYAML } from './binary';

function ctx(extra: Record<string, unknown> = {}) {
  return {
    getNode: () => ({ name: 'node' }),
    helpers: {
      prepareBinaryData: jest.fn(async (buffer: Buffer, fileName?: string, mimeType?: string) => ({
        data: buffer.toString('base64'),
        fileName,
        mimeType,
        ...extra,
      })),
    },
  } as any;
}

const decode = (b: { data: string }) => Buffer.from(b.data, 'base64').toString('utf8');

describe('createBinaryFromJsonAsYAML', () => {
  it('serializes objects as yaml and defaults the file name', async () => {
    const c = ctx();
    const res = await createBinaryFromJsonAsYAML.call(c, { a: 1, b: [1, 2] }, {});
    expect(parse(decode(res))).toEqual({ a: 1, b: [1, 2] });
    expect(res.fileName).toBe('file.yaml');
    expect(c.helpers.prepareBinaryData.mock.calls[0][2]).toBe('application/yaml');
  });

  it('uses the file extension reported by n8n', async () => {
    const res = await createBinaryFromJsonAsYAML.call(ctx({ fileExtension: 'yml' }), { a: 1 }, {});
    expect(res.fileName).toBe('file.yml');
  });

  it('keeps an explicit file name and supports sourceKey/format', async () => {
    const res = await createBinaryFromJsonAsYAML.call(
      ctx(),
      { nested: { list: [1] } } as any,
      { sourceKey: 'nested', fileName: 'x.yaml', format: true },
    );
    expect(res.fileName).toBe('x.yaml');
    expect(parse(decode(res))).toEqual({ list: [1] });
  });

  it('encodes strings with encoding and BOM', async () => {
    const c = ctx();
    const res = await createBinaryFromJsonAsYAML.call(c, 'text' as any, { addBOM: true, mimeType: 'text/plain' });
    expect(Buffer.from(res.data, 'base64')[0]).toBe(0xef);
    expect(c.helpers.prepareBinaryData.mock.calls[0][2]).toBe('text/plain');
  });

  it('treats the value as base64 when requested', async () => {
    const b64 = Buffer.from('raw').toString('base64');
    const c = ctx();
    await createBinaryFromJsonAsYAML.call(c, b64 as any, { dataIsBase64: true });
    expect(c.helpers.prepareBinaryData.mock.calls[0][0]).toBeInstanceOf(Buffer);
  });

  it('throws when the source key is not set', async () => {
    await expect(createBinaryFromJsonAsYAML.call(ctx(), { a: 1 }, { sourceKey: 'missing' })).rejects.toThrow(
      'The value in "missing" is not set',
    );
  });
});

describe('createBinaryFromJson', () => {
  it('serializes objects as json (formatted or compact)', async () => {
    const c = ctx();
    const compact = await createBinaryFromJson.call(c, { a: 1 }, {});
    expect(decode(compact)).toBe('{"a":1}');
    expect(compact.fileName).toBe('file');
    expect(c.helpers.prepareBinaryData.mock.calls[0][2]).toBe('application/json');
    const pretty = await createBinaryFromJson.call(ctx({ fileExtension: 'json' }), { a: 1 }, { format: true });
    expect(decode(pretty)).toBe('{\n  "a": 1\n}');
    expect(pretty.fileName).toBe('file.json');
  });

  it('uses sourceKey strings verbatim', async () => {
    const res = await createBinaryFromJson.call(ctx(), { data: 'hello' }, { sourceKey: 'data', fileName: 'a.txt', mimeType: 'text/plain' });
    expect(decode(res)).toBe('hello');
    expect(res.fileName).toBe('a.txt');
  });

  it('supports base64 and errors on missing source', async () => {
    await createBinaryFromJson.call(ctx(), { data: Buffer.from('x').toString('base64') }, { sourceKey: 'data', dataIsBase64: true });
    await expect(createBinaryFromJson.call(ctx(), {}, { sourceKey: 'nope', itemIndex: 2 })).rejects.toThrow(
      'The value in "nope" is not set',
    );
  });
});
