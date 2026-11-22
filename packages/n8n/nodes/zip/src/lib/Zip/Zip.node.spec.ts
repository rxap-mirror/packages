import AdmZip from 'adm-zip';
import { Zip } from './Zip.node';

const testMock = jest.fn();

jest.mock('adm-zip', () => {
  const Real = jest.requireActual('adm-zip');
  return jest.fn((buf?: Buffer) => {
    const zip = new Real(buf);
    const test = zip.test.bind(zip);
    zip.test = (...args: any[]) => (testMock.getMockImplementation() ? testMock(...args) : test(...args));
    return zip;
  });
});

describe('Zip node', () => {
  const node = new Zip();
  let params: Record<string, any>;
  let buffer: Buffer;
  let ctx: any;

  const makeZip = () => {
    const zip = new AdmZip();
    zip.addFile('a.txt', Buffer.from('A'));
    zip.addFile('dir/b.json', Buffer.from('{}'));
    return zip.toBuffer();
  };

  beforeEach(() => {
    testMock.mockReset();
    params = { operation: 'extract', inputDateProperty: 'data', password: '' };
    buffer = makeZip();
    ctx = {
      getInputData: jest.fn(() => [{ json: { id: 1 } }]),
      getNodeParameter: jest.fn((name: string, _i: number, def?: any) => name in params ? params[name] : def),
      getNode: jest.fn(() => ({ name: 'Zip' })),
      helpers: {
        getBinaryDataBuffer: jest.fn(async () => buffer),
        prepareBinaryData: jest.fn(async (b: Buffer, path: string) => ({ data: b.toString(), path })),
      },
    };
  });

  it('describes the node', () => {
    expect(node.description.name).toBe('rxapZip');
    expect(node.description.properties.map((p) => p.name)).toEqual(['operation', 'inputDateProperty', 'password']);
  });

  it('extracts files into binary properties', async () => {
    const [results] = await node.execute.call(ctx);
    expect(ctx.helpers.getBinaryDataBuffer).toHaveBeenCalledWith(0, 'data');
    expect(results[0].json).toEqual({ id: 1 });
    expect(Object.keys(results[0].binary!).sort()).toEqual(['a_txt', 'dir_b_json']);
    expect(results[0].binary!['a_txt']).toMatchObject({ data: 'A' });
  });

  it('does not extract anything for an unknown operation', async () => {
    params['operation'] = 'other';
    const [results] = await node.execute.call(ctx);
    expect(results[0].binary).toEqual({});
  });

  it('rejects an incorrect password', async () => {
    params['password'] = 'secret';
    testMock.mockReturnValue(false);
    await expect(node.execute.call(ctx)).rejects.toThrow('Password is incorrect');
  });

  it('extracts with a correct password', async () => {
    params['password'] = 'secret';
    testMock.mockReturnValue(true);
    const [results] = await node.execute.call(ctx);
    expect(testMock).toHaveBeenCalledWith('secret');
    expect(results[0].binary).toBeDefined();
  });

  it('propagates invalid archives', async () => {
    buffer = Buffer.from('not a zip');
    await expect(node.execute.call(ctx)).rejects.toThrow();
  });
});
