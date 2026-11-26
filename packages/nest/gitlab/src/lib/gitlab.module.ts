import { ConfigurableModuleBuilder, DynamicModule, Global, Module } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';
import { GitlabModuleOptions } from './gitlab-module-options';
import { GitlabHealthIndicator } from './gitlab.health-indicator';
import { GitlabService } from './gitlab.service';
import { GITLAB_OPTIONS } from './tokens';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, OPTIONS_TYPE, ASYNC_OPTIONS_TYPE } =
  new ConfigurableModuleBuilder<GitlabModuleOptions<any>>()
    .setExtras({
      isGlobal: true,
    })
    .build();

@Global()
@Module({
  providers: [GitlabService, GitlabHealthIndicator, HealthIndicatorService],
  exports: [GitlabService, GitlabHealthIndicator],
})
export class GitlabModule extends ConfigurableModuleClass {
  static register(options: typeof OPTIONS_TYPE): DynamicModule {
    return this.updateProviders(super.register(options));
  }

  static registerAsync(options: typeof ASYNC_OPTIONS_TYPE): DynamicModule {
    return this.updateProviders(super.registerAsync(options));
  }

  private static updateProviders(module: DynamicModule) {
    module.providers ??= [];
    module.providers.push({
      provide: GITLAB_OPTIONS,
      useExisting: MODULE_OPTIONS_TOKEN,
    });
    return module;
  }
}
