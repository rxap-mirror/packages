import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Server } from './server';

export async function RegisterToStatusService(
  this: Server<any, any, any>,
  _: any,
  config: ConfigService,
  logger: Logger,
) {
  try {
    const statusServiceBaseUrl = config.getOrThrow('STATUS_SERVICE_BASE_URL');
    const requestUrl = `${ statusServiceBaseUrl }/register`;
    const port = config.getOrThrow('PORT');
    logger.debug(`Register service: ${ requestUrl } for port: ${ port }`, 'Ready');
    await axios.post(requestUrl, {
      name: this.environment.app,
      port,
    });
    logger.log('Service registered', 'Ready');
  } catch (e: any) {
    logger.error(`Failed to register service: ${ e.message }`, undefined, 'Ready');
  }
}
