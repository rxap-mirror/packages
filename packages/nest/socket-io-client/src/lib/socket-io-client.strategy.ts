import {
  CustomTransportStrategy,
  Server,
} from '@nestjs/microservices';
import { Socket } from 'socket.io-client';
import {
  Logger,
  NotImplementedException,
} from '@nestjs/common';

/**
 * SocketIoClientStrategy is a custom transport strategy that allows
 * a Socket.IO client to communicate with the server. It extends the Server class
 * and implements the CustomTransportStrategy interface.
 */
export class SocketIoClientStrategy
  extends Server
  implements CustomTransportStrategy {

  constructor(
    private readonly client: Socket,
    protected override readonly logger: Logger,
  ) {
    super();
  }

  override unwrap<T>(): T {
    throw new NotImplementedException();
  }

  override on() {
    throw new NotImplementedException();
  }

  /**
   * This method is triggered when you run "app.listen()".
   */
  listen(callback: () => void) {
    this.client.on('connect', () => {
      this.logger.log('connected', 'SocketIoClientStrategy');
    });
    this.client.on('error', (error: unknown) => {
      if (error && typeof error === 'object' && (error as any).message) {
        this.logger.error((error as any).message, 'SocketIoClientStrategy');
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
