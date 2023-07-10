import {
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BehaviorSubject,
  Subject,
} from 'rxjs';
import {
  io,
  Socket,
} from 'socket.io-client';

export enum DisconnectReason {
  /**
   * The server has forcefully disconnected the socket with socket.disconnect()
   */
  IO_SERVER_DISCONNECT = 'io server disconnect',

  /**
   * The socket was manually disconnected using socket.disconnect()
   */
  IO_CLIENT_DISCONNECT = 'io client disconnect',

  /**
   * The server did not send a PING within the pingInterval + pingTimeout range
   */
  PING_TIMEOUT = 'ping timeout',

  /**
   * The connection was closed (example: the user has lost connection, or the network was changed from WiFi to 4G)
   */
  TRANSPORT_CLOSE = 'transport close',

  /**
   * The connection has encountered an error (example: the server was killed during a HTTP long-polling cycle)
   */
  TRANSPORT_ERROR = 'transport error',
}

@Injectable()
export class SocketIoClientProvider {

  public readonly disconnected$ = new Subject<DisconnectReason>();
  public readonly connected$ = new Subject<void>();
  public readonly isConnected$ = new BehaviorSubject(false);
  @Inject(Logger)
  private readonly logger!: Logger;
  @Inject(ConfigService)
  private readonly config!: ConfigService;
  private socket?: Socket;

  getSocket = () => {
    if (!this.socket) {
      return this.connect();
    }
    return this.socket;
  };

  private connect() {
    this.socket = io(this.config.getOrThrow('COORDINATOR_SOCKET'), {
      transportOptions: {
        polling: {
          extraHeaders: {
            Authorization: `Bearer ${this.config.getOrThrow('COORDINATOR_JWT')}`,
          },
        },
      },
    });
    this.socket.on('disconnect', (reason: unknown) => {
      this.logger.error('Socket is disconnected', 'SocketIoClientProvider');
      this.disconnected$.next(reason as DisconnectReason);
      this.isConnected$.next(false);
      if (reason == DisconnectReason.IO_SERVER_DISCONNECT) {
        this.logger.error('Server closed the connection. Try to reconnect', 'SocketIoClientProvider');
        this.socket?.connect();
      }
    });
    this.socket.on('connect', () => {
      this.logger.log('Socket is connected', 'SocketIoClientProvider');
      this.connected$.next();
      this.isConnected$.next(true);
    });
    this.socket.on('connect_error', () => {
      this.logger.error('Connection error', 'SocketIoClientProvider');
    });
    return this.socket;
  }
}
