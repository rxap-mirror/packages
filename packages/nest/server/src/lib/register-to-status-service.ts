import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Environment } from '@rxap/nest-utilities';
import axios, { AxiosError } from 'axios';

export interface RegisterToStatusServiceOptions {
  registerPath?: string;
}

export function RegisterToStatusService({ registerPath = '/register' }: RegisterToStatusServiceOptions = {}) {
  return async (
    _: any,
    config: ConfigService,
    logger: Logger,
    __: any,
    environment: Environment,
  ) => {
    const statusServiceBaseUrl = config.getOrThrow('STATUS_SERVICE_BASE_URL');
    const requestUrl = `${ statusServiceBaseUrl }${ registerPath }`;
    const port = config.getOrThrow('PORT');
    logger.debug(`Register service: ${ requestUrl } for port: ${ port }`, 'Bootstrap');
    let ready = false;
    let counter = 0;
    do {
      try {
        await axios.post(requestUrl, {
          name: environment.app,
          port,
        });
        ready = true;
        logger.log('Service registered', 'Bootstrap');
      } catch (e: any) {
        logger.error(`Failed to register service (${ counter++ }): ${ e.message }`, undefined, 'Bootstrap');
        if (e instanceof AxiosError) {
          if (e.response?.status && e.response.status < 500) {
            logger.debug('Response: ' + JSON.stringify(e.response?.data), 'Bootstrap');
          }
        }
      }
    } while (!ready && await new Promise((resolve) => setTimeout(() => resolve(true), 15 * 1000)));
  };
}
