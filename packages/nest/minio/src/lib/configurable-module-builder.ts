import {ConfigurableModuleBuilder} from '@nestjs/common';
import {ClientOptions} from 'minio';

export const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<ClientOptions>().build();
