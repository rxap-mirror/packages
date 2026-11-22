import { EventEmitter, Readable } from 'stream';
import { KeyvMinio } from './keyv-minio';
import { keyvMinioValidationSchema } from './keyv-minio-validation-schema';
import { MinioCacheModuleOptionsFactory } from './minio-cache-module-options-factory';
import * as Joi from 'joi';

const client: any = {
  getObject: jest.fn(),
  putObject: jest.fn(),
  removeObject: jest.fn(),
  listObjectsV2: jest.fn(),
};
jest.mock('minio', () => ({ Client: jest.fn(() => client) }));

describe('KeyvMinio', () => {
  let store: KeyvMinio;

  beforeEach(() => {
    Object.values(client).forEach((m: any) => m.mockReset());
    store = new KeyvMinio({ endPoint: 'h', accessKey: 'a', secretKey: 's', bucketName: 'b', pathPrefix: 'app' });
  });

  it('exposes the bucket name', () => {
    expect(store.bucketName).toBe('b');
  });

  describe('get', () => {
    it('reads and parses the object', async () => {
      client.getObject.mockResolvedValue(Readable.from([Buffer.from('{"value":'), Buffer.from('1}')]));
      await expect(store.get('k')).resolves.toEqual({ value: 1 });
      expect(client.getObject).toHaveBeenCalledWith('b', 'app/k.json');
    });

    it('returns undefined for NoSuchKey', async () => {
      client.getObject.mockRejectedValue({ code: 'NoSuchKey' });
      await expect(store.get('k')).resolves.toBeUndefined();
    });

    it('wraps other errors', async () => {
      client.getObject.mockRejectedValue({ code: 'X', message: 'oops' });
      await expect(store.get('k')).rejects.toThrow('(X) oops');
    });

    it('works without a path prefix', async () => {
      const s = new KeyvMinio({ endPoint: 'h', accessKey: 'a', secretKey: 's', bucketName: 'b' });
      client.getObject.mockResolvedValue(Readable.from(['{}']));
      await s.get('k');
      expect(client.getObject).toHaveBeenCalledWith('b', 'k.json');
    });
  });

  describe('set', () => {
    it('stores the value with an expiry', async () => {
      jest.spyOn(Date, 'now').mockReturnValue(1000);
      await store.set('k', 'v', 500);
      expect(client.putObject).toHaveBeenCalledWith('b', 'app/k.json', JSON.stringify({ value: 'v', expires: 1500 }), undefined);
      jest.restoreAllMocks();
    });

    it('stores null expiry without ttl', async () => {
      await store.set('k', 'v');
      expect(client.putObject.mock.calls[0][2]).toBe(JSON.stringify({ value: 'v', expires: null }));
    });
  });

  describe('delete', () => {
    it('returns true on success', async () => {
      client.removeObject.mockResolvedValue(undefined);
      await expect(store.delete('k')).resolves.toBe(true);
    });
    it('returns false for NoSuchKey', async () => {
      client.removeObject.mockRejectedValue({ code: 'NoSuchKey' });
      await expect(store.delete('k')).resolves.toBe(false);
    });
    it('swallows other errors and returns true', async () => {
      client.removeObject.mockRejectedValue({ code: 'Other' });
      await expect(store.delete('k')).resolves.toBe(true);
    });
  });

  describe('clear', () => {
    it('removes every listed object', async () => {
      const stream = new EventEmitter();
      client.listObjectsV2.mockReturnValue(stream);
      client.removeObject.mockResolvedValue(undefined);
      const p = store.clear();
      stream.emit('data', { name: 'app/a.json' });
      stream.emit('data', {});
      stream.emit('data', { name: 'app/b.json' });
      stream.emit('end');
      await p;
      expect(client.listObjectsV2).toHaveBeenCalledWith('b', 'app', true);
      expect(client.removeObject).toHaveBeenCalledTimes(2);
    });

    it('wraps stream errors', async () => {
      const stream = new EventEmitter();
      client.listObjectsV2.mockReturnValue(stream);
      const p = store.clear();
      stream.emit('error', new Error('bad'));
      await expect(p).rejects.toThrow('Error clearing minio bucket b: bad');
    });
  });

  it('does not implement on()', () => {
    expect(() => store.on('x', () => undefined)).toThrow('not implemented');
  });
});

describe('MinioCacheModuleOptionsFactory', () => {
  it('creates a KeyvMinio store from config', () => {
    const f = new MinioCacheModuleOptionsFactory();
    (f as any).config = {
      get: jest.fn((k: string, d?: any) => (k === 'KEYV_MINIO_BUCKET_NAME' ? 'bk' : d)),
    };
    jest
      .spyOn(Object.getPrototypeOf(MinioCacheModuleOptionsFactory.prototype), 'createCacheOptions')
      .mockReturnValue({ ttl: 5 });
    const opts: any = f.createCacheOptions();
    expect(opts.ttl).toBe(5);
    expect(opts.stores).toBeInstanceOf(KeyvMinio);
    expect(opts.stores.bucketName).toBe('bk');
  });
});

describe('keyvMinioValidationSchema', () => {
  it('provides defaults including the app as path prefix', () => {
    const { value } = Joi.object(keyvMinioValidationSchema({ app: 'myapp' } as any)).validate({});
    expect(value).toEqual({
      KEYV_MINIO_END_POINT: 'minio',
      KEYV_MINIO_PORT: 9000,
      KEYV_MINIO_USE_SSL: false,
      KEYV_MINIO_ACCESS_KEY: 'minioadmin',
      KEYV_MINIO_SECRET_KEY: 'minioadmin',
      KEYV_MINIO_BUCKET_NAME: 'keyv',
      KEYV_MINIO_PATH_PREFIX: 'myapp',
    });
  });
});
