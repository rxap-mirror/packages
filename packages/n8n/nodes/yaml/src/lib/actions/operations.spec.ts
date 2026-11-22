import * as convert from './convert.operation';
import * as extract from './extract.operation';
import * as jsonToYaml from './jsonToYaml.operation';
import * as setValue from './setValue.operation';
import * as yamlToJson from './yamlToJson.operation';

type Params = Record<string, any>;

function ctx(params: Params, opts: { continueOnFail?: boolean; binaries?: Record<string, string> } = {}) {
  return {
    getNode: () => ({ name: 'node', type: 'yaml', typeVersion: 1, position: [0, 0], parameters: {}, id: '1' }),
    getNodeParameter: jest.fn((name: string, _i: number, fallback?: unknown) =>
      name in params ? params[name] : fallback,
    ),
    continueOnFail: () => !!opts.continueOnFail,
    helpers: {
      getBinaryDataBuffer: jest.fn(async (_i: number, prop: string) => Buffer.from(opts.binaries?.[prop] ?? '')),
      prepareBinaryData: jest.fn(async (buffer: Buffer, fileName?: string, mimeType?: string) => ({
        data: buffer.toString('base64'),
        fileName,
        mimeType,
      })),
    },
  } as any;
}

const failing = (): any => {
  const o: any = {};
  Object.defineProperty(o, 'data', {
    enumerable: true,
    get() {
      throw new Error('boom');
    },
  });
  return o;
};
const fromB64 = (s: string) => Buffer.from(s, 'base64').toString('utf8');

describe('operation descriptions', () => {
  it.each([
    ['convert', convert, 'convert'],
    ['extract', extract, 'extract'],
    ['jsonToYaml', jsonToYaml, 'jsonToYaml'],
    ['yamlToJson', yamlToJson, 'yamlToJson'],
    ['setValue', setValue, 'setValue'],
  ])('%s is only shown for its operation', (_n, mod, op) => {
    expect(mod.description.length).toBeGreaterThan(0);
    for (const p of mod.description) {
      expect(p.displayOptions?.show?.['operation']).toEqual([op]);
    }
  });
});

describe('jsonToYaml', () => {
  it('converts a json field to yaml text', async () => {
    const c = ctx({ dataPropertyName: 'data', destinationKey: 'yaml' });
    const res = await jsonToYaml.execute.call(c, [{ json: { data: { a: 1, b: ['x'] } } }]);
    expect(res).toEqual([{ json: { yaml: 'a: 1\nb:\n  - x\n' }, pairedItem: { item: 0 } }]);
  });

  it('returns an error item when continueOnFail is set', async () => {
    const c = ctx({ dataPropertyName: 'data', destinationKey: 'yaml' }, { continueOnFail: true });
    const circular = failing();
    const res = await jsonToYaml.execute.call(c, [{ json: circular }, { json: { data: { ok: 1 } } }]);
    expect(res).toHaveLength(2);
    expect(res[0].json['error']).toBeDefined();
    expect(res[0].pairedItem).toEqual({ item: 0 });
    expect(res[1].json['yaml']).toBe('ok: 1\n');
  });

  it('throws without continueOnFail', async () => {
    const c = ctx({ dataPropertyName: 'data', destinationKey: 'yaml' });
    const circular = failing();
    await expect(jsonToYaml.execute.call(c, [{ json: circular }])).rejects.toThrow();
  });
});

describe('yamlToJson', () => {
  it('parses a yaml string field', async () => {
    const c = ctx({ dataPropertyName: 'data' });
    const res = await yamlToJson.execute.call(c, [{ json: { data: 'a: 1\nb:\n  - x\n' } }]);
    expect(res).toEqual([{ json: { a: 1, b: ['x'] } }]);
  });

  it('fails when the property is missing', async () => {
    const c = ctx({ dataPropertyName: 'data' });
    await expect(yamlToJson.execute.call(c, [{ json: {} }])).rejects.toThrow('Item has no JSON property called "data"');
  });

  it('returns error items when continueOnFail is set', async () => {
    const c = ctx({ dataPropertyName: 'data' }, { continueOnFail: true });
    const res = await yamlToJson.execute.call(c, [{ json: {} }, { json: { data: 'k: v' } }]);
    expect(res).toHaveLength(2);
    expect(res[0].json['error']).toMatch(/no JSON property/);
    expect(res[1].json).toEqual({ k: 'v' });
  });
});

