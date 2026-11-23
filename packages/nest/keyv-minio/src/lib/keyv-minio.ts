import type {
  KeyvStorageAdapter,
  KeyvStorageEntry,
  KeyvStorageGetResult,
} from 'keyv';
import { EventEmitter } from 'node:events';
import {
  Client,
  ClientOptions,
} from 'minio';
import { join } from 'path';

export interface KeyvMinioOptions extends ClientOptions {
  bucketName: string;
  pathPrefix?: string;
}

/**
 * Keyv >= 6 storage adapter backed by a minio bucket.
 *
 * The adapter deliberately does not declare `capabilities.expires`: Keyv then treats it as a legacy
 * adapter, wraps it in a KeyvBridgeAdapter and keeps passing a relative `ttl` to `set` (the
 * `{ value, expires }` document format in the bucket is unchanged).
 */
export class KeyvMinio extends EventEmitter implements KeyvStorageAdapter {
  opts: any;

  namespace?: string;

  private readonly client: Client;

  constructor(private readonly options: KeyvMinioOptions) {
    super();
    this.client = new Client(options);
  }

  // keyv's IEventEmitter expects typed listener functions, node's EventEmitter returns `Function[]`
  override listeners(eventName: string | symbol): Array<(...args: any[]) => void> {
    return super.listeners(eventName) as Array<(...args: any[]) => void>;
  }

  override rawListeners(eventName: string | symbol): Array<(...args: any[]) => void> {
    return super.rawListeners(eventName) as Array<(...args: any[]) => void>;
  }

  get bucketName(): string {
    return this.options.bucketName;
  }

  async get<Value>(key: string): Promise<KeyvStorageGetResult<Value>> {
    const filePath = join(this.options.pathPrefix ?? '', key + '.json');
    try {
      const dataStream = await this.client.getObject(this.bucketName, filePath);
      let data = '';
      for await (const chunk of dataStream) {
        data += chunk.toString();
      }
      return JSON.parse(data);
    } catch (error: any) {
      if (error.code === 'NoSuchKey') {
        return undefined;
      }
      throw new Error(`Error getting minio object in bucket ${this.bucketName} with key ${filePath}: (${error.code}) ${error.message}`);
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    const filePath = join(this.options.pathPrefix ?? '', key + '.json');
    await this.client.putObject(this.bucketName, filePath, JSON.stringify({ value, expires: ttl ? Date.now() + ttl : null }), undefined);
    return true;
  }

  async setMany<Value>(values: KeyvStorageEntry<Value>[]): Promise<boolean[]> {
    return Promise.all(values.map(entry => {
      // legacy adapters receive a relative ttl; tolerate entries that carry an absolute expiry instead
      const { ttl, expires } = entry as KeyvStorageEntry<Value> & { ttl?: number };
      return this.set(entry.key, entry.value, ttl ?? (expires ? Math.max(expires - Date.now(), 1) : undefined));
    }));
  }

  async getMany<Value>(keys: string[]): Promise<Array<KeyvStorageGetResult<Value | undefined>>> {
    return Promise.all(keys.map(key => this.get<Value | undefined>(key)));
  }

  async has(key: string): Promise<boolean> {
    return (await this.get(key)) !== undefined;
  }

  async hasMany(keys: string[]): Promise<boolean[]> {
    return Promise.all(keys.map(key => this.has(key)));
  }

  async deleteMany(keys: string[]): Promise<boolean[]> {
    return Promise.all(keys.map(key => this.delete(key)));
  }

  async delete(key: string): Promise<boolean> {
    const filePath = join(this.options.pathPrefix ?? '', key + '.json');
    try {
      await this.client.removeObject(this.bucketName, filePath);
    } catch (error: any) {
      if (error.code === 'NoSuchKey') {
        return false;
      }
    }
    return true;
  }

  async clear(): Promise<void> {
    try {
      // Use the listObjectsV2 method to get a list of objects in the bucket
      const stream = this.client.listObjectsV2(this.bucketName, this.options.pathPrefix ?? '', true);

      await new Promise<void>((resolve, reject) => {

        // Array to hold promises for object deletions
        const deletePromises: Array<Promise<any>> = [];

        stream.on('data', (obj) => {
          if (!obj.name) {
            return;
          }
          // Push each deleteObject operation promise into the array
          deletePromises.push(this.client.removeObject(this.bucketName, obj.name));
        });

        stream.on('end', async () => {
          await Promise.allSettled(deletePromises);
          resolve();
        });

        stream.on('error', (err) => {
          reject(err);
        });

      });
    } catch (err: any) {
      throw new Error(`Error clearing minio bucket ${this.bucketName}: ${err.message}`);
    }
  }

}
