import {
  ConfigurableModuleBuilder,
  DynamicModule,
  Global,
  Inject,
  Logger,
  Module,
} from '@nestjs/common';
import { OpenFgaGuard } from './open-fga.guard';
import { OpenFgaOptions } from './open-fga.options';
import { OpenFgaService } from './open-fga.service';
import { OpenfgaHealthIndicator } from './openfga.health-indicator';
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
  providers: [ OpenFgaService, OpenFgaGuard, OpenfgaHealthIndicator],
  exports: [ OpenFgaService, OpenFgaGuard, OpenfgaHealthIndicator]
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

  @Inject(OpenfgaHealthIndicator)
  readonly openfgaHealth!: OpenfgaHealthIndicator;

  @Inject(Logger)
  readonly logger!: Logger;

  @Inject(OPEN_FGA_CLIENT_OPTIONS)
  readonly options!: OpenFgaOptions;

  async onApplicationBootstrap() {
    const retryInterval = this.options.retryInterval ?? 1000 * 10;
    const maxStartupTime = this.options.maxStartupTime ?? 1000 * 60 * 2; // 2min
    const maxRetry = maxStartupTime / retryInterval;
    let counter = 0;
    do {
      try {
        const result = await this.openfgaHealth.isHealthy(true);
        if (result['openfga'].status === 'up') {
          this.logger.log('OpenFGA is ready', 'OpenFgaModule::onApplicationBootstrap');
          return;
        }
      } catch (e: any) {
        this.logger.warn(`OpenFGA is not ready (${counter}/${maxRetry}). Retry in ${retryInterval}ms: ${e.message}`, 'OpenFgaModule::onApplicationBootstrap');
      }
      await new Promise(resolve => setTimeout(resolve, retryInterval));
    } while (++counter < maxRetry);
  }

}
