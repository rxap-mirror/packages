import { mkdtempSync, mkdirSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { create } from 'tar';
import { Tar } from './Tar.node';

async function makeTar(): Promise<Buffer> {
  const dir = mkdtempSync(join(tmpdir(), 'tar-src-'));
  writeFileSync(join(dir, 'a.txt'), 'A');
  mkdirSync(join(dir, 'sub'));
  writeFileSync(join(dir, 'sub', 'b.txt'), 'B');
  const chunks: Buffer[] = [];
  const stream = create({ cwd: dir, gzip: true }, ['a.txt', 'sub']);
  for await (const chunk of stream) {
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks);
}

describe('Tar node', () => {
  const node = new Tar();
  let params: Record<string, any>;
  let buffer: Buffer;
  let ctx: any;

  beforeAll(async () => { buffer = await makeTar(); });

  beforeEach(() => {
    params = { operation: 'extract', inputDateProperty: 'data', globalFilePathPrefix: '', fileList: [] };
    ctx = {
      getInputData: jest.fn(() => [{ json: { id: 1 } }]),
      getNodeParameter: jest.fn((name: string, _i: number, def?: any) => name in params ? params[name] : def),
      getNode: jest.fn(() => ({ name: 'Tar' })),
      continueOnFail: jest.fn(() => false),
      helpers: {
        getBinaryDataBuffer: jest.fn(async () => buffer),
        prepareBinaryData: jest.fn(async (b: Buffer, path: string) => ({ data: b.toString(), path })),
      },
    };
  });

  it('describes the node', () => {
    expect(node.description.name).toBe('Tar');
    expect(node.description.properties.map((p) => p.name)).toContain('fileList');
  });

  it('extracts all files', async () => {
    const [results] = await node.execute.call(ctx);
    expect(Object.keys(results[0].binary!).sort()).toEqual(['a_txt', 'sub_b_txt']);
    expect(results[0].json).toEqual({ id: 1 });
  });

  it('extracts only the listed files below the prefix', async () => {
    params['fileList'] = ['a.txt'];
    const [results] = await node.execute.call(ctx);
    expect(Object.keys(results[0].binary!)).toEqual(['a_txt']);
  });

  it('applies the global file path prefix', async () => {
    params['globalFilePathPrefix'] = 'sub';
    const [results] = await node.execute.call(ctx);
    expect(Object.keys(results[0].binary!)).toEqual(['b_txt']);
  });

  it('does nothing for an unknown operation', async () => {
    params['operation'] = 'other';
    const [results] = await node.execute.call(ctx);
    expect(results[0].binary).toEqual({});
  });

  it('returns an error for an invalid archive', async () => {
    ctx.helpers.getBinaryDataBuffer.mockRejectedValue(new Error('no binary'));
    await expect(node.execute.call(ctx)).rejects.toThrow('Failed to extract tar file. Error: no binary');
  });

  it('returns the error item when continueOnFail is enabled', async () => {
    ctx.continueOnFail.mockReturnValue(true);
    ctx.helpers.getBinaryDataBuffer.mockRejectedValue(new Error('no binary'));
    const result: any = await node.execute.call(ctx);
    expect(result[0][0].error.message).toContain('no binary');
  });
});