describe('extract', () => {
  const params = (options: Params = {}) => ({ options, binaryPropertyName: 'data', destinationKey: 'out' });

  it('extracts yaml from a binary field and removes the binary', async () => {
    const c = ctx(params(), { binaries: { data: 'a: 1\n' } });
    const item = { json: { keep: 1 }, binary: { data: { mimeType: 'x', data: '' }, other: { mimeType: 'y', data: '' } } };
    const res = await extract.execute.call(c, [item as any]);
    expect(res).toHaveLength(1);
    expect(res[0].json).toEqual({ out: { a: 1 } });
    expect(res[0].binary).toEqual({ other: { mimeType: 'y', data: '' } });
    expect(res[0].pairedItem).toEqual({ item: 0 });
  });

  it('keepSource json copies json, both keeps binary', async () => {
    const binary = { data: { mimeType: 'x', data: '' } };
    let c = ctx(params({ keepSource: 'json' }), { binaries: { data: 'a: 1' } });
    let res = await extract.execute.call(c, [{ json: { keep: 1 }, binary } as any]);
    expect(res[0].json).toEqual({ keep: 1, out: { a: 1 } });
    c = ctx(params({ keepSource: 'both' }), { binaries: { data: 'a: 1' } });
    res = await extract.execute.call(c, [{ json: { keep: 1 }, binary } as any]);
    expect(res[0].binary).toBe(binary);
    c = ctx(params({ keepSource: 'binary' }), { binaries: { data: 'a: 1' } });
    res = await extract.execute.call(c, [{ json: { keep: 1 }, binary } as any]);
    expect(res[0].json).toEqual({ out: { a: 1 } });
    expect(res[0].binary).toBe(binary);
  });

  it('yields an empty object for an empty file and skips items without binary', async () => {
    const c = ctx(params(), { binaries: { data: '' } });
    const res = await extract.execute.call(c, [
      { json: {} },
      { json: {}, binary: { data: { mimeType: 'x', data: '' } } } as any,
    ]);
    expect(res).toHaveLength(1);
    expect(res[0].json).toEqual({ out: {} });
  });

  it('throws NodeOperationError for invalid yaml and honours continueOnFail', async () => {
    const binary = { data: { mimeType: 'x', data: '' } };
    await expect(
      extract.execute.call(ctx(params(), { binaries: { data: 'a: [1' } }), [{ json: {}, binary } as any]),
    ).rejects.toThrow();
    const res = await extract.execute.call(ctx(params(), { binaries: { data: 'a: [1' }, continueOnFail: true }), [
      { json: {}, binary } as any,
    ]);
    expect(res[0].json['error']).toBeDefined();
  });
});

describe('convert', () => {
  const opts = { fileName: 'out.yaml' };

  it('once mode writes all items into one yaml file', async () => {
    const c = ctx({ mode: 'once', options: opts, binaryPropertyName: 'file' });
    const res = await convert.execute.call(c, [{ json: { a: 1 } }, { json: { b: 2 } }]);
    expect(res).toHaveLength(1);
    expect(fromB64(res[0].binary!['file'].data)).toBe('- a: 1\n- b: 2\n');
    expect(res[0].binary!['file'].fileName).toBe('out.yaml');
    expect(res[0].pairedItem).toEqual([{ item: 0 }, { item: 1 }]);
  });

  it('each item mode writes one file per item', async () => {
    const c = ctx({ mode: 'each', options: { format: true }, binaryPropertyName: 'data' });
    const res = await convert.execute.call(c, [{ json: { a: 1 } }, { json: { b: 2 } }]);
    expect(res).toHaveLength(2);
    expect(fromB64(res[1].binary!['data'].data)).toBe('b: 2\n');
    expect(res[1].pairedItem).toEqual({ item: 1 });
    expect(res[0].binary!['data'].fileName).toBe('file.yaml');
  });

  it('each item mode returns an error item on failure with continueOnFail', async () => {
    const circular = failing();
    const c = ctx({ mode: 'each', options: {}, binaryPropertyName: 'data' }, { continueOnFail: true });
    const res = await convert.execute.call(c, [{ json: circular }, { json: { ok: 1 } }]);
    expect(res[0].json['error']).toBeDefined();
    expect(res[1].binary).toBeDefined();
    await expect(
      convert.execute.call(ctx({ mode: 'each', options: {}, binaryPropertyName: 'data' }), [{ json: circular }]),
    ).rejects.toThrow();
  });

  it('once mode returns an error item with continueOnFail instead of throwing', async () => {
    const circular = failing();
    const c = ctx({ mode: 'once', options: {}, binaryPropertyName: 'data' }, { continueOnFail: true });
    const res = await convert.execute.call(c, [{ json: circular }]);
    expect(res).toHaveLength(1);
    expect(res[0].json['error']).toBeDefined();
    await expect(
      convert.execute.call(ctx({ mode: 'once', options: {}, binaryPropertyName: 'data' }), [{ json: circular }]),
    ).rejects.toThrow();
  });
});

