import {
  ConfigurableModuleBuilder,
  DynamicModule,
  Global,
  Module,
} from '@nestjs/common';
import { Environment } from './environment';
import { ENVIRONMENT } from './tokens';

export const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<Environment>()
  .setExtras({
    isGlobal: true,
  })
  .build();

@Global()
@Module({})
export class EnvironmentModule extends ConfigurableModuleClass {

  static register(options: typeof OPTIONS_TYPE): DynamicModule {
    return this.updateProviders(super.register(options));
  }

  static registerAsync(options: typeof ASYNC_OPTIONS_TYPE): DynamicModule {
    return this.updateProviders(super.registerAsync(options));
  }

  private static updateProviders(module: DynamicModule) {
    module.providers ??= [];
    module.providers.push({
      provide: ENVIRONMENT,
      useFactory: EnvironmentFactory,
      inject: [ MODULE_OPTIONS_TOKEN ],
    });
    return module;
  }

}

export function EnvironmentFactory(options: Environment) {
  return options;
}
