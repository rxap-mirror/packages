import { Yaml } from './Yaml.node';

function ctx(operation: string, items: any[], params: Record<string, any>) {
  return {
    getInputData: () => items,
    getNodeParameter: jest.fn((name: string, _i: number, fb?: unknown) => (name === 'operation' ? operation : params[name] ?? fb)),
    continueOnFail: () => false,
    getNode: () => ({ name: 'n' }),
  } as any;
}

describe('Yaml node', () => {
  const node = new Yaml();

  it('declares all operations and merges operation properties', () => {
    const op: any = node.description.properties.find((p) => p.name === 'operation');
    expect(op.options.map((o: any) => o.value)).toEqual(['extract', 'convert', 'jsonToYaml', 'yamlToJson', 'setValue']);
    expect(node.description.properties.length).toBeGreaterThan(5);
  });

  it('dispatches jsonToYaml', async () => {
    const res = await node.execute.call(
      ctx('jsonToYaml', [{ json: { d: { a: 1 } } }], { dataPropertyName: 'd', destinationKey: 'y' }),
    );
    expect(res[0][0].json).toEqual({ y: 'a: 1\n' });
  });

  it('dispatches yamlToJson', async () => {
    const res = await node.execute.call(ctx('yamlToJson', [{ json: { d: 'a: 1' } }], { dataPropertyName: 'd' }));
    expect(res[0][0].json).toEqual({ a: 1 });
  });

  it('dispatches setValue', async () => {
    const res = await node.execute.call(
      ctx('setValue', [{ json: { d: 'a: 1' } }], { dataPropertyName: 'd', inputType: 'string', 'fields.values': [] }),
    );
    expect(res[0][0].json).toEqual({ d: 'a: 1\n' });
  });

  it('dispatches convert and extract', async () => {
    const cc = ctx('convert', [{ json: { a: 1 } }], { mode: 'once', options: {}, binaryPropertyName: 'data' });
    cc.helpers = { prepareBinaryData: jest.fn(async (b: Buffer) => ({ data: b.toString('base64') })) };
    const conv = await node.execute.call(cc);
    expect(conv[0]).toHaveLength(1);
    const c = ctx('extract', [{ json: {} }], { options: {}, binaryPropertyName: 'data', destinationKey: 'o' });
    c.helpers = { getBinaryDataBuffer: jest.fn() };
    await expect(node.execute.call(c)).resolves.toEqual([[]]);
  });

  it('returns nothing for an unknown operation', async () => {
    await expect(node.execute.call(ctx('zzz', [], {}))).resolves.toEqual([[]]);
  });
});
