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
    if (config.get('DISABLE_REGISTER_TO_STATUS_SERVICE')) {
      logger.warn('Registering with the status service is disabled');
      return;
    }
    const statusServiceBaseUrl = config.getOrThrow('STATUS_SERVICE_BASE_URL');
    const requestUrl = `${ statusServiceBaseUrl }${ registerPath }`;
    const port = config.getOrThrow('PORT');
    logger.log(`Register service: ${ requestUrl } for port: ${ port }`, 'Bootstrap');
    let ready = false;
    let abort = false;
    let counter = 0;
    const timeout = 15 * 1000;
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
      } catch (e: any) {
        counter++;
        if (e.message.includes('getaddrinfo ENOTFOUND')) {
          logger.error(`Unable to resolve the domain: ${e.message}`);
          if (counter > 4) {
            abort = true;
          }
        } else {
          logger.warn(`Failed to register service (${counter}): ${ e.message }`, 'Bootstrap');
        }
        if (e instanceof AxiosError) {
          if (e.response?.status && e.response.status < 500) {
            logger.debug('Response: ' + JSON.stringify(e.response?.data), 'Bootstrap');
          }
        }
        logger.verbose(`Retry in ${ timeout / 1000 } seconds`, 'Bootstrap');
      }
    } while (!ready && !abort && await new Promise((resolve) => setTimeout(() => resolve(true), timeout)));
    if (ready) {
      logger.log('Service registered', 'Bootstrap');
    } else if (abort) {
      logger.warn(`Service registration aborted after ${counter} attempts`, 'Bootstrap');
    } else {
      logger.error('FATAL: Service registration failed', 'Bootstrap');
    }
  };
}
