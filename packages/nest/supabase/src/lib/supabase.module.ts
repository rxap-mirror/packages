import {
  ConfigurableModuleBuilder,
  DynamicModule,
  Global,
  Logger,
  Module,
} from '@nestjs/common';
import { SupabaseClientOptions } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';
import { SUPABASE_OPTIONS } from './tokens';

export interface SupabaseModuleOptions<
  Database = any,
  SchemaName extends string & keyof Database = 'public' extends keyof Database
                                               ? 'public'
                                               : string & keyof Database,
> {
  supabaseUrl: string;
  supabaseKey: string;
  options?: SupabaseClientOptions<SchemaName>;
}

export const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<SupabaseModuleOptions>()
  .setExtras({
    isGlobal: true,
  })
  .build();

@Global()
@Module({
  providers: [
    SupabaseService,
    Logger,
  ],
  exports: [ SupabaseService ],
})
export class SupabaseModule extends ConfigurableModuleClass {

  static register(options: typeof OPTIONS_TYPE): DynamicModule {
    return this.updateProviders(super.register(options));
  }

  static registerAsync(options: typeof ASYNC_OPTIONS_TYPE): DynamicModule {
    return this.updateProviders(super.registerAsync(options));
  }

  private static updateProviders(module: DynamicModule) {
    module.providers ??= [];
    module.providers.push({
      provide: SUPABASE_OPTIONS,
      useFactory: SupabaseOptionsFactory,
      inject: [ MODULE_OPTIONS_TOKEN ],
    });
    return module;
  }

}

export function SupabaseOptionsFactory(options: SupabaseModuleOptions) {
  options.options ??= {};
  options.options.auth ??= {};
  options.options.auth.autoRefreshToken ??= false;
  options.options.auth.persistSession ??= false;
  return options;
}
