import {
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CoercePrefix } from '@rxap/utilities';
import { BaseRmqOptions } from './options';

@Injectable()
export class RabbitmqOptionsFactory {

  @Inject(ConfigService)
  protected readonly config!: ConfigService;

  @Inject(Logger)
  protected readonly logger!: Logger;

  async build(): Promise<BaseRmqOptions> {

    let options: BaseRmqOptions;

    if (this.config.get('RABBITMQ_DISABLED')) {
      this.logger.debug('RabbitMQ is disabled', 'RabbitMQModuleConfigFactory');
      const host = this.config.getOrThrow('RABBITMQ_HOST');
      const port = this.config.getOrThrow('RABBITMQ_PORT');
      const vhost = this.config.getOrThrow('RABBITMQ_VHOST');
      options = {
        urls: [ `amqp://${ host }:${ port }/${ vhost }` ],
        socketOptions: {
          reconnectTimeInSeconds: 24 * 60 * 60
        }
      };
    } else {
      this.logger.debug('RabbitMQ is enabled', 'RabbitMQModuleConfigFactory');
      options = {
        socketOptions: {
          findServers: () => this.buildUrl()
        }
      };
    }

    return options;
  }

  async getCredentials(): Promise<{ username: string, password: string } | null> {
    this.logger.verbose('Getting RabbitMQ credentials', 'RabbitMQModuleConfigFactory');

    if (this.config.get('RABBITMQ_USERNAME') && this.config.get('RABBITMQ_PASSWORD')) {
      this.logger.debug('Using username and password from env', 'RabbitMQModuleConfigFactory');
      return {
        username: this.config.getOrThrow('RABBITMQ_USERNAME'),
        password: this.config.getOrThrow('RABBITMQ_PASSWORD')
      };
    }

    return null;

  }

  async buildUrl(): Promise<string> {
    this.logger.verbose('Building RabbitMQ url', 'RabbitMQModuleConfigFactory');
    if (this.config.get('RABBITMQ_URI')) {
      this.logger.debug('Using uri from env RABBITMQ_URI', 'RabbitMQModuleConfigFactory');
      return this.config.getOrThrow('RABBITMQ_URI');
    }
    const credentials = await this.getCredentials();
    if (!credentials) {
      throw new Error('No credentials found for RabbitMQ connection');
    }
    const {
      username,
      password
    } = credentials;
    const host = this.config.getOrThrow('RABBITMQ_HOST');
    const port = this.config.getOrThrow('RABBITMQ_PORT');
    const vhost = this.config.getOrThrow('RABBITMQ_VHOST');
    this.logger.debug(
      `Using uri amqp://${ username }:*****@${ host }:${ port }${ CoercePrefix(vhost, '/') }`,
      'RabbitMQModuleConfigFactory'
    );
    return `amqp://${ username }:${ password }@${ host }:${ port }/${ vhost }`;
  }

}
