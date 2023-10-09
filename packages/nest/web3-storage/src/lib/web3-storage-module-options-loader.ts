import {
  ConfigurableModuleOptionsFactory,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Web3StorageModuleOptions } from './web3-storage.module';

@Injectable()
export class Web3StorageModuleOptionsLoader
  implements ConfigurableModuleOptionsFactory<Web3StorageModuleOptions, 'create'> {

  @Inject(ConfigService)
  private readonly config!: ConfigService;

  create(): Web3StorageModuleOptions {
    return {
      token: this.config.getOrThrow('WEB3_STORAGE_TOKEN'),
    };
  }

}
