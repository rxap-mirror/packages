import {
  ConfigurableModuleBuilder,
  DynamicModule,
  Global,
  Module,
} from '@nestjs/common';
import { VAULT_OPTIONS } from './tokens';
import { VaultOptions } from './vault-options';
import { VaultService } from './vault.service';

export type VaultModuleOptions = VaultOptions;

export const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE
} = new ConfigurableModuleBuilder<VaultModuleOptions>()
  .setExtras({
    isGlobal: true
  })
  .build();

@Global()
@Module({
  providers: [
    VaultService
  ],
  exports: [
    VaultService
  ]
})
export class VaultModule extends ConfigurableModuleClass {

  static register(options: typeof OPTIONS_TYPE = {}): DynamicModule {
    return this.updateProviders(super.register(options));
  }

  static registerAsync(options: typeof ASYNC_OPTIONS_TYPE): DynamicModule {
    return this.updateProviders(super.registerAsync(options));
  }

  private static updateProviders(module: DynamicModule) {
    module.providers ??= [];
    module.providers.push({
      provide: VAULT_OPTIONS,
      useExisting: MODULE_OPTIONS_TOKEN
    });
    return module;
  }


}
