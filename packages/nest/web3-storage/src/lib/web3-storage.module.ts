import {
  ConfigurableModuleBuilder,
  DynamicModule,
  Global,
  Logger,
  Module,
} from '@nestjs/common';
import { Service } from 'web3.storage';
import { WEB3_STORAGE_OPTIONS } from './tokens';
import { Web3StorageService } from './web3-storage.service';

export type Web3StorageModuleOptions = Pick<Service, 'token' | 'endpoint' | 'rateLimiter' | 'fetch'>;

export const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<Web3StorageModuleOptions>()
  .setExtras({
    isGlobal: true,
  })
  .build();

@Global()
@Module({
  providers: [
    Web3StorageService,
    Logger,
  ],
  exports: [ Web3StorageService ],
})
export class Web3StorageModule extends ConfigurableModuleClass {

  static register(options: typeof OPTIONS_TYPE): DynamicModule {
    return this.updateProviders(super.register(options));
  }

  static registerAsync(options: typeof ASYNC_OPTIONS_TYPE): DynamicModule {
    return this.updateProviders(super.registerAsync(options));
  }

  private static updateProviders(module: DynamicModule) {
    module.providers ??= [];
    module.providers.push({
      provide: WEB3_STORAGE_OPTIONS,
      useExisting: MODULE_OPTIONS_TOKEN,
    });
    return module;
  }

}
