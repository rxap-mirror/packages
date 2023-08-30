import { Injectable } from '@nestjs/common';
import { HealthIndicator } from '@nestjs/terminus';

@Injectable()
export class ServiceRegistryService extends HealthIndicator {

  private readonly services = new Map<string, string>();

  register(name: string, url: string) {
    this.services.set(name, url);
  }

  has(name: string) {
    return this.services.has(name);
  }

  get(name: string) {
    return this.services.get(name);
  }

  unregister(name: string) {
    this.services.delete(name);
  }

}
