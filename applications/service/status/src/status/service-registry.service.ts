import { kvsLocalStorage } from '@kvs/node-localstorage';
import { KvsStorage } from '@kvs/storage';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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
    this.storage = await kvsLocalStorage({
      name: 'registered-service',
      storeFilePath: this.config.getOrThrow('STORE_FILE_PATH'),
      version: 1,
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
    } = config;

    if (url) {
      return url;
    }

    if (domain) {
      return `https://${ domain }:${ port }`;
    }

    if (ip) {
      return `https://${ ip }:${ port }`;
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
