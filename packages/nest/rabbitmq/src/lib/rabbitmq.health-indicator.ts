import {
  Inject,
  Injectable
} from '@nestjs/common';
import {
  HealthCheckError,
  HealthIndicator,
  HealthIndicatorResult
} from '@nestjs/terminus';
import { ClientRMQExchange } from './client-rmq-exchange';
import { RABBITMQ_EXCHANGE } from './tokens';

@Injectable()
export class RabbitmqHealthIndicator extends HealthIndicator {

  @Inject(RABBITMQ_EXCHANGE)
  private readonly client!: ClientRMQExchange;

  public async isHealthy(): Promise<HealthIndicatorResult> {

    // call the connect method before checking the connection.
    // only on an send or emit method called a connection will be created
    // So it is necessary to call the connect method before checking the connection
    // for the case when the connection is not established yet.
    await this.client.connect();
    const isConnected = this.client.isConnected();

    if (isConnected) {
      return this.getStatus('rabbitmq', true);
    }

    throw new HealthCheckError(
      'Connection to RabbitMQ is not established!',
      this.getStatus('rabbitmq', false)
    );
  }
}
