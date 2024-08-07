import {
  ClientProvider,
  ClientsModuleOptionsFactory,
} from '@nestjs/microservices';
import { ClientRMQExchange } from './client-rmq-exchange';
import { RabbitmqOptionsFactory } from './rabbitmq-options-factory';

export class ClientRmqExchangeModuleOptionsFactory extends RabbitmqOptionsFactory implements ClientsModuleOptionsFactory {

  async createClientOptions(): Promise<ClientProvider> {

    const options = await this.build();

    return {
      customClass: ClientRMQExchange,
      options: {
        ...options,
        exchange: this.config.getOrThrow('RABBITMQ_EXCHANGE'),
        exchangeOptions: {
          durable: true
        }
      }
    };
  }

}
