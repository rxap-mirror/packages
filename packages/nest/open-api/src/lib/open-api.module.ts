import {
  ConfigurableModuleBuilder,
  DynamicModule,
  Global,
  Module,
  Scope,
} from '@nestjs/common';
import {
  APP_FILTER,
  APP_INTERCEPTOR,
} from '@nestjs/core';
import { Constructor } from '@rxap/utilities';
import { DefaultUpstreamInterceptor } from './default.upstream-interceptor';
import { LoggingInterceptor } from './logging.interceptor';
import { OpenApiConfigService } from './open-api-operation/open-api-config.service';
import { OpenApiOperationCommandExceptionFilter } from './open-api-operation/open-api-operation-command-exception-filter';
import {
  OPEN_API_SERVER_CONFIG,
  OPEN_API_UPSTREAM_INTERCEPTOR,
} from './open-api-operation/tokens';
import {
  OpenApiServerConfig,
  OpenApiUpstreamInterceptor,
} from './open-api-operation/types';
import { ValidatorInterceptor } from './validator.interceptor';

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
  ],
  exports: [ OpenApiConfigService ],
})
export class OpenApiModule extends ConfigurableModuleClass {

  static register(
    options: typeof OPTIONS_TYPE, interceptors: Constructor<OpenApiUpstreamInterceptor>[] = []): DynamicModule {
    return this.updateProviders(super.register(options), interceptors);
  }

  static registerAsync(
    options: typeof ASYNC_OPTIONS_TYPE, interceptors: Constructor<OpenApiUpstreamInterceptor>[] = []): DynamicModule {
    return this.updateProviders(super.registerAsync(options), interceptors);
  }

  private static updateProviders(module: DynamicModule, interceptors: Constructor<OpenApiUpstreamInterceptor>[]) {
    module.providers ??= [];
    module.providers.push(...interceptors);
    module.providers.push({
      provide: OPEN_API_SERVER_CONFIG,
      useFactory: OpenApiServerConfigFactory,
      inject: [ MODULE_OPTIONS_TOKEN ],
    });
    module.providers.push({
      provide: OPEN_API_UPSTREAM_INTERCEPTOR,
      useFactory: OpenApiUpstreamInterceptorFactory,
      scope: Scope.REQUEST,
      inject: [ MODULE_OPTIONS_TOKEN, DefaultUpstreamInterceptor, ...interceptors ],
    });
    // If the OPEN_API_UPSTREAM_INTERCEPTOR token is only provided with the scope REQUEST then for some odd reason
    // the constructor of all direct and indirect dependencies services are not called.
    // Only if the services are used in a controller with the scope REQUEST the constructor is called.
    // This would lead to the issue that the OpenAPiCommand feature can only be used in the context of a controller,
    // but not in services that are used in a module or CQRS Handler
    // IMPORTED: The DefaultUpstreamInterceptor can also not be provided as this services uses the @INJECT(Request) decorator
    module.providers.push({
      provide: OPEN_API_UPSTREAM_INTERCEPTOR,
      useFactory: OpenApiUpstreamInterceptorFactory,
      inject: [ MODULE_OPTIONS_TOKEN, ...interceptors ],
    });
    return module;
  }

}

export function OpenApiServerConfigFactory(options: OpenApiModuleOptions) {
  return options?.serverConfig ?? [];
}

export function OpenApiUpstreamInterceptorFactory(
  options: OpenApiModuleOptions,
  ...additionalInterceptors: OpenApiUpstreamInterceptor[]
) {
  const interceptors = options.interceptors ?? [];
  if (additionalInterceptors.length) {
    const defaultInterceptor = additionalInterceptors.shift();
    if (defaultInterceptor) {
      if (!additionalInterceptors.some(interceptor => interceptor instanceof DefaultUpstreamInterceptor)) {
        interceptors.push(defaultInterceptor);
      }
    }
    interceptors.push(...additionalInterceptors);
  }
  return interceptors;
}
