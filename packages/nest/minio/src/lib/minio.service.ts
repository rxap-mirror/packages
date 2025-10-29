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

  get endPoint(): string {
    return this.options.endPoint;
  }

  constructor(
    @Inject(MINIO_OPTIONS) protected readonly options: ClientOptions,
  ) {
    super(options);
  }

}
