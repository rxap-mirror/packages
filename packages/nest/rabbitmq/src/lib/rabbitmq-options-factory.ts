import {
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RabbitmqVaultService } from '@rxap/nest-vault';
import { CoercePrefix } from '@rxap/utilities';
import { BaseRmqOptions } from './options';

@Injectable()
export class RabbitmqOptionsFactory {

  @Inject(ConfigService)
  private readonly config!: ConfigService;

  @Inject(Logger)
  private readonly logger!: Logger;

  @Inject(RabbitmqVaultService)
  private readonly vault!: RabbitmqVaultService;

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
      options = {
        socketOptions: {
          findServers: () => this.buildUrl()
        },
        exchangeOptions: {
          durable: true
        }
      };
    }

    return options;
  }

  async getCredentials(): Promise<{ username: string, password: string }> {

    if (this.config.get('RABBITMQ_USERNAME') && this.config.get('RABBITMQ_PASSWORD')) {
      this.logger.debug('Using username and password from env', 'RabbitMQModuleConfigFactory');
      return {
        username: this.config.getOrThrow('RABBITMQ_USERNAME'),
        password: this.config.getOrThrow('RABBITMQ_PASSWORD')
      };
    }

    if (this.config.get('RABBITMQ_VAULT_ROLE')) {
      this.logger.debug('Using vault to get username and password', 'RabbitMQModuleConfigFactory');
      const role = this.config.getOrThrow('RABBITMQ_VAULT_ROLE');
      return this.vault.getCredentials(role, true);
    }

    throw new Error('No credentials found for RabbitMQ connection');

  }

  async buildUrl(): Promise<string> {
    if (this.config.get('RABBITMQ_URI')) {
      this.logger.debug('Using uri from env RABBITMQ_URI', 'RabbitMQModuleConfigFactory');
      return this.config.getOrThrow('RABBITMQ_URI');
    }
    const {
      username,
      password
    } = await this.getCredentials();
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
