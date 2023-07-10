import {
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import {
  ClientProxy,
  ReadPacket,
  WritePacket,
} from '@nestjs/microservices';
import { randomBytes } from 'crypto';
import { SocketIoClientProvider } from './socket-io-client.provider';

@Injectable()
export class SocketIoClientProxyService extends ClientProxy {
  @Inject(Logger)
  private readonly logger!: Logger;
  @Inject(SocketIoClientProvider)
  private readonly client!: SocketIoClientProvider;

  async connect(): Promise<any> {
    this.client.getSocket();
    this.logger.debug('connect client proxy', 'SocketIoClientProxyService');
  }

  async close() {
    this.client.getSocket().disconnect();
    this.logger.debug('connect client proxy', 'SocketIoClientProxyService');
  }

  /**
   * this method use when you use SocketIoClientProxyService.emit
   * @param packet
   * @returns
   */
  async dispatchEvent(packet: ReadPacket): Promise<any> {
    this.client.getSocket().emit(packet.pattern, packet.data);
    return;
  }

  /**
   * this method will be call when use SocketIoClientProxyService.send
   * can be use to implement request-response
   * @param packet
   * @param callback
   * @returns
   */
  publish(
    packet: ReadPacket,
    callback: (packet: WritePacket) => void,
  ): () => void {
    this.logger.debug(
      `publish to pattern '${packet.pattern}'`,
      'SocketIoClientProxyService',
    );
    this.logger.verbose(
      `with data: ` + JSON.stringify(packet.data, undefined, 2),
      'SocketIoClientProxyService',
    );

    const event = randomBytes(64).toString('hex');

    const socket = this.client.getSocket().on(event, (data: unknown) => {
      callback({response: data});
    });

    this.client.getSocket().emit(packet.pattern, {data: packet.data, event});

    return () => socket.off(event, () => {
      this.logger.log('socket off', 'SocketIoClientProxyService');
    });
  }
}
