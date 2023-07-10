import {Global, Module} from '@nestjs/common';
import {MinioService} from './minio.service';
import {ConfigurableModuleClass} from './configurable-module-builder';


@Global()
@Module({
  providers: [MinioService],
  exports: [MinioService],
})
export class MinioModule extends ConfigurableModuleClass {
}
