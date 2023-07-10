import {
  CustomTransportStrategy,
  Server,
} from '@nestjs/microservices';
import { Socket } from 'socket.io-client';
import { Logger } from '@nestjs/common';

export class SocketIoClientStrategy
  extends Server
  implements CustomTransportStrategy {

  constructor(
    private readonly client: Socket,
    protected override readonly logger: Logger,
  ) {
    super();
  }

  /**
   * This method is triggered when you run "app.listen()".
   */
  listen(callback: () => void) {
    this.client.on('connection', () => {
      this.logger.log('connection', 'SocketIoClientStrategy');
    });
    this.client.on('error', (error: unknown) => {
      if (error instanceof Error) {
        this.logger.error(error.message, 'SocketIoClientStrategy');
      } else {
        this.logger.error(error);
      }
    });

    this.messageHandlers.forEach((handler, pattern) => {
      this.client.on(pattern, (data: any) => {
        handler(data, this.client);
      });
    });

    callback();
  }

  /**
   * This method is triggered on application shutdown.
   */
  close() {
    this.client.disconnect();
  }
}
