import {
  KeyvStoreAdapter,
  StoredData,
} from 'keyv';
import {
  Client,
  ClientOptions,
} from 'minio';
import { join } from 'path';

export interface KeyvMinioOptions extends ClientOptions {
  bucketName: string;
  pathPrefix?: string;
}

export class KeyvMinio implements KeyvStoreAdapter {
  opts: any;

  private readonly client: Client;

  constructor(private readonly options: KeyvMinioOptions) {
    this.client = new Client(options);
  }

  get bucketName(): string {
    return this.options.bucketName;
  }

  async get<Value>(key: string): Promise<StoredData<Value> | undefined> {
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

  async set(key: string, value: any, ttl?: number) {
    const filePath = join(this.options.pathPrefix ?? '', key + '.json');
    await this.client.putObject(this.bucketName, filePath, JSON.stringify({ value, expires: ttl ? Date.now() + ttl : null }), undefined);
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

  on(event: string, listener: (...arguments_: any[]) => void): this {
    throw new Error('Method not implemented.');
  }

}
