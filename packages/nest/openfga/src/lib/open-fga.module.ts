import {
  ConfigurableModuleBuilder,
  DynamicModule,
  Global,
  Module
} from '@nestjs/common';
import { OpenFgaOptions } from './open-fga.options';
import { OpenFgaService } from './open-fga.service';
import { OPEN_FGA_CLIENT_OPTIONS } from './tokens';

export const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<OpenFgaOptions>().setExtras({
  global: true,
}).build();

@Global()
@Module({
  providers: [ OpenFgaService],
  exports: [ OpenFgaService]
})
export class OpenFgaModule extends ConfigurableModuleClass {

  static register(options: typeof OPTIONS_TYPE): DynamicModule {
    return this.updateProviders(super.register(options));
  }

  static registerAsync(options: typeof ASYNC_OPTIONS_TYPE): DynamicModule {
    return this.updateProviders(super.registerAsync(options));
  }

  private static updateProviders(module: DynamicModule) {
    module.providers ??= [];
    module.providers.push({
      provide: OPEN_FGA_CLIENT_OPTIONS,
      useExisting: MODULE_OPTIONS_TOKEN
    });
    return module;
  }

}
