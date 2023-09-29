import {
  kvsStorage,
  KvsStorage,
} from '@kvs/storage';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LocalStorage } from '@rxap/node-local-storage';

export interface RegisteredService extends Record<string, any> {
  url: string | undefined;
  port: number;
  domain: string | undefined;
  healthCheckPath: string;
  infoPath: string;
  ip: string | undefined;
}

export interface StorageSchema {
  [key: string]: RegisteredService;
}

@Injectable()
export class ServiceRegistryService implements OnApplicationBootstrap {

  private storage!: KvsStorage<StorageSchema>;

  @Inject(ConfigService)
  private readonly config!: ConfigService;

  async onApplicationBootstrap(): Promise<void> {
    this.storage = await kvsStorage({
      name: 'registered-service',
      version: 1,
      storage: new LocalStorage(this.config.getOrThrow('STORE_FILE_PATH')),
    });
  }

  register(
    name: string,
    url: string | undefined,
    port: number,
    domain: string | undefined,
    healthCheckPath: string,
    infoPath: string,
    ip: string | undefined,
    protocol: string,
  ) {
    return this.storage.set(
      name,
      {
        url,
        port,
        domain,
        healthCheckPath,
        infoPath,
        ip,
        protocol,
      },
    );
  }

  has(name: string) {
    return this.storage.has(name);
  }

  get(name: string) {
    return this.storage.get(name);
  }

  async getOrThrow(name: string) {
    const config = await this.get(name);
    if (!config) {
      throw new InternalServerErrorException(`Service '${ name }' is not registered`);
    }
    return config;
  }

  unregister(name: string) {
    return this.storage.delete(name);
  }

  async getBaseUrl(serviceName: string) {

    const config = await this.getOrThrow(serviceName);

    const {
      url,
      port,
      domain,
      ip,
      protocol,
    } = config;

    if (url) {
      return url;
    }

    if (domain) {
      return `${ protocol }://${ domain }:${ port }`;
    }

    if (ip) {
      return `${ protocol }://${ ip }:${ port }`;
    }

    throw new InternalServerErrorException(`Service '${ serviceName }' has no url, domain or ip`);

  }

  async getHealthCheckUrl(serviceName: string) {
    const baseUrl = await this.getBaseUrl(serviceName);
    const config = await this.getOrThrow(serviceName);
    return `${ baseUrl }${ config.healthCheckPath }`;
  }

  async getInfoUrl(serviceName: string) {
    const baseUrl = await this.getBaseUrl(serviceName);
    const config = await this.getOrThrow(serviceName);
    return `${ baseUrl }${ config.infoPath }`;
  }

}
