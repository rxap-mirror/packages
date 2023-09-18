import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Environment } from '@rxap/nest-utilities';
import axios, { AxiosError } from 'axios';
import { networkInterfaces } from 'os';
import * as process from 'process';

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
        const data: any = {
          name: environment.app,
          port,
        };
        if (!environment.production) {
          if (process.env['HOST_IP']) {
            data.ip = process.env['HOST_IP'];
          } else {
            const interfaces = networkInterfaces();
            const addresses = [];

            for (const ifaceName in interfaces) {
              const iface = interfaces[ifaceName];
              if (iface) {
                for (let i = 0; i < iface.length; i++) {
                  const alias = iface[i];
                  if ('IPv4' === alias.family && !alias.internal) {
                    addresses.push(alias.address);
                  }
                }
              }
            }

            if (addresses.length) {
              data.ip = addresses[0];
            }

          }
        }
        await axios.post(requestUrl, data);
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
