import {
  ConfigurableModuleBuilder,
  DynamicModule,
  Global,
  Logger,
  Module,
  Scope,
} from '@nestjs/common';
import {
  APP_FILTER,
  APP_INTERCEPTOR,
} from '@nestjs/core';
import { DefaultUpstreamInterceptor } from './default.upstream-interceptor';
import { LoggingInterceptor } from './logging.interceptor';
import { ValidatorInterceptor } from './validator.interceptor';
import {
  OpenApiServerConfig,
  OpenApiUpstreamInterceptor,
} from './open-api-operation/types';
import { OpenApiOperationCommandExceptionFilter } from './open-api-operation/open-api-operation-command-exception-filter';
import {
  OPEN_API_SERVER_CONFIG,
  OPEN_API_UPSTREAM_INTERCEPTOR,
} from './open-api-operation/tokens';
import { OpenApiConfigService } from './open-api-operation/open-api-config.service';

export interface OpenApiModuleOptions {
  serverConfig?: OpenApiServerConfig[];
  interceptors?: OpenApiUpstreamInterceptor[];
}

export const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<OpenApiModuleOptions>()
  .setExtras({
    isGlobal: true,
  })
  .build();

@Global()
@Module({
  providers: [

    {
      provide: APP_FILTER,
      useClass: OpenApiOperationCommandExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ValidatorInterceptor,
    },
    DefaultUpstreamInterceptor,
    OpenApiConfigService,
    Logger,
  ],
  exports: [ OpenApiConfigService ],
})
export class OpenApiModule extends ConfigurableModuleClass {

  static register(options: typeof OPTIONS_TYPE): DynamicModule {
    return this.updateProviders(super.register(options));
  }

  static registerAsync(options: typeof ASYNC_OPTIONS_TYPE): DynamicModule {
    return this.updateProviders(super.registerAsync(options));
  }

  private static updateProviders(module: DynamicModule) {
    module.providers ??= [];
    module.providers.push({
      provide: OPEN_API_SERVER_CONFIG,
      useFactory: OpenApiServerConfigFactory,
      inject: [ MODULE_OPTIONS_TOKEN ],
    });
    module.providers.push({
      provide: OPEN_API_UPSTREAM_INTERCEPTOR,
      useFactory: OpenApiUpstreamInterceptorFactory,
      scope: Scope.REQUEST,
      inject: [ MODULE_OPTIONS_TOKEN, DefaultUpstreamInterceptor ],
    });
    return module;
  }

}

export function OpenApiServerConfigFactory(options: OpenApiModuleOptions) {
  return options.serverConfig ?? [];
}

export function OpenApiUpstreamInterceptorFactory(
  options: OpenApiModuleOptions,
  defaultInterceptor: DefaultUpstreamInterceptor,
) {
  const interceptors = options.interceptors ?? [];
  if (!interceptors.some(interceptor => interceptor instanceof DefaultUpstreamInterceptor)) {
    interceptors.push(defaultInterceptor);
  }
  return interceptors;
}
