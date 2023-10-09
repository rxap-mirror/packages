import {
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Web3Storage } from 'web3.storage';
import { WEB3_STORAGE_OPTIONS } from './tokens';
import { Web3StorageModuleOptions } from './web3-storage.module';

@Injectable()
export class Web3StorageService extends Web3Storage {

  constructor(
    @Inject(WEB3_STORAGE_OPTIONS)
      options: Web3StorageModuleOptions,
    logger: Logger,
  ) {
    super(options);
    logger.log('Initialized web3 storage client', 'Web3StorageService');
  }

}
