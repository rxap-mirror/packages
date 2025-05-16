import { CacheOptions } from '@nestjs/cache-manager';
import { Injectable } from '@nestjs/common';
import { CacheModuleOptionsLoader } from '@rxap/nest-utilities';
import { KeyvMinio } from './keyv-minio';

@Injectable()
export class MinioCacheModuleOptionsFactory extends CacheModuleOptionsLoader {

  override createCacheOptions(): Promise<CacheOptions> | CacheOptions {
    return {
      ...super.createCacheOptions(),
      stores: new KeyvMinio({
        endPoint: this.config.get('KEYV_MINIO_END_POINT', 'minio'),
        port: this.config.get('KEYV_MINIO_PORT', 9000),
        useSSL: this.config.get('KEYV_MINIO_USE_SSL', false),
        accessKey: this.config.get('KEYV_MINIO_ACCESS_KEY', 'minioadmin'),
        secretKey: this.config.get('KEYV_MINIO_SECRET_KEY', 'minioadmin'),
        bucketName: this.config.get('KEYV_MINIO_BUCKET_NAME', 'keyv'),
        pathPrefix: this.config.get('KEYV_MINIO_PATH_PREFIX'),
      }),
    };
  }

}
