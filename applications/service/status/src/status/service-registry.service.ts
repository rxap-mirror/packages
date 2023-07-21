import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { RegisterDto } from './register.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import {
  HealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus';

@Injectable()
export class ServiceRegistryService extends HealthIndicator {

  private readonly services = new Map<string, string>();

  @Inject(HttpService)
  private readonly httpService!: HttpService;

  @Inject(Logger)
  private readonly logger!: Logger;

  register(body: RegisterDto) {
    this.services.set(body.name, body.url);
  }

  has(name: string) {
    return this.services.has(name);
  }

  get(name: string) {
    return this.services.get(name);
  }

  async check(name: string): Promise<HealthIndicatorResult> {
    if (!this.has(name)) {
      throw new NotFoundException(`Service with name: ${ name } not found`);
    }
    const url = this.get(name)!;
    this.logger.debug(`Check service: ${ name } at url: ${ url }`);
    try {
      const response = await firstValueFrom(this.httpService.get(url, { timeout: 60000 }));
      return this.getStatus(name, true, { message: response.statusText });
    } catch (e: any) {
      if (e instanceof AxiosError) {
        this.logger.error(`Service: ${ name } at url: ${ url } is not available`, e.message, 'ServiceRegistryService');
        if (e.status === 509) {
          return this.getStatus(name, false, { message: 'Bandwidth Limit Exceeded' });
        }
        return this.getStatus(name, false, { message: e.message });
      }
    }
    return this.getStatus(name, false, { message: 'Unknown Error' });
  }

  unregister(name: string) {
    this.services.delete(name);
  }

  checkAll(): Array<() => Promise<HealthIndicatorResult>> {
    return Array.from(this.services.keys()).map((name) => () => this.check(name));
  }

}
