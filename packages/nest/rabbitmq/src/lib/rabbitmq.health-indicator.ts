import {
  Inject,
  Injectable
} from '@nestjs/common';
import {
  HealthIndicatorResult,
  HealthIndicatorService
} from '@nestjs/terminus';
import { ClientRMQExchange } from './client-rmq-exchange';
import { RABBITMQ_EXCHANGE } from './tokens';

@Injectable()
export class RabbitmqHealthIndicator {

  @Inject(RABBITMQ_EXCHANGE)
  private readonly client!: ClientRMQExchange;

  @Inject(HealthIndicatorService)
  private readonly healthIndicatorService!: HealthIndicatorService;

  public async isHealthy(): Promise<HealthIndicatorResult> {

    const indicator = this.healthIndicatorService.check('rabbitmq');

    // call the connect method before checking the connection.
    // only on an send or emit method called a connection will be created
    // So it is necessary to call the connect method before checking the connection
    // for the case when the connection is not established yet.
    await this.client.connect();
    const isConnected = this.client.isConnected();

    if (isConnected) {
      return indicator.up();
    }

    return indicator.down({ message: 'Connection to RabbitMQ is not established!' });
  }
}
