import {
  DynamicModule,
  Global,
  Module,
} from '@nestjs/common';
import {
  ASYNC_OPTIONS_TYPE,
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE,
} from './configurable-module-builder';
import { MinioHealthIndicator } from './minio.health-indicator';
import { MinioService } from './minio.service';
import { MINIO_OPTIONS } from './tokens';


@Global()
@Module({
  providers: [ MinioService, MinioHealthIndicator ],
  exports: [ MinioService, MinioHealthIndicator ],
})
export class MinioModule extends ConfigurableModuleClass {

  static register(options: typeof OPTIONS_TYPE): DynamicModule {
    return this.updateProviders(super.register(options));
  }

  static registerAsync(options: typeof ASYNC_OPTIONS_TYPE): DynamicModule {
    return this.updateProviders(super.registerAsync(options));
  }

  private static updateProviders(module: DynamicModule) {
    module.providers ??= [];
    module.providers.push({
      provide: MINIO_OPTIONS,
      useExisting: MODULE_OPTIONS_TOKEN,
    });
    return module;
  }

}
