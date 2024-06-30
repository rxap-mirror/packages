import {
  Global,
  Module,
} from '@nestjs/common';
import { ConfigurableModuleClass } from './configurable-module-builder';
import { MinioService } from './minio.service';


@Global()
@Module({
  providers: [ MinioService ],
  exports: [ MinioService ],
})
export class MinioModule extends ConfigurableModuleClass {
}
