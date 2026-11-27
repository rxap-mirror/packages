import {
  ConfigurableModuleBuilder,
  DynamicModule,
  Global,
  Module,
} from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { VALKEY_MODULE_OPTIONS } from './tokens';
import { ValkeyModuleOptions } from './valkey-module-options';
import { ValkeyHealthIndicator } from './valkey.health-indicator';
import { ValkeyLockService } from './valkey-lock.service';
import { ValkeyService } from './valkey.service';

export const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<ValkeyModuleOptions>()
  .setExtras({ global: true })
  .build();

@Global()
@Module({
  imports: [TerminusModule],
  providers: [ValkeyService, ValkeyLockService, ValkeyHealthIndicator],
  exports: [ValkeyService, ValkeyLockService, ValkeyHealthIndicator],
})
export class ValkeyModule extends ConfigurableModuleClass {
  static register(options: typeof OPTIONS_TYPE): DynamicModule {
    return this.updateProviders(super.register(options));
  }

  static registerAsync(options: typeof ASYNC_OPTIONS_TYPE): DynamicModule {
    return this.updateProviders(super.registerAsync(options));
  }

  private static updateProviders(module: DynamicModule): DynamicModule {
    module.providers ??= [];
    module.providers.push({
      provide: VALKEY_MODULE_OPTIONS,
      useExisting: MODULE_OPTIONS_TOKEN,
    });
    return module;
  }
}
