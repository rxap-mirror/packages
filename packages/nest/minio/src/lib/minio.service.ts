import {
  Inject,
  Injectable,
} from '@nestjs/common';
import {
  Client,
  ClientOptions,
} from 'minio';
import { MINIO_OPTIONS } from './tokens';

@Injectable()
export class MinioService extends Client {

  constructor(
    @Inject(MINIO_OPTIONS) options: ClientOptions,
  ) {
    super(options);
  }

}
