import {
  Inject,
  Injectable,
} from '@nestjs/common';
import {
  Client,
  ClientOptions,
} from 'minio';
import { MODULE_OPTIONS_TOKEN } from './configurable-module-builder';

@Injectable()
export class MinioService extends Client {

  constructor(
    @Inject(MODULE_OPTIONS_TOKEN) options: ClientOptions,
  ) {
    super(options);
  }

}
