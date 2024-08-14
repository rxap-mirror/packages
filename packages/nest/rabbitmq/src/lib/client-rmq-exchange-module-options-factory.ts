import {
  ClientProvider,
  ClientsModuleOptionsFactory,
} from '@nestjs/microservices';
import { ClientRMQExchange } from './client-rmq-exchange';
import { RabbitmqOptionsFactory } from './rabbitmq-options-factory';

export class ClientRmqExchangeModuleOptionsFactory extends RabbitmqOptionsFactory implements ClientsModuleOptionsFactory {

  async createClientOptions(exchange: string = this.config.getOrThrow('RABBITMQ_EXCHANGE')): Promise<ClientProvider> {

    const options = await this.build();

    this.logger.debug(`Using exchange '${ exchange }'`, 'ClientRmqExchangeModuleOptionsFactory');

    return {
      customClass: ClientRMQExchange,
      options: {
        ...options,
        exchange,
      }
    };
  }

}
