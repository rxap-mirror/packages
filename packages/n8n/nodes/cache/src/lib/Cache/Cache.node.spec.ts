import { Readable } from 'stream';
import { Cache } from './Cache.node';

const client = {
  bucketExists: jest.fn(),
  putObject: jest.fn(),
  getObject: jest.fn(),
};

jest.mock('minio', () => ({ Client: jest.fn(() => client) }));

describe('Cache node', () => {
  const node = new Cache();
  let params: Record<string, any>;
  let ctx: any;
  let items: any[];

  beforeEach(() => {
    jest.clearAllMocks();
    client.bucketExists.mockResolvedValue(true);
    items = [{ json: { a: 1 } }];
    params = { operation: 'read', bucket: 'b', key: ['k'], disabled: false };
    ctx = {
      getNodeParameter: jest.fn((name: string) => params[name]),
      getInputData: jest.fn(() => items),
      getCredentials: jest.fn().mockResolvedValue({ endPoint: 'e' }),
      getWorkflow: jest.fn(() => ({ id: 'wf' })),
      getNode: jest.fn(() => ({ name: 'Cache' })),
      continueOnFail: jest.fn(() => false),
      helpers: { getBinaryDataBuffer: jest.fn().mockResolvedValue(Buffer.from('bin')) },
    };
  });

  it('derives the outputs from the operation parameter', () => {
    expect(node.description.outputs).toMatch(/^=\{\{\([\s\S]*\)\(\$parameter\)\}\}$/);
    expect(node.description.outputs).toContain('No Cache');
  });

  describe('read', () => {
    it('returns cached items on a hit', async () => {
      client.getObject.mockResolvedValue(Readable.from([Buffer.from('{"cached":'), Buffer.from('true}')]));
      const result = await node.execute.call(ctx);
      expect(result).toEqual([[{ json: { cached: true } }], []]);
      expect(client.getObject).toHaveBeenCalledWith('b', expect.stringMatching(/^wf\/[0-9a-f]{64}\/item\.json$/));
    });

    it('uses "unknown" without a workflow id', async () => {
      ctx.getWorkflow.mockReturnValue({});
      client.getObject.mockResolvedValue(Readable.from(['{}']));
      await node.execute.call(ctx);
      expect(client.getObject.mock.calls[0][1]).toMatch(/^unknown\//);
    });

    it('returns the item on the no cache output on a miss', async () => {
      client.getObject.mockRejectedValue(Object.assign(new Error('x'), { code: 'NoSuchKey' }));
      const result = await node.execute.call(ctx);
      expect(result).toEqual([[], items]);
    });

    it('fails on other read errors', async () => {
      client.getObject.mockRejectedValue(Object.assign(new Error('denied'), { code: 'AccessDenied' }));
      await expect(node.execute.call(ctx)).rejects.toThrow('Error reading item from cache: denied');
    });

    it('bypasses the cache when disabled', async () => {
      params['disabled'] = true;
      const result = await node.execute.call(ctx);
      expect(client.getObject).not.toHaveBeenCalled();
      expect(result).toEqual([[], items]);
    });

    it('fails when the bucket does not exist', async () => {
      client.bucketExists.mockResolvedValue(false);
      await expect(node.execute.call(ctx)).rejects.toThrow('Bucket does not exist');
    });

    it('returns an error item when continueOnFail is enabled', async () => {
      ctx.continueOnFail.mockReturnValue(true);
      client.bucketExists.mockResolvedValue(false);
      const result: any = await node.execute.call(ctx);
      expect(result[0][0].error).toBeDefined();
    });
  });

  describe('write', () => {
    beforeEach(() => { params['operation'] = 'write'; });

    it('stores the json and binary data', async () => {
      items = [{ json: { a: 1 }, binary: { data: { fileName: 'f.txt', mimeType: 'text/plain' } } }];
      const result = await node.execute.call(ctx);
      expect(result).toEqual([items]);
      expect(client.putObject).toHaveBeenCalledTimes(2);
      expect(client.putObject.mock.calls[0][2]).toBe(JSON.stringify({ a: 1 }, null, 2));
      expect(client.putObject.mock.calls[1][1]).toMatch(/^[0-9a-f]{64}\/f\.txt$/);
      expect(client.putObject.mock.calls[1][4]).toEqual({ 'Content-Type': 'text/plain' });
    });

    it('does nothing when disabled', async () => {
      params['disabled'] = true;
      await node.execute.call(ctx);
      expect(client.putObject).not.toHaveBeenCalled();
    });

    it('wraps json write errors', async () => {
      client.putObject.mockRejectedValue(new Error('full'));
      await expect(node.execute.call(ctx)).rejects.toThrow('Error storing item in cache: full');
    });

    it('wraps binary write errors', async () => {
      items = [{ json: {}, binary: { data: { fileName: 'f', mimeType: 'x' } } }];
      client.putObject.mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error('bin'));
      await expect(node.execute.call(ctx)).rejects.toThrow('Error storing item in cache: bin');
    });
  });
});
