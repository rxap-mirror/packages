import {
  ConfigurableModuleOptionsFactory,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ValkeyModuleOptions } from './valkey-module-options';

function toBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  return ['true', '1'].includes(String(value ?? '').trim().toLowerCase());
}

@Injectable()
export class ValkeyModuleOptionsFactory
  implements ConfigurableModuleOptionsFactory<ValkeyModuleOptions, 'create'>
{
  @Inject(ConfigService)
  private readonly config!: ConfigService;

  create(): ValkeyModuleOptions {
    return {
      host: this.config.get<string>('VALKEY_HOST', 'localhost') || 'localhost',
      port: Number(this.config.get<number>('VALKEY_PORT', 6379)) || 6379,
      password: this.config.get<string>('VALKEY_PASSWORD', '') || undefined,
      url: this.config.get<string>('VALKEY_URL', '') || undefined,
      tls: toBoolean(this.config.get('VALKEY_TLS', false)),
    };
  }
}
