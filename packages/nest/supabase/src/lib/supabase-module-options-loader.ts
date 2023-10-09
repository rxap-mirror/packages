import {
  ConfigurableModuleOptionsFactory,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseModuleOptions } from './supabase.module';

@Injectable()
export class SupabaseModuleOptionsLoader implements ConfigurableModuleOptionsFactory<SupabaseModuleOptions, 'create'> {

  @Inject(ConfigService)
  private readonly config!: ConfigService;

  create(): SupabaseModuleOptions {
    return {
      supabaseUrl: this.config.getOrThrow('SUPABASE_URL'),
      supabaseKey: this.config.getOrThrow('SUPABASE_KEY'),
    };
  }

}
