import { createHash } from 'crypto';
import { Hash } from './Hash.node';

function ctx(items: any[], params: Record<string, string>, buffers: Buffer[]) {
  return {
    getInputData: () => items,
    getNodeParameter: jest.fn((name: string) => params[name]),
    helpers: {
      getBinaryDataBuffer: jest.fn(async (i: number) => buffers[i]),
    },
  } as any;
}

describe('Hash node', () => {
  const node = new Hash();

  it('describes the supported algorithms', () => {
    expect(node.description.name).toBe('fileHash');
    const op: any = node.description.properties.find((p) => p.name === 'operation');
    expect(op.default).toBe('sha256');
    expect(op.options.map((o: any) => o.value)).toEqual(
      expect.arrayContaining(['sha256', 'md5', 'sha1', 'sha512', 'sha384']),
    );
  });

  it('hashes each item and keeps json and binary', async () => {
    const binary = { data: { mimeType: 'text/plain' } };
    const items = [
      { json: { id: 1 }, binary },
      { json: { id: 2 } },
    ];
    const c = ctx(items, { operation: 'sha256', binaryProperty: 'data', outputHashField: 'hash' }, [
      Buffer.from('hello'),
      Buffer.from('world'),
    ]);
    const [out] = await node.execute.call(c);
    expect(out).toEqual([
      { json: { id: 1, hash: createHash('sha256').update('hello').digest('hex') }, binary },
      { json: { id: 2, hash: createHash('sha256').update('world').digest('hex') }, binary: undefined },
    ]);
    expect(c.helpers.getBinaryDataBuffer).toHaveBeenCalledWith(0, 'data');
    expect(c.helpers.getBinaryDataBuffer).toHaveBeenCalledWith(1, 'data');
  });

  it('supports other algorithms and output field names', async () => {
    const c = ctx([{ json: {} }], { operation: 'md5', binaryProperty: 'f', outputHashField: 'md5sum' }, [
      Buffer.from('abc'),
    ]);
    const [[res]] = await node.execute.call(c);
    expect(res.json['md5sum']).toBe('900150983cd24fb0d6963f7d28e17f72');
  });

  it('returns no items for empty input', async () => {
    const c = ctx([], { operation: 'sha1', binaryProperty: 'data', outputHashField: 'hash' }, []);
    await expect(node.execute.call(c)).resolves.toEqual([[]]);
  });

  it('throws for unsupported algorithms', async () => {
    const c = ctx([{ json: {} }], { operation: 'nope', binaryProperty: 'data', outputHashField: 'hash' }, [
      Buffer.from('x'),
    ]);
    await expect(node.execute.call(c)).rejects.toThrow();
  });
});
