import { ClientsModuleOptionsFactory } from '@nestjs/microservices';
import { CustomClientOptions } from '@nestjs/microservices/interfaces';
import { ClientRMQExchange } from './client-rmq-exchange';
import { ExchangeRmqOptions } from './options';
import { RabbitmqOptionsFactory } from './rabbitmq-options-factory';

export interface ClientRmqExchangeModuleOptions extends CustomClientOptions {
  options: ExchangeRmqOptions
}

export class ClientRmqExchangeModuleOptionsFactory extends RabbitmqOptionsFactory implements ClientsModuleOptionsFactory {

  async createClientOptions(
    name: string = this.config.getOrThrow('RABBITMQ_EXCHANGE_NAME'),
    type: string = this.config.get('RABBITMQ_EXCHANGE_TYPE', 'topic'),
  ): Promise<ClientRmqExchangeModuleOptions> {

    const options = await this.build();

    this.logger.debug(`Using exchange '${ name }' with type '${type}'`, 'ClientRmqExchangeModuleOptionsFactory');

    return {
      customClass: ClientRMQExchange,
      options: {
        ...options,
        exchange: {
          name,
          type,
        },
      }
    };
  }

}