describe('setValue', () => {
  const field = (name: string, type: string, value: unknown) => ({ name, type, [type]: value });

  it('sets values in a yaml string, keeping comments', async () => {
    const c = ctx({
      dataPropertyName: 'data',
      inputType: 'string',
      'fields.values': [field('a.b', 'numberValue', '5'), field('name', 'stringValue', 'x')],
    });
    const res = await setValue.execute.call(c, [{ json: { data: '# comment\na:\n  b: 1\n' } }]);
    expect(res).toHaveLength(1);
    const out = res[0].json['data'] as string;
    expect(out).toContain('# comment');
    expect(out).toContain('b: 5');
    expect(out).toContain('name: x');
  });

  it('auto detects binary input and writes binary output', async () => {
    const c = ctx(
      {
        dataPropertyName: 'data',
        inputType: 'auto',
        'fields.values': [field('k', 'booleanValue', true)],
        binaryOptions: { fileName: 'f.yaml' },
      },
      { binaries: { data: 'k: false\n' } },
    );
    const res = await setValue.execute.call(c, [{ json: {}, binary: { data: { mimeType: 'x', data: '' } } } as any]);
    expect(fromB64(res[0].binary!['data'].data)).toBe('k: true\n');
    expect(res[0].binary!['data'].fileName).toBe('f.yaml');
    expect(res[0].pairedItem).toEqual({ item: 0 });
  });

  it('skips items without the binary property in binary mode', async () => {
    const c = ctx({ dataPropertyName: 'data', inputType: 'binary', 'fields.values': [] });
    await expect(setValue.execute.call(c, [{ json: {} }])).resolves.toEqual([]);
  });

  it('fails for a missing string property and for unknown input types', async () => {
    await expect(
      setValue.execute.call(ctx({ dataPropertyName: 'data', inputType: 'string', 'fields.values': [] }), [{ json: {} }]),
    ).rejects.toThrow('Item has no JSON or String property called "data"');
    await expect(
      setValue.execute.call(ctx({ dataPropertyName: 'data', inputType: 'weird', 'fields.values': [] }), [{ json: {} }]),
    ).rejects.toThrow('The input type "weird" is not known!');
  });

  it('returns error items with continueOnFail', async () => {
    const c = ctx({ dataPropertyName: 'data', inputType: 'string', 'fields.values': [] }, { continueOnFail: true });
    const res = await setValue.execute.call(c, [{ json: {} }, { json: { data: 'a: 1' } }]);
    expect(res).toHaveLength(2);
    expect(res[0].json['error']).toMatch(/no JSON or String property/);
  });

  it('honours ignoreConversionErrors', async () => {
    const base = {
      dataPropertyName: 'data',
      inputType: 'string',
      'fields.values': [field('n', 'numberValue', 'abc')],
    };
    await expect(setValue.execute.call(ctx(base), [{ json: { data: 'n: 1' } }])).rejects.toThrow();
    const res = await setValue.execute.call(ctx({ ...base, setOptions: { ignoreConversionErrors: true } }), [
      { json: { data: 'n: 1' } },
    ]);
    expect(res[0].json['data']).toContain('n: abc');
  });
});
